import type { WorkoutSet, WorkoutSession } from '../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../constants/exercises';

export interface MuscleFatigue {
  muscleGroup: string;
  volumeKg: number;
  setsCount: number;
  fatiguePercent: number; // 0 a 100%
  status: 'optimal' | 'moderate' | 'high' | 'overtrained';
}

export interface FatigueReport {
  overallFatiguePercent: number;
  isDeloadRecommended: boolean;
  muscleFatigueList: MuscleFatigue[];
  recommendation: string;
}

const MUSCLE_SETS_THRESHOLD: Record<string, { optimalMax: number; overtrainLimit: number }> = {
  Pecho: { optimalMax: 18, overtrainLimit: 26 },
  Espalda: { optimalMax: 20, overtrainLimit: 28 },
  Cuádriceps: { optimalMax: 16, overtrainLimit: 24 },
  Isquios: { optimalMax: 14, overtrainLimit: 20 },
  Hombros: { optimalMax: 18, overtrainLimit: 24 },
  Tríceps: { optimalMax: 14, overtrainLimit: 20 },
  Bíceps: { optimalMax: 14, overtrainLimit: 20 },
  Abdominales: { optimalMax: 12, overtrainLimit: 18 },
  Gemelos: { optimalMax: 14, overtrainLimit: 20 },
  Glúteos: { optimalMax: 14, overtrainLimit: 20 },
};

export function calculateMuscleFatigue(
  sessions: WorkoutSession[],
  setsHistory: WorkoutSet[],
  daysWindow = 7
): FatigueReport {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysWindow);

  const recentSessions = sessions.filter((s) => new Date(s.started_at) >= cutoffDate);
  const recentSessionIds = new Set(recentSessions.map((s) => s.id));
  const recentSets = setsHistory.filter((s) => s.is_completed && recentSessionIds.has(s.session_id));

  const exerciseMap = new Map<string, string>(
    BASE_EXERCISES.map((e) => [e.id, e.muscleGroup])
  );

  const muscleStats: Record<string, { volume: number; sets: number }> = {};

  recentSets.forEach((set) => {
    const muscleGroup = exerciseMap.get(set.exercise_id) || 'Otros';
    if (!muscleStats[muscleGroup]) {
      muscleStats[muscleGroup] = { volume: 0, sets: 0 };
    }
    muscleStats[muscleGroup].sets += 1;
    muscleStats[muscleGroup].volume += (Number(set.weight_kg) || 0) * (Number(set.reps) || 0);
  });

  const muscleFatigueList: MuscleFatigue[] = Object.keys(MUSCLE_SETS_THRESHOLD).map((muscle) => {
    const stats = muscleStats[muscle] || { volume: 0, sets: 0 };
    const limits = MUSCLE_SETS_THRESHOLD[muscle];
    const fatiguePercent = Math.min(100, Math.round((stats.sets / limits.overtrainLimit) * 100));

    let status: 'optimal' | 'moderate' | 'high' | 'overtrained' = 'optimal';
    if (fatiguePercent > 85) status = 'overtrained';
    else if (fatiguePercent > 65) status = 'high';
    else if (fatiguePercent > 40) status = 'moderate';

    return {
      muscleGroup: muscle,
      volumeKg: Math.round(stats.volume),
      setsCount: stats.sets,
      fatiguePercent,
      status,
    };
  });

  const totalFatigueSum = muscleFatigueList.reduce((acc, m) => acc + m.fatiguePercent, 0);
  const overallFatiguePercent = Math.round(totalFatigueSum / muscleFatigueList.length);
  const isDeloadRecommended = overallFatiguePercent > 70 || muscleFatigueList.some((m) => m.status === 'overtrained');

  let recommendation = 'Tus niveles de fatiga están balanceados. Puedes continuar entrenando con intensidad alta.';
  if (isDeloadRecommended) {
    recommendation = 'Se detecta acumulación elevada de fatiga muscular. Se recomienda programar una semana de descarga (Deload) reduciendo el volumen un 40%.';
  } else if (overallFatiguePercent > 45) {
    recommendation = 'Fatiga moderada sostenida. Prioriza el descanso nocturno e hidratación adecuada.';
  }

  return {
    overallFatiguePercent,
    isDeloadRecommended,
    muscleFatigueList,
    recommendation,
  };
}
