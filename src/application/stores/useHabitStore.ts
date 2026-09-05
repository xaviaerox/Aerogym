import { create } from 'zustand';
import { supabaseHabitRepository } from '../../infrastructure/repositories/SupabaseHabitRepository';
import type { Habit, HabitLog } from '../../infrastructure/supabase/types';
import { formatDateString, PRESET_HABITS } from '../../lib/habitsEngine';

interface HabitState {
  habits: Habit[];
  habitLogs: HabitLog[];
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;

  fetchHabits: (userId: string) => Promise<void>;
  fetchHabitLogs: (userId: string, startDate?: string, endDate?: string) => Promise<void>;
  createHabit: (
    userId: string,
    habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'order_index' | 'is_archived'>
  ) => Promise<Habit | null>;
  updateHabit: (habitId: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  reorderHabits: (userId: string, reorderedHabits: Habit[]) => Promise<void>;
  toggleHabitLog: (
    userId: string,
    habitId: string,
    date: string,
    notes?: string | null
  ) => Promise<void>;
  createPresetHabits: (userId: string, presetIds: string[]) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  habitLogs: [],
  selectedDate: formatDateString(new Date()),
  isLoading: false,
  isSaving: false,

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  fetchHabits: async (userId: string) => {
    set({ isLoading: true });
    try {
      const data = await supabaseHabitRepository.fetchHabits(userId);
      const safeData = Array.isArray(data) ? data : [];
      const sorted = [...safeData].sort((a, b) => a.order_index - b.order_index);
      set({ habits: sorted });
    } catch (e) {
      console.error('Error fetching habits:', e);
      set({ habits: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHabitLogs: async (userId: string, startDate?: string, endDate?: string) => {
    try {
      const data = await supabaseHabitRepository.fetchHabitLogs(userId, startDate, endDate);
      const safeData = Array.isArray(data) ? data : [];
      set({ habitLogs: safeData });
    } catch (e) {
      console.error('Error fetching habit logs:', e);
      set({ habitLogs: [] });
    }
  },

  createHabit: async (userId, habitData) => {
    set({ isSaving: true });
    try {
      const currentHabits = Array.isArray(get().habits) ? get().habits : [];
      const nextOrder = currentHabits.length > 0 ? Math.max(...currentHabits.map((h) => h.order_index)) + 1 : 0;

      const payload = {
        user_id: userId,
        ...habitData,
        order_index: nextOrder,
        is_archived: false,
      };

      const created = await supabaseHabitRepository.saveHabit(payload);
      if (created) {
        set((state) => {
          const prev = Array.isArray(state.habits) ? state.habits : [];
          return {
            habits: [...prev, created].sort((a, b) => a.order_index - b.order_index),
          };
        });
        return created;
      }
      return null;
    } catch (e) {
      console.error('Error creating habit:', e);
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  updateHabit: async (habitId, updates) => {
    // Actualización optimista
    set((state) => {
      const prev = Array.isArray(state.habits) ? state.habits : [];
      return {
        habits: prev.map((h) => (h.id === habitId ? { ...h, ...updates } : h)),
      };
    });

    try {
      await supabaseHabitRepository.updateHabit(habitId, updates);
    } catch (e) {
      console.error('Error updating habit:', e);
    }
  },

  deleteHabit: async (habitId) => {
    // Actualización optimista
    set((state) => {
      const prev = Array.isArray(state.habits) ? state.habits : [];
      return {
        habits: prev.filter((h) => h.id !== habitId),
      };
    });

    try {
      await supabaseHabitRepository.deleteHabit(habitId);
    } catch (e) {
      console.error('Error deleting habit:', e);
    }
  },

  reorderHabits: async (userId, reorderedHabits) => {
    const safeList = Array.isArray(reorderedHabits) ? reorderedHabits : [];
    const updated = safeList.map((h, idx) => ({ ...h, order_index: idx }));
    set({ habits: updated });

    try {
      await supabaseHabitRepository.reorderHabits(
        userId,
        updated.map((h) => h.id)
      );
    } catch (e) {
      console.error('Error reordering habits:', e);
    }
  },

  toggleHabitLog: async (userId, habitId, date, notes) => {
    const currentLogs = Array.isArray(get().habitLogs) ? get().habitLogs : [];
    const existingLog = currentLogs.find((l) => l.habit_id === habitId && l.date === date);
    const newCompleted = existingLog ? !existingLog.completed : true;

    // Actualización optimista inmediata en memoria
    if (existingLog) {
      set({
        habitLogs: currentLogs.map((l) =>
          l.habit_id === habitId && l.date === date
            ? { ...l, completed: newCompleted, notes: notes !== undefined ? notes : l.notes }
            : l
        ),
      });
    } else {
      const tempLog: HabitLog = {
        id: `log-${habitId}-${date}-${Math.random().toString(36).substring(2, 7)}`,
        habit_id: habitId,
        user_id: userId,
        date,
        completed: newCompleted,
        notes: notes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set({ habitLogs: [tempLog, ...currentLogs] });
    }

    try {
      await supabaseHabitRepository.toggleHabitLog(userId, habitId, date, newCompleted, notes);
    } catch (e) {
      console.error('Error toggling habit log:', e);
    }
  },

  createPresetHabits: async (userId, presetIds) => {
    set({ isSaving: true });
    try {
      const toCreate = PRESET_HABITS.filter((p) => presetIds.includes(p.id));
      const addedHabits: Habit[] = [];
      for (let i = 0; i < toCreate.length; i++) {
        const preset = toCreate[i];
        const currentHabits = Array.isArray(get().habits) ? get().habits : [];
        const exists =
          currentHabits.some((h) => h.name.toLowerCase() === preset.name.toLowerCase()) ||
          addedHabits.some((h) => h.name.toLowerCase() === preset.name.toLowerCase());
        if (!exists) {
          const nextOrder = currentHabits.length + addedHabits.length;
          const created = await supabaseHabitRepository.saveHabit({
            user_id: userId,
            name: preset.name,
            description: preset.description,
            category: preset.category,
            icon: preset.icon,
            color: preset.color,
            frequency: preset.frequency,
            target_days: preset.target_days,
            order_index: nextOrder,
            is_archived: false,
          });
          if (created) {
            addedHabits.push(created);
            set((state) => {
              const prev = Array.isArray(state.habits) ? state.habits : [];
              return { habits: [...prev, created] };
            });
          }
        }
      }
    } catch (e) {
      console.error('Error creating preset habits:', e);
    } finally {
      set({ isSaving: false });
    }
  },
}));
