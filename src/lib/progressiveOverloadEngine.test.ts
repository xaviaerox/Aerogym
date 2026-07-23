import { describe, it, expect } from 'vitest';
import { progressiveOverloadEngine } from './progressiveOverloadEngine';
import type { WorkoutSet } from '../infrastructure/supabase/types';

describe('ProgressiveOverloadEngine', () => {
  it('returns baseline recommendation for new exercises with no history', () => {
    const rec = progressiveOverloadEngine.getRecommendation('new-ex', [], 'intermediate');
    expect(rec.type).toBe('baseline');
    expect(rec.suggestedWeightKg).toBe(40);
    expect(rec.suggestedReps).toBe(10);
  });

  it('recommends weight increase when previous RPE was <= 7', () => {
    const history: Partial<WorkoutSet>[] = [
      { exercise_id: 'squat', weight_kg: 100, reps: 8, rpe: 7, is_completed: true, logged_at: new Date().toISOString() },
    ];
    const rec = progressiveOverloadEngine.getRecommendation('squat', history as WorkoutSet[], 'intermediate');
    expect(rec.type).toBe('increase_weight');
    expect(rec.suggestedWeightKg).toBeGreaterThan(100);
    expect(rec.suggestedWeightKg).toBe(102.5);
  });

  it('recommends rep increase when previous RPE was 8 or 9', () => {
    const history: Partial<WorkoutSet>[] = [
      { exercise_id: 'bench-press', weight_kg: 80, reps: 8, rpe: 8.5, is_completed: true, logged_at: new Date().toISOString() },
    ];
    const rec = progressiveOverloadEngine.getRecommendation('bench-press', history as WorkoutSet[], 'intermediate');
    expect(rec.type).toBe('increase_reps');
    expect(rec.suggestedWeightKg).toBe(80);
    expect(rec.suggestedReps).toBe(9);
  });

  it('recommends maintenance when previous RPE was 10 (at failure)', () => {
    const history: Partial<WorkoutSet>[] = [
      { exercise_id: 'deadlift', weight_kg: 140, reps: 5, rpe: 10, is_completed: true, logged_at: new Date().toISOString() },
    ];
    const rec = progressiveOverloadEngine.getRecommendation('deadlift', history as WorkoutSet[], 'advanced');
    expect(rec.type).toBe('maintain');
    expect(rec.suggestedWeightKg).toBe(140);
    expect(rec.suggestedReps).toBe(5);
  });
});
