import { describe, it, expect } from 'vitest';
import { backupService } from './backupService';

describe('BackupService', () => {
  it('generates a valid backup object with version and timestamp', () => {
    const backup = backupService.generateBackup({
      profile: { name: 'Test' },
      sessions: [],
      workoutSetsHistory: [],
      routines: [],
      dailyHealth: [],
      bodyMeasurements: [],
    });

    expect(backup.version).toBe('2.0.0');
    expect(backup.exportedAt).toBeDefined();
    expect(backup.profile?.name).toBe('Test');
    expect(backup.sessions).toEqual([]);
  });

  it('validates a correct JSON string', () => {
    const backupObj = backupService.generateBackup({
      sessions: [{ id: 's1', user_id: 'u1', name: 'Leg Day', started_at: new Date().toISOString() } as any],
      workoutSetsHistory: [],
      routines: [],
      dailyHealth: [],
      bodyMeasurements: [],
    });

    const jsonStr = JSON.stringify(backupObj);
    const result = backupService.validateBackupJSON(jsonStr);

    expect(result.valid).toBe(true);
    expect(result.backup?.sessions).toHaveLength(1);
    expect(result.backup?.sessions[0].name).toBe('Leg Day');
  });

  it('rejects invalid JSON structure', () => {
    const invalidJSON = JSON.stringify({ randomField: 123 });
    const result = backupService.validateBackupJSON(invalidJSON);

    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
