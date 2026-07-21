import { describe, it, expect } from 'vitest';
import { calculateMuscleFatigue } from './fatigueEngine';

describe('fatigueEngine', () => {
  it('calculates optimal status when session volume is low', () => {
    const sessions = [
      { id: 's-1', started_at: new Date().toISOString() },
    ] as any;
    const sets = [
      { session_id: 's-1', exercise_id: 'bench-press', is_completed: true, reps: 10, weight_kg: 80 },
    ] as any;

    const report = calculateMuscleFatigue(sessions, sets);
    expect(report.isDeloadRecommended).toBe(false);
    expect(report.overallFatiguePercent).toBeLessThan(50);
  });

  it('detects high fatigue and recommends deload when sets exceed threshold', () => {
    const sessions = [
      { id: 's-1', started_at: new Date().toISOString() },
    ] as any;

    // Generar 30 series de pecho para simular sobreentrenamiento
    const sets = Array.from({ length: 30 }, (_, i) => ({
      session_id: 's-1',
      exercise_id: 'bench-press',
      is_completed: true,
      reps: 10,
      weight_kg: 100,
    })) as any;

    const report = calculateMuscleFatigue(sessions, sets);
    expect(report.isDeloadRecommended).toBe(true);
    expect(report.muscleFatigueList.find((m) => m.muscleGroup === 'Pecho')?.status).toBe('overtrained');
  });
});
