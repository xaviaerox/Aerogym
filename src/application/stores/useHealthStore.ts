import { create } from 'zustand';
import { supabase } from '../../infrastructure/supabase/client';
import { supabaseHealthRepository } from '../../infrastructure/repositories/SupabaseHealthRepository';
import type { DailyHealth, BodyMeasurement } from '../../infrastructure/supabase/types';

interface HealthState {
  dailyHealth: DailyHealth[];
  measurements: BodyMeasurement[];
  todayHealth: DailyHealth | null;
  isLoading: boolean;

  fetchHealth: (userId: string, days?: number) => Promise<void>;
  fetchMeasurements: (userId: string) => Promise<void>;
  upsertTodayHealth: (userId: string, updates: Partial<DailyHealth>) => Promise<void>;
  upsertDailyHealth: (userId: string, date: string, updates: Partial<DailyHealth>) => Promise<void>;
  addMeasurement: (userId: string, data: Partial<BodyMeasurement>) => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  dailyHealth: [],
  measurements: [],
  todayHealth: null,
  isLoading: false,

  fetchHealth: async (userId, days = 90) => {
    set({ isLoading: true });
    try {
      const data = await supabaseHealthRepository.fetchHealth(userId, days);
      const today = new Date().toISOString().split('T')[0];
      set({
        dailyHealth: data,
        todayHealth: data.find((h) => h.date === today) || null,
      });
    } catch (e) {
      console.error('Error fetching health data:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMeasurements: async (userId) => {
    try {
      const data = await supabaseHealthRepository.fetchMeasurements(userId);
      set({ measurements: data });
    } catch (e) {
      console.error('Error fetching measurements:', e);
    }
  },

  upsertDailyHealth: async (userId, date, updates) => {
    const { dailyHealth } = get();
    const today = new Date().toISOString().split('T')[0];

    const payload = {
      user_id: userId,
      date: date,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('daily_health')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (!error && data) {
      set((state) => {
        const exists = state.dailyHealth.some((h) => h.date === date);
        const newDailyHealth = exists
          ? state.dailyHealth.map((h) => (h.date === date ? data : h))
          : [data, ...state.dailyHealth].sort((a, b) => b.date.localeCompare(a.date));

        return {
          dailyHealth: newDailyHealth,
          todayHealth: date === today ? data : state.todayHealth,
        };
      });
    }
  },

  upsertTodayHealth: async (userId, updates) => {
    const today = new Date().toISOString().split('T')[0];
    await get().upsertDailyHealth(userId, today, updates);
  },

  addMeasurement: async (userId, measurementData) => {
    const { data, error } = await supabase
      .from('body_measurements')
      .upsert(
        { user_id: userId, ...measurementData, measured_at: measurementData.measured_at || new Date().toISOString().split('T')[0] },
        { onConflict: 'user_id,measured_at' }
      )
      .select()
      .single();

    if (!error && data) {
      set((state) => ({
        measurements: [data, ...state.measurements.filter((m) => m.measured_at !== data.measured_at)],
      }));
    }
  },
}));
