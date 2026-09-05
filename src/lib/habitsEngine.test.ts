import { describe, it, expect } from 'vitest';
import {
  isHabitDueOnDate,
  calculateHabitStreak,
  calculateDailyStats,
  PRESET_HABITS,
  formatDateString,
  parseDateString,
} from './habitsEngine';
import type { Habit, HabitLog } from '../infrastructure/supabase/types';

describe('habitsEngine', () => {
  const baseHabit: Habit = {
    id: 'habit-1',
    user_id: 'user-123',
    name: 'NOPORN',
    description: 'Mental discipline',
    category: 'discipline',
    icon: 'Shield',
    color: '#ef4444',
    frequency: 'daily',
    target_days: [1, 2, 3, 4, 5, 6, 0],
    order_index: 0,
    is_archived: false,
    created_at: '2026-09-01T00:00:00Z',
    updated_at: '2026-09-01T00:00:00Z',
  };

  describe('isHabitDueOnDate', () => {
    it('should always return true for daily frequency', () => {
      expect(isHabitDueOnDate(baseHabit, '2026-09-05')).toBe(true); // Sábado
      expect(isHabitDueOnDate(baseHabit, '2026-09-07')).toBe(true); // Lunes
    });

    it('should return true on weekdays only for weekdays frequency', () => {
      const weekdaysHabit: Habit = {
        ...baseHabit,
        frequency: 'weekdays',
        target_days: [1, 2, 3, 4, 5],
      };
      expect(isHabitDueOnDate(weekdaysHabit, '2026-09-07')).toBe(true); // Lunes (1)
      expect(isHabitDueOnDate(weekdaysHabit, '2026-09-11')).toBe(true); // Viernes (5)
      expect(isHabitDueOnDate(weekdaysHabit, '2026-09-05')).toBe(false); // Sábado (6)
      expect(isHabitDueOnDate(weekdaysHabit, '2026-09-06')).toBe(false); // Domingo (0)
    });

    it('should check target_days for custom_days frequency', () => {
      const customHabit: Habit = {
        ...baseHabit,
        frequency: 'custom_days',
        target_days: [1, 3, 5], // Lun, Mié, Vie
      };
      expect(isHabitDueOnDate(customHabit, '2026-09-07')).toBe(true); // Lun
      expect(isHabitDueOnDate(customHabit, '2026-09-08')).toBe(false); // Mar
      expect(isHabitDueOnDate(customHabit, '2026-09-09')).toBe(true); // Mié
    });
  });

  describe('calculateHabitStreak', () => {
    it('calculates current streak when completed today and preceding days', () => {
      const logs: HabitLog[] = [
        { id: '1', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-05', completed: true, notes: null, created_at: '', updated_at: '' },
        { id: '2', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-04', completed: true, notes: null, created_at: '', updated_at: '' },
        { id: '3', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-03', completed: true, notes: null, created_at: '', updated_at: '' },
      ];

      const { currentStreak, longestStreak } = calculateHabitStreak(baseHabit, logs, '2026-09-05');
      expect(currentStreak).toBe(3);
      expect(longestStreak).toBe(3);
    });

    it('does not break weekday streaks over weekends for weekday habits', () => {
      const weekdaysHabit: Habit = {
        ...baseHabit,
        frequency: 'weekdays',
        target_days: [1, 2, 3, 4, 5],
      };

      // Viernes 2026-09-04 completed, Lunes 2026-09-07 completed. Sábado y Domingo no eran requeridos.
      const logs: HabitLog[] = [
        { id: '1', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-07', completed: true, notes: null, created_at: '', updated_at: '' },
        { id: '2', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-04', completed: true, notes: null, created_at: '', updated_at: '' },
      ];

      const { currentStreak } = calculateHabitStreak(weekdaysHabit, logs, '2026-09-07');
      expect(currentStreak).toBe(2);
    });

    it('resets streak if a required day was missed', () => {
      const logs: HabitLog[] = [
        { id: '1', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-05', completed: true, notes: null, created_at: '', updated_at: '' },
        // Falta 2026-09-04
        { id: '2', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-03', completed: true, notes: null, created_at: '', updated_at: '' },
        { id: '3', habit_id: 'habit-1', user_id: 'user-1', date: '2026-09-02', completed: true, notes: null, created_at: '', updated_at: '' },
      ];

      const { currentStreak, longestStreak } = calculateHabitStreak(baseHabit, logs, '2026-09-05');
      expect(currentStreak).toBe(1);
      expect(longestStreak).toBe(2);
    });
  });

  describe('calculateDailyStats', () => {
    it('calculates completion count, total due count and percentage accurately', () => {
      const habits: Habit[] = [
        { ...baseHabit, id: 'h1' },
        { ...baseHabit, id: 'h2' },
        { ...baseHabit, id: 'h3', frequency: 'weekdays' }, // No due on Saturday 2026-09-05
      ];

      const logs: HabitLog[] = [
        { id: '1', habit_id: 'h1', user_id: 'u', date: '2026-09-05', completed: true, notes: null, created_at: '', updated_at: '' },
      ];

      const stats = calculateDailyStats(habits, logs, '2026-09-05');
      expect(stats.totalCount).toBe(2); // h1 and h2 are due on Saturday
      expect(stats.completedCount).toBe(1);
      expect(stats.percentage).toBe(50);
      expect(stats.isAllCompleted).toBe(false);
    });

    it('returns 100% and isAllCompleted true when all due habits are finished', () => {
      const habits: Habit[] = [
        { ...baseHabit, id: 'h1' },
      ];

      const logs: HabitLog[] = [
        { id: '1', habit_id: 'h1', user_id: 'u', date: '2026-09-05', completed: true, notes: null, created_at: '', updated_at: '' },
      ];

      const stats = calculateDailyStats(habits, logs, '2026-09-05');
      expect(stats.percentage).toBe(100);
      expect(stats.isAllCompleted).toBe(true);
    });
  });

  describe('PRESET_HABITS', () => {
    it('contains all essential preset templates including user requested examples', () => {
      const ids = PRESET_HABITS.map((p) => p.id);
      expect(ids).toContain('noporn');
      expect(ids).toContain('steps');
      expect(ids).toContain('workout');
      expect(ids).toContain('work');
      expect(ids).toContain('study');
      expect(ids).toContain('water');
    });
  });
});
