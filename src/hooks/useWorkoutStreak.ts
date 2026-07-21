import { useMemo } from 'react';
import type { WorkoutSession } from '../infrastructure/supabase/types';

export function useWorkoutStreak(sessions: WorkoutSession[]): number {
  return useMemo(() => {
    if (!sessions.length) return 0;
    let count = 0;
    const today = new Date();
    const uniqueDays = [...new Set(sessions.map((s) => s.started_at.split('T')[0]))];

    for (let i = 0; i < uniqueDays.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedStr = expectedDate.toISOString().split('T')[0];
      if (uniqueDays.includes(expectedStr)) {
        count++;
      } else {
        // Permitir romper racha solo si no es hoy o ayer (ventana de gracia)
        if (i > 1) break;
      }
    }
    return count;
  }, [sessions]);
}
