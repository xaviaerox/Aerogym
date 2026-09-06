import { getSyncQueue, removeSyncAction, setItemIndexedDB, type SyncQueueAction } from '../../lib/storageIndexedDB';
import { supabase } from '../supabase/client';
import type { WorkoutSet } from '../supabase/types';

function isUnrecoverableError(error: any): boolean {
  if (!error) return false;
  const code = String(error.code || error.status || '');
  if (code === '42501' || code === '42P01' || code === '401' || code === '403') {
    return true;
  }
  const message = String(error.message || '').toLowerCase();
  if (
    message.includes('violates row-level security') ||
    message.includes('does not exist') ||
    message.includes('jwt expired') ||
    message.includes('invalid token')
  ) {
    return true;
  }
  return false;
}

function isGuestAction(action: SyncQueueAction): boolean {
  const payload = action.payload;
  if (!payload) return false;
  const userId =
    payload.session?.user_id ||
    payload.habit?.user_id ||
    payload.logItem?.user_id ||
    payload.updates?.user_id ||
    payload.userId;
  if (typeof userId === 'string' && userId.startsWith('guest-')) {
    return true;
  }
  return false;
}

export class SyncEngine {
  private isProcessing = false;
  private listeners: Set<(isSyncing: boolean) => void> = new Set();
  private syncTimeout: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.triggerSync(100));
      window.addEventListener('aerogym:sync-queue-updated', () => this.triggerSync(500));

      // Auto-reintento periódico cada 30 segundos si hay elementos y hay conexión
      if (typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'test') {
        setInterval(() => {
          if (this.isOnline() && !this.isProcessing) {
            this.getQueueLength().then((len) => {
              if (len > 0) {
                this.triggerSync(0);
              }
            }).catch(() => {});
          }
        }, 30000);

        // Disparo al inicio tras cargar la app
        setTimeout(() => {
          if (this.isOnline()) {
            this.triggerSync(500);
          }
        }, 1500);
      }
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

  public async getQueueLength(): Promise<number> {
    try {
      const queue = await getSyncQueue();
      return queue.length;
    } catch {
      return 0;
    }
  }

  public triggerSync(delayMs = 300): void {
    if (typeof window === 'undefined' || !this.isOnline()) return;
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.syncTimeout = null;
      this.processQueue().catch((err) => {
        console.warn('[SyncEngine] triggerSync error:', err);
      });
    }, delayMs);
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
        // 1. Descartar de inmediato acciones que pertenezcan a usuario invitado
        if (isGuestAction(action)) {
          console.warn(`[SyncEngine] Purgando acción huérfana de invitado ${action.id} (${action.type})`);
          await removeSyncAction(action.id);
          processed++;
          continue;
        }

        const result = await this.executeAction(action);
        if (result.success) {
          await removeSyncAction(action.id);
          processed++;
        } else {
          // 2. Si el error es permanente (RLS 42501, tabla inexistente 42P01, auth inválida)
          if (result.unrecoverable) {
            console.warn(
              `[SyncEngine] Descartando acción ${action.id} (${action.type}) por error irrecuperable:`,
              result.error
            );
            await removeSyncAction(action.id);
            processed++;
          } else {
            action.retryCount = (action.retryCount || 0) + 1;
            if (action.retryCount >= 3) {
              console.warn(
                `[SyncEngine] Eliminando acción fallida tras ${action.retryCount} reintentos:`,
                action.id,
                action.type
              );
              await removeSyncAction(action.id);
            } else {
              await setItemIndexedDB('sync_queue', action.id, action);
            }
            failed++;
          }
        }
      }
    } catch (e) {
      console.error('[SyncEngine] Error processing sync queue:', e);
    } finally {
      this.isProcessing = false;
      this.notifyListeners(false);
    }

    return { processed, failed };
  }

  private async executeAction(action: SyncQueueAction): Promise<{ success: boolean; unrecoverable?: boolean; error?: any }> {
    try {
      switch (action.type) {
        case 'SAVE_SESSION': {
          const { session, sets } = action.payload;
          if (session?.user_id?.startsWith('guest-')) {
            return { success: false, unrecoverable: true };
          }

          const { data: sessionData, error: sessionError } = await supabase
            .from('workout_sessions')
            .insert(session)
            .select()
            .single();

          if (sessionError || !sessionData) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(sessionError),
              error: sessionError,
            };
          }

          if (sets && sets.length > 0) {
            const setsToInsert = sets.map((s: Partial<WorkoutSet>) => ({
              ...s,
              session_id: sessionData.id,
            }));
            const { error: setsError } = await supabase.from('workout_sets').insert(setsToInsert);
            if (setsError) {
              return {
                success: false,
                unrecoverable: isUnrecoverableError(setsError),
                error: setsError,
              };
            }
          }
          return { success: true };
        }

        case 'UPDATE_SESSION': {
          const { sessionId, updates } = action.payload;
          const { error } = await supabase.from('workout_sessions').update(updates).eq('id', sessionId);
          if (error) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(error),
              error,
            };
          }
          return { success: true };
        }

        case 'DELETE_SESSION': {
          const { sessionId } = action.payload;
          const { error } = await supabase.from('workout_sessions').delete().eq('id', sessionId);
          if (error) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(error),
              error,
            };
          }
          return { success: true };
        }

        case 'SAVE_HABIT': {
          const { habit } = action.payload;
          if (habit?.user_id?.startsWith('guest-')) {
            return { success: false, unrecoverable: true };
          }
          const { error } = await supabase.from('habits').insert(habit);
          if (error) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(error),
              error,
            };
          }
          return { success: true };
        }

        case 'UPDATE_HABIT': {
          const { habitId, updates } = action.payload;
          const { error } = await supabase.from('habits').update(updates).eq('id', habitId);
          if (error) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(error),
              error,
            };
          }
          return { success: true };
        }

        case 'DELETE_HABIT': {
          const { habitId } = action.payload;
          const { error } = await supabase.from('habits').update({ is_archived: true }).eq('id', habitId);
          if (error) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(error),
              error,
            };
          }
          return { success: true };
        }

        case 'TOGGLE_HABIT_LOG': {
          const { logItem } = action.payload;
          if (logItem?.user_id?.startsWith('guest-')) {
            return { success: false, unrecoverable: true };
          }
          const { error } = await supabase
            .from('habit_logs')
            .upsert(
              {
                habit_id: logItem.habit_id,
                user_id: logItem.user_id,
                date: logItem.date,
                completed: logItem.completed,
                notes: logItem.notes,
                updated_at: logItem.updated_at,
              },
              { onConflict: 'habit_id,date' }
            );
          if (error) {
            return {
              success: false,
              unrecoverable: isUnrecoverableError(error),
              error,
            };
          }
          return { success: true };
        }

        default:
          return { success: true };
      }
    } catch (e: any) {
      console.error(`[SyncEngine] Error executing sync action ${action.type}:`, e);
      return {
        success: false,
        unrecoverable: isUnrecoverableError(e),
        error: e,
      };
    }
  }
}

export const syncEngine = new SyncEngine();
