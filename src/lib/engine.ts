import { Session, WorkoutExercise } from '../types';
import { calculateE1RM } from './math/formulas';

export { calculateE1RM };

/**
 * Gets the best E1RM for a specific exercise across all sessions.
 */
export const getBestE1RM = (sessions: Session[], exerciseId: string): number => {
  let peak = 0;
  (sessions || []).forEach(session => {
    (session.exercises || []).forEach(ex => {
      if (ex.exerciseId === exerciseId) {
        (ex.sets || []).forEach(set => {
          if (set.completed) {
            const e1rm = calculateE1RM(set.weight, set.reps);
            if (e1rm > peak) peak = e1rm;
          }
        });
      }
    });
  });
  return peak;
};

/**
 * Suggests a weight for a target rep range based on recent performance.
 * Typically 70-85% of E1RM.
 */
export const suggestWeight = (e1rm: number, targetReps: number): number => {
  // Inverse of Brzycki: weight = e1rm / (1 + reps / 30)
  const base = e1rm / (1 + targetReps / 30);
  return Math.round(base * 2) / 2; // Round to nearest 0.5
};

export const calculateVolume = (exercise: WorkoutExercise): number => {
  if (!exercise || !exercise.sets) return 0;
  return exercise.sets.reduce((acc, set) => acc + (set.completed ? set.reps * set.weight : 0), 0);
};

export const calculateNutrition = (profile: any) => {
  const { weight, height, age, gender, activityLevel, goal } = profile;
  
  // BMR using Mifflin-St Jeor
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr += (gender === 'Hombre' ? 5 : -161);

  // Activity Multipliers
  const multipliers: any = {
    'Sedentario': 1.2,
    'Ligero': 1.375,
    'Moderado': 1.55,
    'Activo': 1.725,
    'Muy Activo': 1.9
  };
  
  const tdee = bmr * (multipliers[activityLevel] || 1.55);
  
  // Goal Adjustment
  let targetCalories = tdee;
  if (goal === 'Hipertrofia' || goal === 'Fuerza') targetCalories += 300;
  if (goal === 'Definición') targetCalories -= 500;

  // Macros Calculation
  // Protein: 2g/kg (High protein for both growth and preservation)
  const proteinG = weight * 2;
  const proteinKcal = proteinG * 4;

  // Fat: 25% of calories
  const fatKcal = targetCalories * 0.25;
  const fatG = fatKcal / 9;

  // Carbs: The rest
  const carbKcal = targetCalories - proteinKcal - fatKcal;
  const carbG = carbKcal / 4;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros: {
      protein: Math.round(proteinG),
      fat: Math.round(fatG),
      carbs: Math.round(carbG)
    }
  };
};
