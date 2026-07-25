import { describe, it, expect } from 'vitest';
import { MuscleWikiService, LOCAL_EXERCISES } from './muscleWikiService';

describe('MuscleWikiService local dataset', () => {
  it('has local exercises loaded synchronously', () => {
    expect(LOCAL_EXERCISES.length).toBeGreaterThan(50);
  });

  it('searches local exercises by query', async () => {
    const results = await MuscleWikiService.searchExercises('banca');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('banca');
  });

  it('gets cached exercise info by id or fallback', () => {
    const info = MuscleWikiService.getCachedExerciseInfo('bench-press');
    expect(info.name).toBe('Press de Banca');
    expect(info.muscleGroup).toBe('Pecho');
  });
});
