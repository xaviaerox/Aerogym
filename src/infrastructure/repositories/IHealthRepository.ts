import type { DailyHealth, BodyMeasurement } from '../supabase/types';

export interface IHealthRepository {
  fetchHealth(userId: string, limit?: number): Promise<DailyHealth[]>;
  saveDailyHealth(health: Omit<DailyHealth, 'id' | 'created_at'>): Promise<DailyHealth>;
  fetchMeasurements(userId: string, limit?: number): Promise<BodyMeasurement[]>;
  saveMeasurement(measurement: Omit<BodyMeasurement, 'id' | 'created_at'>): Promise<BodyMeasurement>;
}
