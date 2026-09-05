import { supabase } from '../supabase/client';
import type { Habit, HabitLog } from '../supabase/types';
import type { IHabitRepository } from './IHabitRepository';
import { syncEngine } from '../sync/SyncEngine';
import {
  enqueueSyncAction,
  getItemIndexedDB,
  setItemIndexedDB,
  STORE_HABITS,
  STORE_HABIT_LOGS,
} from '../../lib/storageIndexedDB';

export class SupabaseHabitRepository implements IHabitRepository {
  private isGuest(userId: string): boolean {
    return userId.startsWith('guest-');
  }

  async fetchHabits(userId: string): Promise<Habit[]> {
    if (syncEngine.isOnline() && !this.isGuest(userId)) {
      try {
        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .eq('is_archived', false)
          .order('order_index', { ascending: true });

        if (!error && data) {
          await setItemIndexedDB(STORE_HABITS, `user_${userId}`, data);
          return data as Habit[];
        }
      } catch (e) {
        console.warn('Network error fetching habits, falling back to cache:', e);
      }
    }

    const cached = await getItemIndexedDB<Habit[]>(STORE_HABITS, `user_${userId}`);
    return cached || [];
  }

  async saveHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit> {
    const tempId = `habit-${Date.now()}`;
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habit,
      id: tempId,
      created_at: now,
      updated_at: now,
    };

    // Actualizar cache local
    const cached = (await getItemIndexedDB<Habit[]>(STORE_HABITS, `user_${habit.user_id}`)) || [];
    await setItemIndexedDB(STORE_HABITS, `user_${habit.user_id}`, [...cached, newHabit]);

    if (!syncEngine.isOnline() || this.isGuest(habit.user_id)) {
      if (!this.isGuest(habit.user_id)) {
        await enqueueSyncAction({
          type: 'SAVE_HABIT',
          payload: { habit: newHabit },
        });
      }
      return newHabit;
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();

      if (error || !data) {
        await enqueueSyncAction({
          type: 'SAVE_HABIT',
          payload: { habit: newHabit },
        });
        return newHabit;
      }

      // Reemplazar id temporal en cache local
      const updatedCache = cached.map((h) => (h.id === tempId ? (data as Habit) : h));
      if (!updatedCache.some((h) => h.id === data.id)) {
        updatedCache.push(data as Habit);
      }
      await setItemIndexedDB(STORE_HABITS, `user_${habit.user_id}`, updatedCache);
      return data as Habit;
    } catch (e) {
      await enqueueSyncAction({
        type: 'SAVE_HABIT',
        payload: { habit: newHabit },
      });
      return newHabit;
    }
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    // Actualizar en cache local
    const userId = updates.user_id;
    if (userId) {
      const cached = (await getItemIndexedDB<Habit[]>(STORE_HABITS, `user_${userId}`)) || [];
      const updatedCache = cached.map((h) =>
        h.id === habitId ? { ...h, ...updates, updated_at: new Date().toISOString() } : h
      );
      await setItemIndexedDB(STORE_HABITS, `user_${userId}`, updatedCache);
    }

    if (!syncEngine.isOnline() || (userId && this.isGuest(userId))) {
      if (userId && !this.isGuest(userId)) {
        await enqueueSyncAction({
          type: 'UPDATE_HABIT',
          payload: { habitId, updates },
        });
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('habits')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', habitId);

      if (error) throw error;
    } catch (e) {
      await enqueueSyncAction({
        type: 'UPDATE_HABIT',
        payload: { habitId, updates },
      });
    }
  }

  async deleteHabit(habitId: string): Promise<void> {
    if (!syncEngine.isOnline()) {
      await enqueueSyncAction({
        type: 'DELETE_HABIT',
        payload: { habitId },
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('habits')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', habitId);

      if (error) throw error;
    } catch (e) {
      await enqueueSyncAction({
        type: 'DELETE_HABIT',
        payload: { habitId },
      });
    }
  }

  async reorderHabits(userId: string, habitIds: string[]): Promise<void> {
    const cached = (await getItemIndexedDB<Habit[]>(STORE_HABITS, `user_${userId}`)) || [];
    const reordered = habitIds
      .map((id, index) => {
        const found = cached.find((h) => h.id === id);
        return found ? { ...found, order_index: index } : null;
      })
      .filter((h): h is Habit => h !== null);

    await setItemIndexedDB(STORE_HABITS, `user_${userId}`, reordered);

    if (!syncEngine.isOnline() || this.isGuest(userId)) return;

    try {
      for (let i = 0; i < habitIds.length; i++) {
        await supabase
          .from('habits')
          .update({ order_index: i, updated_at: new Date().toISOString() })
          .eq('id', habitIds[i]);
      }
    } catch (e) {
      console.warn('Error syncing habit reordering:', e);
    }
  }

  async fetchHabitLogs(userId: string, startDate?: string, endDate?: string): Promise<HabitLog[]> {
    if (syncEngine.isOnline() && !this.isGuest(userId)) {
      try {
        let query = supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;
        if (!error && data) {
          await setItemIndexedDB(STORE_HABIT_LOGS, `user_${userId}`, data);
          return data as HabitLog[];
        }
      } catch (e) {
        console.warn('Network error fetching habit logs, falling back to cache:', e);
      }
    }

    const cached = await getItemIndexedDB<HabitLog[]>(STORE_HABIT_LOGS, `user_${userId}`);
    return cached || [];
  }

  async toggleHabitLog(
    userId: string,
    habitId: string,
    date: string,
    completed: boolean,
    notes?: string | null
  ): Promise<HabitLog> {
    const tempId = `log-${habitId}-${date}`;
    const now = new Date().toISOString();
    const logItem: HabitLog = {
      id: tempId,
      habit_id: habitId,
      user_id: userId,
      date,
      completed,
      notes: notes ?? null,
      created_at: now,
      updated_at: now,
    };

    // Actualizar cache local
    const cached = (await getItemIndexedDB<HabitLog[]>(STORE_HABIT_LOGS, `user_${userId}`)) || [];
    const filtered = cached.filter((l) => !(l.habit_id === habitId && l.date === date));
    const updatedCache = [logItem, ...filtered];
    await setItemIndexedDB(STORE_HABIT_LOGS, `user_${userId}`, updatedCache);

    if (!syncEngine.isOnline() || this.isGuest(userId)) {
      if (!this.isGuest(userId)) {
        await enqueueSyncAction({
          type: 'TOGGLE_HABIT_LOG',
          payload: { logItem },
        });
      }
      return logItem;
    }

    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          {
            habit_id: habitId,
            user_id: userId,
            date,
            completed,
            notes: notes ?? null,
            updated_at: now,
          },
          { onConflict: 'habit_id,date' }
        )
        .select()
        .single();

      if (error || !data) {
        await enqueueSyncAction({
          type: 'TOGGLE_HABIT_LOG',
          payload: { logItem },
        });
        return logItem;
      }

      return data as HabitLog;
    } catch (e) {
      await enqueueSyncAction({
        type: 'TOGGLE_HABIT_LOG',
        payload: { logItem },
      });
      return logItem;
    }
  }
}

export const supabaseHabitRepository = new SupabaseHabitRepository();
