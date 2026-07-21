import { getItemIndexedDB, setItemIndexedDB, STORE_SESSIONS, STORE_HEALTH } from './storageIndexedDB';
import type { WorkoutSession, WorkoutSet, DailyHealth, Profile, BodyMeasurement } from '../infrastructure/supabase/types';

export interface AeroGymExportData {
  version: string;
  exportedAt: string;
  profile: Profile | null;
  sessions: WorkoutSession[];
  workoutSetsHistory: WorkoutSet[];
  dailyHealth: DailyHealth[];
  bodyMeasurements: BodyMeasurement[];
}

/**
 * Recopila y exporta todos los datos del usuario registrados localmente o en caché.
 */
export async function exportUserData(
  userId: string,
  profile: Profile | null,
  sessions: WorkoutSession[],
  workoutSetsHistory: WorkoutSet[],
  dailyHealth: DailyHealth[],
  bodyMeasurements: BodyMeasurement[]
): Promise<AeroGymExportData> {
  const exportPayload: AeroGymExportData = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    profile,
    sessions,
    workoutSetsHistory,
    dailyHealth,
    bodyMeasurements,
  };

  // Guardar también una copia del export en IndexedDB
  await setItemIndexedDB('exports_cache', `export_${userId}`, exportPayload);

  return exportPayload;
}

/**
 * Genera y fuerza la descarga de un archivo JSON estructurado.
 */
export function downloadJSONFile(data: object, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Valida y parsea el archivo de importación JSON cargado por el usuario.
 */
export function parseImportJSON(jsonText: string): AeroGymExportData {
  const parsed = JSON.parse(jsonText);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato de archivo inválido.');
  }

  if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.dailyHealth)) {
    throw new Error('El archivo JSON no contiene una estructura de datos válida de AeroGym.');
  }

  return {
    version: parsed.version || 'unknown',
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    profile: parsed.profile || null,
    sessions: parsed.sessions || [],
    workoutSetsHistory: parsed.workoutSetsHistory || [],
    dailyHealth: parsed.dailyHealth || [],
    bodyMeasurements: parsed.bodyMeasurements || [],
  };
}
