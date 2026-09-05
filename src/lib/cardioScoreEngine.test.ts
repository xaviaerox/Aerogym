import { describe, it, expect } from 'vitest';
import { cardioScoreEngine } from './cardioScoreEngine';

describe('CardioScoreEngine', () => {
  it('returns 0 and "Sin Datos" for empty or zero inputs', () => {
    const res = cardioScoreEngine.calculateCardioScore([], 75, 'male');
    expect(res.cardioPoints).toBe(0);
    expect(res.cardioCategory).toBe('Sin Datos');
  });

  it('calculates score for a moderate recreation runner', () => {
    // 3 runs of 30 min (1800s) each week, total 12 runs in month
    const sets = Array.from({ length: 12 }, () => ({
      duration_seconds: 1800,
      distance_meters: 5000,
      rpe: 7,
      logged_at: new Date().toISOString(),
    }));

    const res = cardioScoreEngine.calculateCardioScore(sets, 70, 'male');
    expect(res.cardioPoints).toBeGreaterThan(150);
    expect(res.cardioPoints).toBeLessThan(350);
    expect(['Intermedio', 'Avanzado']).toContain(res.cardioCategory);
    expect(res.weeklyMinutesAvg).toBe(90); // 12 * 30 / 4 = 90 min/sem
    expect(res.bestDurationMinutes).toBe(30);
    expect(res.bestSpeedKmH).toBe(10); // 5km in 0.5h = 10 km/h
  });

  it('calculates high score for an advanced/elite runner', () => {
    // 5 sessions of 60 min each week (300 min/week), fast pace 14 km/h
    const sets = Array.from({ length: 20 }, () => ({
      duration_seconds: 3600,
      distance_meters: 14000,
      rpe: 9,
      logged_at: new Date().toISOString(),
    }));

    const res = cardioScoreEngine.calculateCardioScore(sets, 70, 'male');
    expect(res.cardioPoints).toBeGreaterThanOrEqual(350);
    expect(['Élite', 'Leyenda de Resistencia']).toContain(res.cardioCategory);
  });

  describe('calculateAthleticScore', () => {
    it('returns sin_datos if both strength and cardio are 0', () => {
      const res = cardioScoreEngine.calculateAthleticScore(0, 0, 'Hipertrofia');
      expect(res.athleticPoints).toBe(0);
      expect(res.dominance).toBe('sin_datos');
    });

    it('returns pure strength if cardio is 0', () => {
      const res = cardioScoreEngine.calculateAthleticScore(300, 0, 'Fuerza');
      expect(res.athleticPoints).toBe(300);
      expect(res.dominance).toBe('fuerza');
      expect(res.category).toBe('Avanzado');
    });

    it('returns pure cardio if strength is 0', () => {
      const res = cardioScoreEngine.calculateAthleticScore(0, 280, 'Definición');
      expect(res.athleticPoints).toBe(280);
      expect(res.dominance).toBe('cardio');
      expect(res.category).toBe('Avanzado');
    });

    it('blends hybrid athlete score according to goal', () => {
      // 300 strength, 200 cardio
      // Hipertrofia: 70% strength (210) + 30% cardio (60) = 270
      const resHipertrofia = cardioScoreEngine.calculateAthleticScore(300, 200, 'Hipertrofia');
      expect(resHipertrofia.athleticPoints).toBe(270);
      expect(resHipertrofia.dominance).toBe('hibrido');

      // Definición: 50% strength (150) + 50% cardio (100) = 250
      const resDefinicion = cardioScoreEngine.calculateAthleticScore(300, 200, 'Definición');
      expect(resDefinicion.athleticPoints).toBe(250);
    });
  });
});
