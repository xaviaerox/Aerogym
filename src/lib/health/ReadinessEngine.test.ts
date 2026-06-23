import { describe, it, expect } from 'vitest';
import { calculateE1RM, getBestE1RM, suggestWeight, calculateNutrition } from '../engine';
import type { Session, UserProfile } from '../../types';

describe('Engine Logic', () => {
  it('should calculate E1RM correctly using Brzycki formula', () => {
    // 100kg for 10 reps -> 100 * (1 + 10/30) = 133.33
    expect(calculateE1RM(100, 10)).toBeCloseTo(133.33, 1);
    expect(calculateE1RM(100, 1)).toBe(100);
  });

  it('should suggest correct weight for target reps', () => {
    // E1RM of 133.33, target 10 reps -> 133.33 / (1 + 10/30) = 100
    const e1rm = 133.33;
    expect(suggestWeight(e1rm, 10)).toBe(100);
  });

  it('should calculate TDEE and nutritional plan correctly', () => {
    const profile: UserProfile = {
      name: 'Test',
      weight: 70,
      height: 175,
      age: 25,
      gender: 'Hombre',
      activityLevel: 'Moderado',
      goal: 'Hipertrofia',
      level: 'Principiante',
      experience: 'PPL',
      weeklyFrequency: 3
    };

    const result = calculateNutrition(profile);
    
    // BMR: (10*70) + (6.25*175) - (5*25) + 5 = 700 + 1093.75 - 125 + 5 = 1673.75
    // TDEE: 1673.75 * 1.55 = 2594.3
    // Target (Hipertrofia): 2594.3 + 300 = 2894.3
    expect(result.targetCalories).toBeCloseTo(2894, 0);
    expect(result.macros.protein).toBe(140); // 70 * 2
  });

  it('should find the best E1RM across sessions', () => {
    const sessions: Session[] = [
      {
        id: '1', name: 'S1', date: '', totalVolume: 0,
        exercises: [{
          exerciseId: 'bench',
          sets: [{ id: 's1', weight: 100, reps: 5, completed: true }]
        }]
      },
      {
        id: '2', name: 'S2', date: '', totalVolume: 0,
        exercises: [{
          exerciseId: 'bench',
          sets: [{ id: 's2', weight: 110, reps: 5, completed: true }]
        }]
      }
    ];

    expect(getBestE1RM(sessions, 'bench')).toBeGreaterThan(calculateE1RM(100, 5));
    expect(getBestE1RM(sessions, 'bench')).toBe(calculateE1RM(110, 5));
  });
});
