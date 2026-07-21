import { describe, it, expect } from 'vitest';
import { exportRoutineToJSON, exportRoutineToBase64, parseExportedRoutineBase64 } from './routineExporter';

describe('routineExporter', () => {
  const mockRoutine: any = {
    id: 'r-1',
    name: 'PPL - Empuje Total',
    description: 'Enfoque hipertrofia',
    exercises: [
      { exercise_id: 'bench-press', default_sets: 4, default_reps: '8-10' },
      { exercise_id: 'lateral-raises', default_sets: 3, default_reps: '12-15' },
    ],
  };

  it('exports routine to valid JSON', () => {
    const json = exportRoutineToJSON(mockRoutine);
    expect(json).toContain('PPL - Empuje Total');
  });

  it('exports and parses routine in Base64 format', () => {
    const base64 = exportRoutineToBase64(mockRoutine);
    expect(typeof base64).toBe('string');

    const parsed = parseExportedRoutineBase64(base64);
    expect(parsed.name).toBe('PPL - Empuje Total');
    expect(parsed.exercises.length).toBe(2);
  });
});
