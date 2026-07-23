/**
 * backupService.ts — Full Data Export & Backup Restoration Service.
 *
 * Allows users to export their complete workout history, routines, profile,
 * health logs, and body measurements into a versioned JSON file, and restore
 * them smoothly.
 */

import type { WorkoutSession, WorkoutSet, Routine, RoutineExercise, DailyHealth, BodyMeasurement, Profile } from '../infrastructure/supabase/types';

export interface FullAppBackup {
  version: string;
  exportedAt: string;
  profile?: Partial<Profile>;
  sessions: WorkoutSession[];
  workoutSetsHistory: WorkoutSet[];
  routines: (Routine & { exercises: RoutineExercise[] })[];
  dailyHealth: DailyHealth[];
  bodyMeasurements: BodyMeasurement[];
}

export class BackupService {
  /**
   * Generates a structured JSON backup object from user state.
   */
  public generateBackup(data: {
    profile?: Partial<Profile> | null;
    sessions: WorkoutSession[];
    workoutSetsHistory: WorkoutSet[];
    routines: (Routine & { exercises: RoutineExercise[] })[];
    dailyHealth: DailyHealth[];
    bodyMeasurements: BodyMeasurement[];
  }): FullAppBackup {
    return {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      profile: data.profile || undefined,
      sessions: data.sessions || [],
      workoutSetsHistory: data.workoutSetsHistory || [],
      routines: data.routines || [],
      dailyHealth: data.dailyHealth || [],
      bodyMeasurements: data.bodyMeasurements || [],
    };
  }

  /**
   * Triggers a browser download of the backup JSON file.
   */
  public downloadBackupFile(backup: FullAppBackup, filename?: string): void {
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const name = filename || `aerogym-backup-${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates an imported JSON string to ensure it follows the FullAppBackup structure.
   */
  public validateBackupJSON(jsonStr: string): { valid: boolean; backup?: FullAppBackup; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'El archivo no contiene un objeto JSON válido.' };
      }

      if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.workoutSetsHistory)) {
        return { valid: false, error: 'El archivo no tiene la estructura de copia de seguridad de AeroGym.' };
      }

      return { valid: true, backup: parsed as FullAppBackup };
    } catch (e) {
      return { valid: false, error: 'Error al parsear el archivo JSON.' };
    }
  }
}

export const backupService = new BackupService();
