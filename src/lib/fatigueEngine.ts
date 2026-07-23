import type { WorkoutSet, WorkoutSession } from '../infrastructure/supabase/types';
import { BASE_EXERCISES } from '../constants/exercises';
import { MuscleWikiService, TRANSLATE_MUSCLE } from './muscleWikiService';

export interface MuscleFatigue {
  muscleGroup: string;
  volumeKg: number;
  setsCount: number;
  effectiveFatigueSets: number;
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

/**
  * Calcula el factor de fatiga residual según las horas transcurridas desde el entreno.
  * Curva fisiológica de supercompensación (vida media ~36h).
  */
function getTimeDecayMultiplier(hoursAgo: number): number {
  if (hoursAgo <= 18) return 1.0;
  if (hoursAgo <= 36) return 0.8;
  if (hoursAgo <= 60) return 0.55;
  if (hoursAgo <= 96) return 0.3;
  if (hoursAgo <= 144) return 0.15;
  return 0.05;
}

export function calculateMuscleFatigue(
  sessions: WorkoutSession[],
  setsHistory: WorkoutSet[],
  daysWindow = 7
): FatigueReport {
  const now = new Date();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysWindow);

  const recentSessions = sessions.filter((s) => new Date(s.started_at) >= cutoffDate);
  const sessionMap = new Map<string, WorkoutSession>(recentSessions.map((s) => [s.id, s]));
  const recentSets = setsHistory.filter((s) => s.is_completed && sessionMap.has(s.session_id));

  const exerciseMap = new Map<string, string>(
    BASE_EXERCISES.map((e) => [e.id, e.muscleGroup])
  );

  const muscleStats: Record<string, { volume: number; sets: number; effectiveSets: number }> = {};

  recentSets.forEach((set) => {
    let muscleGroup = exerciseMap.get(set.exercise_id);
    
    // Si no está en BASE_EXERCISES, comprobar MuscleWiki
    if (!muscleGroup && set.exercise_id.startsWith('mw-')) {
      const mwInfo = MuscleWikiService.getCachedExerciseInfo(set.exercise_id);
      if (mwInfo?.muscleGroup) {
        muscleGroup = mwInfo.muscleGroup;
      }
    }

    if (!muscleGroup) muscleGroup = 'Otros';

    if (!muscleStats[muscleGroup]) {
      muscleStats[muscleGroup] = { volume: 0, sets: 0, effectiveSets: 0 };
    }

    const session = sessionMap.get(set.session_id);
    const sessionDate = session ? new Date(session.started_at) : new Date(set.logged_at || Date.now());
    const hoursAgo = Math.max(0, (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60));
    const decayFactor = getTimeDecayMultiplier(hoursAgo);

    muscleStats[muscleGroup].sets += 1;
    muscleStats[muscleGroup].effectiveSets += decayFactor;
    muscleStats[muscleGroup].volume += (Number(set.weight_kg) || 0) * (Number(set.reps) || 0);
  });

  const muscleFatigueList: MuscleFatigue[] = Object.keys(MUSCLE_SETS_THRESHOLD).map((muscle) => {
    const stats = muscleStats[muscle] || { volume: 0, sets: 0, effectiveSets: 0 };
    const limits = MUSCLE_SETS_THRESHOLD[muscle];
    
    // Usar conjuntos efectivos con decaimiento de tiempo o volumen total de la semana si se acumulan muchas series
    const rawRatio = Math.max(
      (stats.effectiveSets * 1.5) / limits.optimalMax,
      stats.sets / limits.overtrainLimit
    );
    const fatiguePercent = Math.min(100, Math.round(rawRatio * 100));

    let status: 'optimal' | 'moderate' | 'high' | 'overtrained' = 'optimal';
    if (fatiguePercent > 80) status = 'overtrained';
    else if (fatiguePercent > 60) status = 'high';
    else if (fatiguePercent > 35) status = 'moderate';

    return {
      muscleGroup: muscle,
      volumeKg: Math.round(stats.volume),
      setsCount: stats.sets,
      effectiveFatigueSets: Math.round(stats.effectiveSets * 10) / 10,
      fatiguePercent,
      status,
    };
  });

  const totalFatigueSum = muscleFatigueList.reduce((acc, m) => acc + m.fatiguePercent, 0);
  const overallFatiguePercent = Math.round(totalFatigueSum / muscleFatigueList.length);
  const isDeloadRecommended = overallFatiguePercent > 70 || muscleFatigueList.some((m) => m.status === 'overtrained');

  let recommendation = 'Tus niveles de fatiga están óptimos. Estás listo para entrenar con alta intensidad.';
  if (isDeloadRecommended) {
    recommendation = 'Se detecta acumulación elevada de fatiga muscular. Se recomienda programar una semana de descarga (Deload) reduciendo el volumen un 40%.';
  } else if (overallFatiguePercent > 45) {
    recommendation = 'Fatiga moderada en recuperación. Prioriza el descanso nocturno e hidratación adecuada.';
  }

  return {
    overallFatiguePercent,
    isDeloadRecommended,
    muscleFatigueList,
    recommendation,
  };
}

