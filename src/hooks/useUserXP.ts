import { useMemo } from 'react';
import type { WorkoutSession, WorkoutSet, DailyHealth } from '../infrastructure/supabase/types';

export interface UserXPResult {
  total: number;
  level: number;
  progressPercent: number;
}

export function useUserXP(
  sessions: WorkoutSession[],
  workoutSetsHistory: WorkoutSet[],
  dailyHealth: DailyHealth[]
): UserXPResult {
  return useMemo(() => {
    const sessionsXP = sessions.length * 100;
    const setsXP = (workoutSetsHistory || []).length * 10;
    const healthXP = dailyHealth.length * 20;
    const prsCount = (workoutSetsHistory || []).filter((s) => s.is_pr).length;
    const prsXP = prsCount * 50;

    const totalXP = sessionsXP + setsXP + healthXP + prsXP;
    const level = Math.floor(Math.sqrt(totalXP / 100)) + 1;

    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;

    const levelProgressXP = totalXP - currentLevelBaseXP;
    const levelRequiredXP = nextLevelXP - currentLevelBaseXP;
    const progressPercent = Math.min(100, Math.round((levelProgressXP / levelRequiredXP) * 100));

    return {
      total: totalXP,
      level,
      progressPercent,
    };
  }, [sessions, workoutSetsHistory, dailyHealth]);
}
