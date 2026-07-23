/**
 * progressiveOverloadEngine.ts — Intelligent Progressive Overload Recommendation Engine.
 *
 * Analyzes exercise history, target muscle group, previous sets, RPE, and RIR
 * to recommend optimal weight and rep targets for the next set or session.
 *
 * Rules:
 *  1. If previous RPE <= 7 (or RIR >= 3) and set completed: Suggest weight increase (+2.5% to +5%, rounded to nearest 0.5kg/1kg).
 *  2. If previous RPE 8-9 (or RIR 1-2) and set completed: Suggest maintaining weight and attempting +1 rep.
 *  3. If previous RPE == 10 (or RIR == 0 / failure): Suggest maintaining current weight & reps or slight deload if fatigue is high.
 *  4. Fallback for new exercises: Suggest starting with a conservative baseline based on user experience level.
 */

import type { WorkoutSet } from '../infrastructure/supabase/types';
import { calculateE1RM } from './engine';

export interface OverloadRecommendation {
  suggestedWeightKg: number;
  suggestedReps: number;
  reasoning: string;
  type: 'increase_weight' | 'increase_reps' | 'maintain' | 'deload' | 'baseline';
}

export class ProgressiveOverloadEngine {
  /**
   * Calculates the recommended weight and reps for an exercise based on user history and recent performance.
   */
  public getRecommendation(
    exerciseId: string,
    historySets: WorkoutSet[],
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
  ): OverloadRecommendation {
    // Filter completed sets for this specific exercise, sorted by logging date descending
    const completedSets = historySets
      .filter((s) => s.exercise_id === exerciseId && s.is_completed && Number(s.weight_kg) > 0)
      .sort((a, b) => new Date(b.logged_at || 0).getTime() - new Date(a.logged_at || 0).getTime());

    // Baseline fallback if no completed set history exists
    if (!completedSets.length) {
      const defaultWeight = userLevel === 'beginner' ? 20 : userLevel === 'intermediate' ? 40 : 60;
      return {
        suggestedWeightKg: defaultWeight,
        suggestedReps: 10,
        reasoning: 'Primer registro de este ejercicio. Comienza con una carga conservadora.',
        type: 'baseline',
      };
    }

    const lastSet = completedSets[0];
    const lastWeight = Number(lastSet.weight_kg) || 0;
    const lastReps = Number(lastSet.reps) || 0;
    const lastRPE = lastSet.rpe !== null && lastSet.rpe !== undefined ? Number(lastSet.rpe) : null;
    const lastRIR = lastSet.rir !== null && lastSet.rir !== undefined ? Number(lastSet.rir) : null;

    // Rule 1: High Effort Reserve (RPE <= 7 or RIR >= 3) -> Increase weight
    if ((lastRPE !== null && lastRPE <= 7) || (lastRIR !== null && lastRIR >= 3)) {
      const incrementPercent = userLevel === 'beginner' ? 0.05 : 0.025; // 5% beginner, 2.5% experienced
      const rawNewWeight = lastWeight * (1 + incrementPercent);
      const suggestedWeightKg = Math.round(rawNewWeight * 2) / 2; // Round to nearest 0.5kg

      return {
        suggestedWeightKg: Math.max(suggestedWeightKg, lastWeight + 0.5),
        suggestedReps: lastReps > 0 ? lastReps : 10,
        reasoning: `Tu RPE anterior fue bajo (${lastRPE ?? 'RIR ' + lastRIR}). ¡Sube de peso (+${(suggestedWeightKg - lastWeight).toFixed(1)}kg)!`,
        type: 'increase_weight',
      };
    }

    // Rule 2: Optimal Training Zone (RPE 8-9 or RIR 1-2) -> Maintain weight, add +1 rep
    if ((lastRPE !== null && lastRPE >= 8 && lastRPE <= 9) || (lastRIR !== null && (lastRIR === 1 || lastRIR === 2))) {
      return {
        suggestedWeightKg: lastWeight,
        suggestedReps: lastReps + 1,
        reasoning: `Estás en la zona de estímulo óptima. Mantén ${lastWeight}kg e intenta hacer ${lastReps + 1} repeticiones.`,
        type: 'increase_reps',
      };
    }

    // Rule 3: Maximum Effort / Near Failure (RPE 10 or RIR 0) -> Consolidate weight
    if ((lastRPE !== null && lastRPE >= 9.5) || lastRIR === 0) {
      return {
        suggestedWeightKg: lastWeight,
        suggestedReps: Math.max(1, lastReps),
        reasoning: `Llegaste al límite en la última sesión. Consolida la técnica con ${lastWeight}kg x ${lastReps} reps antes de subir.`,
        type: 'maintain',
      };
    }

    // Default fallback if no RPE/RIR recorded: Moderate progression attempt (+1 rep or +1kg)
    return {
      suggestedWeightKg: lastWeight,
      suggestedReps: lastReps + 1,
      reasoning: `Intenta completar ${lastReps + 1} repeticiones con ${lastWeight}kg para mantener sobrecarga progresiva.`,
      type: 'increase_reps',
    };
  }
}

export const progressiveOverloadEngine = new ProgressiveOverloadEngine();
