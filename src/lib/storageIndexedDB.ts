/**
 * IndexedDB storage wrapper for offline gym session caching & sync queue,
 * eliminating LocalStorage 5MB quota restrictions.
 */

const DB_NAME = 'AeroGymOfflineDB';
const DB_VERSION = 2;
export const STORE_SESSIONS = 'sessions_cache';
export const STORE_HEALTH = 'health_cache';
export const STORE_SYNC_QUEUE = 'sync_queue';

export interface SyncQueueAction {
  id: string;
  type: 'SAVE_SESSION' | 'UPDATE_SESSION' | 'DELETE_SESSION';
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
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setItemIndexedDB<T>(storeName: string, key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(typeof value === 'object' && value !== null ? { ...value, id: key } : { id: key, data: value });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('IndexedDB setItem fallback to LocalStorage:', e);
    localStorage.setItem(`idb_fallback_${storeName}_${key}`, JSON.stringify(value));
  }
}

export async function getItemIndexedDB<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const res = request.result;
        if (!res) resolve(null);
        else resolve(res.data !== undefined ? res.data : res);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    const fallback = localStorage.getItem(`idb_fallback_${storeName}_${key}`);
    return fallback ? JSON.parse(fallback) : null;
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
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Error removing sync action:', e);
  }
}
