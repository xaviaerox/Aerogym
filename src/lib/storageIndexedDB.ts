/**
 * IndexedDB storage wrapper for offline gym session caching,
 * eliminating LocalStorage 5MB quota restrictions.
 */

const DB_NAME = 'AeroGymOfflineDB';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions_cache';
const STORE_HEALTH = 'health_cache';

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
