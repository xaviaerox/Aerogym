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

  it('encrypts and decrypts backup payload with valid passphrase', async () => {
    const backupObj = backupService.generateBackup({
      profile: { name: 'Secret User' },
      sessions: [{ id: 's100', user_id: 'u1', name: 'Chest Heavy', started_at: new Date().toISOString() } as any],
      workoutSetsHistory: [],
      routines: [],
      dailyHealth: [],
      bodyMeasurements: [],
    });

    const passphrase = 'SuperSecretPassword123!';
    const encryptedContainer = await backupService.encryptBackup(backupObj, passphrase);

    expect(encryptedContainer.encrypted).toBe(true);
    expect(encryptedContainer.ciphertext).toBeDefined();
    expect(encryptedContainer.salt).toBeDefined();
    expect(encryptedContainer.iv).toBeDefined();

    const decryptedResult = await backupService.decryptBackup(encryptedContainer, passphrase);
    expect(decryptedResult.valid).toBe(true);
    expect(decryptedResult.backup?.profile?.name).toBe('Secret User');
    expect(decryptedResult.backup?.sessions[0].name).toBe('Chest Heavy');
  });

  it('fails decryption when passphrase is wrong', async () => {
    const backupObj = backupService.generateBackup({
      profile: { name: 'Secret User' },
      sessions: [],
      workoutSetsHistory: [],
      routines: [],
      dailyHealth: [],
      bodyMeasurements: [],
    });

    const encryptedContainer = await backupService.encryptBackup(backupObj, 'RightPassphrase');
    const decryptedResult = await backupService.decryptBackup(encryptedContainer, 'WrongPassphrase');

    expect(decryptedResult.valid).toBe(false);
    expect(decryptedResult.error).toContain('Contraseña incorrecta');
  });
});
