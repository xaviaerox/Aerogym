/**
 * backupService.ts — Full Data Export, Encryption & Backup Restoration Service.
 *
 * Allows users to export their complete workout history, routines, profile,
 * health logs, and body measurements into a versioned JSON file (plain or AES-256-GCM encrypted),
 * and restore them smoothly.
 */

import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise, DailyHealth, BodyMeasurement, Profile } from '../infrastructure/supabase/types';

export interface FullAppBackup {
  version: string;
  exportedAt: string;
  profile?: Partial<Profile>;
  sessions: WorkoutSession[];
  workoutSetsHistory: WorkoutSet[];
  routines: (Routine & { exercises: RoutineExercise[] })[];
  dailyHealth: DailyHealth[];
  bodyMeasurements: BodyMeasurement[];
}

export interface EncryptedBackupContainer {
  version: string;
  encrypted: true;
  salt: string; // hex
  iv: string; // hex
  ciphertext: string; // base64
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class BackupService {
  /**
   * Generates a structured JSON backup object from user state.
   */
  public generateBackup(data: {
    profile?: Partial<Profile> | null;
    sessions: WorkoutSession[];
    workoutSetsHistory: WorkoutSet[];
    routines: (Routine & { exercises: RoutineExercise[] })[];
    dailyHealth: DailyHealth[];
    bodyMeasurements: BodyMeasurement[];
  }): FullAppBackup {
    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      profile: data.profile || undefined,
      sessions: data.sessions || [],
      workoutSetsHistory: data.workoutSetsHistory || [],
      routines: data.routines || [],
      dailyHealth: data.dailyHealth || [],
      bodyMeasurements: data.bodyMeasurements || [],
    };
  }

  /**
   * Encrypts a backup object using PBKDF2 (100,000 iterations, SHA-256) + AES-256-GCM.
   */
  public async encryptBackup(backup: FullAppBackup, passphrase: string): Promise<EncryptedBackupContainer> {
    const cryptoObj = globalThis.crypto;
    const salt = cryptoObj.getRandomValues(new Uint8Array(16));
    const iv = cryptoObj.getRandomValues(new Uint8Array(12));

    const enc = new TextEncoder();
    const keyMaterial = await cryptoObj.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await cryptoObj.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const jsonBytes = enc.encode(JSON.stringify(backup));
    const ciphertext = await cryptoObj.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      jsonBytes
    );

    return {
      version: '2.0.0',
      encrypted: true,
      salt: bufferToHex(salt.buffer),
      iv: bufferToHex(iv.buffer),
      ciphertext: bufferToBase64(ciphertext),
    };
  }

  /**
   * Decrypts an encrypted backup container.
   */
  public async decryptBackup(
    container: EncryptedBackupContainer,
    passphrase: string
  ): Promise<{ valid: boolean; backup?: FullAppBackup; error?: string }> {
    try {
      const cryptoObj = globalThis.crypto;
      const salt = hexToBuffer(container.salt);
      const iv = hexToBuffer(container.iv);
      const ciphertext = base64ToBuffer(container.ciphertext);

      const enc = new TextEncoder();
      const keyMaterial = await cryptoObj.subtle.importKey(
        'raw',
        enc.encode(passphrase),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      const key = await cryptoObj.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const decryptedBytes = await cryptoObj.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      const jsonStr = dec.decode(decryptedBytes);
      return this.validateBackupJSON(jsonStr);
    } catch (e) {
      return { valid: false, error: 'Contraseña incorrecta o archivo de copia corrupto.' };
    }
  }

  /**
   * Triggers a browser download of the backup JSON file.
   */
  public downloadBackupFile(backup: FullAppBackup | EncryptedBackupContainer, filename?: string): void {
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const isEncrypted = (backup as any).encrypted === true;
    const name = filename || `aerogym-backup-${isEncrypted ? 'encrypted-' : ''}${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates an imported JSON string to ensure it follows the FullAppBackup structure.
   */
  public validateBackupJSON(jsonStr: string): { valid: boolean; backup?: FullAppBackup; isEncrypted?: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'El archivo no contiene un objeto JSON válido.' };
      }

      if (parsed.encrypted === true && parsed.salt && parsed.iv && parsed.ciphertext) {
        return { valid: true, isEncrypted: true };
      }

      if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.workoutSetsHistory)) {
        return { valid: false, error: 'El archivo no tiene la estructura de copia de seguridad de AeroGym.' };
      }

      return { valid: true, isEncrypted: false, backup: parsed as FullAppBackup };
    } catch (e) {
      return { valid: false, error: 'Error al parsear el archivo JSON.' };
    }
  }
}

export const backupService = new BackupService();
