/**
 * Módulo de Cifrado Local para datos de salud sensibles usando Web Crypto API (AES-GCM 256-bit).
 */

const LEGACY_SECRET_SALT = 'AeroGymLocalPrivKeySalt-v3';

function getSubtleCrypto(): SubtleCrypto | null {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return window.crypto.subtle;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    return globalThis.crypto.subtle;
  }
  return null;
}

function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.getRandomValues(array);
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto.getRandomValues(array);
  }
  return array;
}

/**
 * Genera una sal criptográficamente segura (CSPRNG) de 16 bytes.
 */
export function generateUserSalt(): string {
  const bytes = getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Obtiene o crea una sal única persistente para el usuario en almacenamiento local.
 */
export function getOrCreateUserSalt(userSecret: string): string {
  const storageKey = `aerogym_salt_${userSecret}`;
  if (typeof window !== 'undefined' && window.localStorage) {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const newSalt = generateUserSalt();
    window.localStorage.setItem(storageKey, newSalt);
    return newSalt;
  }
  return LEGACY_SECRET_SALT;
}

async function deriveKey(secret: string, customSalt?: string): Promise<CryptoKey | null> {
  const subtle = getSubtleCrypto();
  if (!subtle) return null;

  const saltString = customSalt || getOrCreateUserSalt(secret);
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(secret + saltString),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(saltString),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData<T>(data: T, userSecret: string, customSalt?: string): Promise<string> {
  const subtle = getSubtleCrypto();
  const key = await deriveKey(userSecret, customSalt);

  if (!subtle || !key) {
    return JSON.stringify(data);
  }

  const iv = getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(data));

  const encryptedBuffer = await subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );

  const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encryptedBuffer), iv.length);

  return btoa(String.fromCharCode(...combined));
}

export async function decryptData<T>(
  encryptedBase64: string,
  userSecret: string,
  customSalt?: string
): Promise<T | null> {
  try {
    const subtle = getSubtleCrypto();
    let key = await deriveKey(userSecret, customSalt);

    if (!subtle || !key) {
      return JSON.parse(encryptedBase64);
    }

    const combined = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const dataBuffer = combined.slice(12);

    try {
      const decryptedBuffer = await subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
      );

      const dec = new TextDecoder();
      return JSON.parse(dec.decode(decryptedBuffer));
    } catch {
      // Fallback: Si falla con la sal dinámica, intentar desencriptar con la sal legada
      if (!customSalt) {
        const legacyKey = await deriveKey(userSecret, LEGACY_SECRET_SALT);
        if (legacyKey) {
          const decryptedBuffer = await subtle.decrypt(
            { name: 'AES-GCM', iv },
            legacyKey,
            dataBuffer
          );
          const dec = new TextDecoder();
          return JSON.parse(dec.decode(decryptedBuffer));
        }
      }
      return null;
    }
  } catch (e) {
    return null;
  }
}

