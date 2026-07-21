import type { Routine, RoutineExercise } from '../infrastructure/supabase/types';

export interface ExportedRoutine {
  version: '2.0';
  name: string;
  description?: string | null;
  exportedAt: string;
  exercises: {
    exercise_id: string;
    default_sets?: number | null;
    default_reps?: string | null;
    default_weight_kg?: number | null;
    rest_seconds?: number | null;
    notes?: string | null;
  }[];
}

export function exportRoutineToJSON(routine: Routine & { exercises: RoutineExercise[] }): string {
  const payload: ExportedRoutine = {
    version: '2.0',
    name: routine.name,
    description: routine.description,
    exportedAt: new Date().toISOString(),
    exercises: routine.exercises.map((e) => ({
      exercise_id: e.exercise_id,
      default_sets: e.default_sets,
      default_reps: e.default_reps,
      default_weight_kg: e.default_weight_kg,
      rest_seconds: e.rest_seconds,
      notes: e.notes,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

export function parseExportedRoutineJSON(jsonString: string): Omit<ExportedRoutine, 'exportedAt'> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.name || !Array.isArray(parsed.exercises)) {
      throw new Error('Formato de rutina no válido');
    }
    return parsed;
  } catch (e: any) {
    throw new Error(`Error al leer archivo de rutina: ${e?.message || 'JSON inválido'}`);
  }
}

/**
 * Convierte la rutina en una cadena Base64 comprimida para compartir por enlace o código QR.
 */
export function exportRoutineToBase64(routine: Routine & { exercises: RoutineExercise[] }): string {
  const json = exportRoutineToJSON(routine);
  return btoa(encodeURIComponent(json));
}

/**
 * Descomprime y valida una rutina codificada en Base64.
 */
export function parseExportedRoutineBase64(base64Str: string): Omit<ExportedRoutine, 'exportedAt'> {
  const json = decodeURIComponent(atob(base64Str));
  return parseExportedRoutineJSON(json);
}

/**
 * Genera la URL compartible para importar la rutina directamente.
 */
export function generateShareableURL(routine: Routine & { exercises: RoutineExercise[] }): string {
  const code = exportRoutineToBase64(routine);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://aerogym.app/';
  return `${baseUrl}?importRoutine=${code}`;
}
