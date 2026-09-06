/**
 * IndexedDB storage wrapper for offline gym session caching & sync queue,
 * eliminating LocalStorage 5MB quota restrictions.
 */

const DB_NAME = 'AeroGymOfflineDB';
const DB_VERSION = 3;
export const STORE_SESSIONS = 'sessions_cache';
export const STORE_HEALTH = 'health_cache';
export const STORE_HABITS = 'habits_cache';
export const STORE_HABIT_LOGS = 'habit_logs_cache';
export const STORE_SYNC_QUEUE = 'sync_queue';

export interface SyncQueueAction {
  id: string;
  type:
    | 'SAVE_SESSION'
    | 'UPDATE_SESSION'
    | 'DELETE_SESSION'
    | 'SAVE_HABIT'
    | 'UPDATE_HABIT'
    | 'DELETE_HABIT'
    | 'TOGGLE_HABIT_LOG';
  payload: any;
  timestamp: string;
  retryCount: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_HEALTH)) {
        db.createObjectStore(STORE_HEALTH, { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains(STORE_HABITS)) {
        db.createObjectStore(STORE_HABITS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_HABIT_LOGS)) {
        db.createObjectStore(STORE_HABIT_LOGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

import { encryptData, decryptData } from './cryptoStorage';

const LOCAL_STORAGE_SECRET = 'AeroGymVaultSecV3';
const ENCRYPTION_PREFIX = 'enc:v1:';
const ENCRYPTED_STORES = new Set([STORE_HEALTH, STORE_SESSIONS, STORE_HABITS, STORE_SYNC_QUEUE]);

export async function setItemIndexedDB<T>(storeName: string, key: string, value: T): Promise<void> {
  try {
    let payloadToPersist: any = value;
    let isEncrypted = false;

    if (ENCRYPTED_STORES.has(storeName)) {
      try {
        const cipher = await encryptData(value, LOCAL_STORAGE_SECRET);
        payloadToPersist = ENCRYPTION_PREFIX + cipher;
        isEncrypted = true;
      } catch (e) {
        console.warn('CryptoStorage encryption fallback to plain:', e);
      }
    }

    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const toStore = isEncrypted
      ? { id: key, encrypted: true, data: payloadToPersist }
      : typeof value === 'object' && value !== null && !Array.isArray(value)
      ? { ...value, id: key }
      : { id: key, data: value };

    store.put(toStore);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB setItem fallback to LocalStorage:', e);
    localStorage.setItem(`idb_fallback_${storeName}_${key}`, JSON.stringify(value));
  }
}

export async function bulkSetIndexedDB<T>(storeName: string, items: { key: string; value: T }[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const item of items) {
      const val = item.value;
      const toStore =
        typeof val === 'object' && val !== null && !Array.isArray(val)
          ? { ...val, id: item.key }
          : { id: item.key, data: val };
      store.put(toStore);
    }
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB bulkSet fallback to LocalStorage:', e);
    for (const item of items) {
      localStorage.setItem(`idb_fallback_${storeName}_${item.key}`, JSON.stringify(item.value));
    }
  }
}

export async function getItemIndexedDB<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = async () => {
        const res = request.result;
        if (!res) {
          resolve(null);
          return;
        }

        if (res.encrypted && typeof res.data === 'string' && res.data.startsWith(ENCRYPTION_PREFIX)) {
          const rawCipher = res.data.slice(ENCRYPTION_PREFIX.length);
          const decrypted = await decryptData<T>(rawCipher, LOCAL_STORAGE_SECRET);
          resolve(decrypted !== null ? decrypted : (res.data as unknown as T));
          return;
        }

        if (res.data !== undefined) {
          resolve(res.data);
          return;
        }
        // Fallback recovery: if an array was saved as an object with numeric keys ('0', '1', ...)
        if (typeof res === 'object' && '0' in res) {
          const { id, ...items } = res;
          resolve(Object.values(items) as unknown as T);
          return;
        }
        resolve(res);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const fallback = localStorage.getItem(`idb_fallback_${storeName}_${key}`);
    if (!fallback) return null;
    try {
      const parsed = JSON.parse(fallback);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && '0' in parsed) {
        const { id, ...items } = parsed;
        return Object.values(items) as unknown as T;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}

export async function enqueueSyncAction(action: Omit<SyncQueueAction, 'id' | 'timestamp' | 'retryCount'>): Promise<SyncQueueAction> {
  const fullAction: SyncQueueAction = {
    ...action,
    id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };
  await setItemIndexedDB(STORE_SYNC_QUEUE, fullAction.id, fullAction);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aerogym:sync-queue-updated'));
  }
  return fullAction;
}

export async function getSyncQueue(): Promise<SyncQueueAction[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readonly');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    const request = store.getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    return [];
  }
}

export async function removeSyncAction(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aerogym:sync-queue-updated'));
        }
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Error removing sync action:', e);
  }
}

export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
    const store = tx.objectStore(STORE_SYNC_QUEUE);
    store.clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aerogym:sync-queue-updated'));
        }
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Error clearing sync queue:', e);
  }
}
