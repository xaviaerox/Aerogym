/**
 * persistentStorageService.ts — Servicio de Persistencia de Almacenamiento Web.
 * Garantiza que IndexedDB y LocalStorage no sean purgados por el sistema operativo.
 */

export async function requestPersistentStorage(): Promise<{
  persisted: boolean;
  granted: boolean;
}> {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return { persisted: false, granted: false };
  }

  try {
    const isAlreadyPersisted = await navigator.storage.persisted();
    if (isAlreadyPersisted) {
      return { persisted: true, granted: true };
    }

    const isGranted = await navigator.storage.persist();
    return { persisted: isGranted, granted: isGranted };
  } catch (err) {
    console.warn('Error al solicitar persistencia de almacenamiento:', err);
    return { persisted: false, granted: false };
  }
}
