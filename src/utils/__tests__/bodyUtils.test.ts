import { describe, it, expect } from 'vitest';
import { normalizeFatigueData } from '../bodyUtils';

describe('normalizeFatigueData', () => {
  it('handles array of Spanish muscle fatigue objects', () => {
    const input = [
      { muscleGroup: 'Pecho', fatiguePercent: 45 },
      { muscleGroup: 'Espalda', fatiguePercent: 80 },
      { muscleGroup: 'Cuádriceps', fatiguePercent: 60 },
      { muscleGroup: 'Glúteos', fatiguePercent: 30 },
      { muscleGroup: 'Hombros', fatiguePercent: 25 },
      { muscleGroup: 'Tríceps', fatiguePercent: 50 },
      { muscleGroup: 'Bíceps', fatiguePercent: 10 },
      { muscleGroup: 'Abdominales', fatiguePercent: 75 },
      { muscleGroup: 'Gemelos', fatiguePercent: 15 },
      { muscleGroup: 'Isquios', fatiguePercent: 90 },
    ];

    const normalized = normalizeFatigueData(input);

    expect(normalized).toEqual({
      chest: 45,
      back: 80,
      quads: 60,
      glutes: 30,
      shoulders: 25,
      triceps: 50,
      biceps: 10,
      abs: 75,
      calves: 15,
      hamstrings: 90,
    });
  });

  it('handles plain object with English keys', () => {
    const input = {
      chest: 50,
      lats: 70,
      deltoids: 30,
    };

    const normalized = normalizeFatigueData(input);

    expect(normalized).toEqual({
      chest: 50,
      back: 70,
      shoulders: 30,
    });
  });
});
