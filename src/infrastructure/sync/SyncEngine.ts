import { getSyncQueue, removeSyncAction, setItemIndexedDB, type SyncQueueAction } from '../../lib/storageIndexedDB';
import { supabase } from '../supabase/client';

export class SyncEngine {
  private isProcessing = false;
  private listeners: Set<(isSyncing: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  public subscribe(listener: (isSyncing: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(isSyncing: boolean): void {
    this.listeners.forEach((listener) => listener(isSyncing));
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  public async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isProcessing || !this.isOnline()) {
      return { processed: 0, failed: 0 };
    }

    this.isProcessing = true;
    this.notifyListeners(true);

    let processed = 0;
    let failed = 0;

    try {
      const queue = await getSyncQueue();
      for (const action of queue) {
        const success = await this.executeAction(action);
        if (success) {
          await removeSyncAction(action.id);
          processed++;
        } else {
          action.retryCount += 1;
          if (action.retryCount > 5) {
            // Eliminar acción fallida tras 5 reintentos
            await removeSyncAction(action.id);
          } else {
            await setItemIndexedDB('sync_queue', action.id, action);
          }
          failed++;
        }
      }
    } catch (e) {
      console.error('Error processing sync queue:', e);
    } finally {
      this.isProcessing = false;
      this.notifyListeners(false);
    }

    return { processed, failed };
  }

  private async executeAction(action: SyncQueueAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'SAVE_SESSION': {
          const { session, sets } = action.payload;
          const { data: sessionData, error: sessionError } = await supabase
            .from('workout_sessions')
            .insert(session)
            .select()
            .single();

          if (sessionError || !sessionData) return false;

          if (sets && sets.length > 0) {
            const setsToInsert = sets.map((s: any) => ({
              ...s,
              session_id: sessionData.id,
            }));
            const { error: setsError } = await supabase.from('workout_sets').insert(setsToInsert);
            if (setsError) return false;
          }
          return true;
        }

        case 'UPDATE_SESSION': {
          const { sessionId, updates } = action.payload;
          const { error } = await supabase.from('workout_sessions').update(updates).eq('id', sessionId);
          return !error;
        }

        case 'DELETE_SESSION': {
          const { sessionId } = action.payload;
          const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId);
          return !error;
        }

        default:
          return true;
      }
    } catch (e) {
      console.error(`Error executing sync action ${action.type}:`, e);
      return false;
    }
  }
}

export const syncEngine = new SyncEngine();
