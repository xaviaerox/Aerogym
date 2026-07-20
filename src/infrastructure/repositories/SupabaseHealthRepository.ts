import { supabase } from '../supabase/client';
import type { DailyHealth, BodyMeasurement } from '../supabase/types';
import type { IHealthRepository } from './IHealthRepository';

export class SupabaseHealthRepository implements IHealthRepository {
  async fetchHealth(userId: string, limit = 90): Promise<DailyHealth[]> {
    const { data, error } = await supabase
      .from('daily_health')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async saveDailyHealth(health: Omit<DailyHealth, 'id' | 'created_at'>): Promise<DailyHealth> {
    const { data, error } = await supabase
      .from('daily_health')
      .upsert(health, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save daily health');
    return data;
  }

  async fetchMeasurements(userId: string, limit = 50): Promise<BodyMeasurement[]> {
    const { data, error } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('measured_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async saveMeasurement(measurement: Omit<BodyMeasurement, 'id' | 'created_at'>): Promise<BodyMeasurement> {
    const { data, error } = await supabase
      .from('body_measurements')
      .upsert(measurement, { onConflict: 'user_id,measured_at' })
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to save measurement');
    return data;
  }
}

export const supabaseHealthRepository = new SupabaseHealthRepository();
