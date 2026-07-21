import { describe, it, expect } from 'vitest';
import { calculateAdaptiveNutrition } from './nutritionEngine';

describe('nutritionEngine', () => {
  it('calculates maintenance and macros for a male hypertrophy profile', () => {
    const profile = {
      weight_kg: 80,
      height_cm: 180,
      age: 28,
      gender: 'male' as const,
      goal: 'hypertrophy' as const,
      activity_level: 'moderate' as const,
    };

    const plan = calculateAdaptiveNutrition(profile);
    expect(plan.dailyCalories).toBeGreaterThan(2000);
    expect(plan.proteinGrams).toBe(160); // 80 * 2.0
    expect(plan.groceryList.length).toBe(4);
    expect(plan.waterLiters).toBe(2.8);
  });

  it('adjusts calories upwards when high fatigue is detected', () => {
    const profile = {
      weight_kg: 70,
      height_cm: 170,
      age: 25,
      goal: 'maintenance' as const,
    };

    const normalPlan = calculateAdaptiveNutrition(profile, 30);
    const fatiguedPlan = calculateAdaptiveNutrition(profile, 80);

    expect(fatiguedPlan.dailyCalories).toBeGreaterThan(normalPlan.dailyCalories);
  });
});
