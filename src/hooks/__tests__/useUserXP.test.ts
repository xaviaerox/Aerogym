import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserXP } from '../useUserXP';
import type { WorkoutSession, WorkoutSet, DailyHealth } from '../../infrastructure/supabase/types';

describe('useUserXP', () => {
  it('equates cardio duration to effective sets for XP calculation', () => {
    const sessions: WorkoutSession[] = [
      {
        id: 's1',
        user_id: 'u1',
        routine_id: null,
        name: 'Sesión Cardio',
        started_at: new Date().toISOString(),
        finished_at: new Date().toISOString(),
        duration_minutes: 30,
        total_volume_kg: 5000,
        notes: null,
        perceived_difficulty: null,
        created_at: new Date().toISOString(),
      },
    ];

    // 1 cardio set of 30 min (1800s) -> 1800 / 150 = 12 sets -> 120 XP
    const workoutSetsHistory: WorkoutSet[] = [
      {
        id: 'set1',
        session_id: 's1',
        exercise_id: 'treadmill',
        set_number: 1,
        reps: null,
        weight_kg: null,
        rpe: 8,
        rir: null,
        is_completed: true,
        is_warmup: false,
        is_pr: true, // Cardio PR -> +50 XP
        e1rm_kg: null,
        duration_seconds: 1800,
        distance_meters: 5000,
        logged_at: new Date().toISOString(),
      },
    ];

    const dailyHealth: DailyHealth[] = [];

    const { result } = renderHook(() => useUserXP(sessions, workoutSetsHistory, dailyHealth));

    // Sessions XP: 100
    // Sets XP: 12 * 10 = 120
    // PRs XP: 1 * 50 = 50
    // Total XP: 100 + 120 + 50 = 270 XP
    expect(result.current.total).toBe(270);
    expect(result.current.level).toBe(2);
  });
});
