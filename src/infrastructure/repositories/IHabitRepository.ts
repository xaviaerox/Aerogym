import type { Habit, HabitLog } from '../supabase/types';

export interface IHabitRepository {
  fetchHabits(userId: string): Promise<Habit[]>;
  saveHabit(habit: Omit<Habit, 'id' | 'created_at' | 'updated_at'>): Promise<Habit>;
  updateHabit(habitId: string, updates: Partial<Habit>): Promise<void>;
  deleteHabit(habitId: string): Promise<void>;
  reorderHabits(userId: string, habitIds: string[]): Promise<void>;
  fetchHabitLogs(userId: string, startDate?: string, endDate?: string): Promise<HabitLog[]>;
  toggleHabitLog(
    userId: string,
    habitId: string,
    date: string,
    completed: boolean,
    notes?: string | null
  ): Promise<HabitLog>;
}
