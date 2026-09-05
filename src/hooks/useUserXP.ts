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

    // Series efectivas: series de fuerza valen 10 XP c/u; en cardio, cada bloque de 150s (~2.5 min)
    // equivale a 1 serie efectiva (ej. 30 min cardio = 12 series = 120 XP)
    const effectiveSetsCount = (workoutSetsHistory || []).reduce((acc, s) => {
      if (!s.is_completed) return acc;
      if (s.duration_seconds && s.duration_seconds > 0) {
        return acc + Math.max(1, Math.round(s.duration_seconds / 150));
      }
      return acc + 1;
    }, 0);
    const setsXP = effectiveSetsCount * 10;

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
