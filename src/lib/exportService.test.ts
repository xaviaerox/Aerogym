import { describe, it, expect, vi } from 'vitest';
import { exportUserData, parseImportJSON, exportSessionsToCSV } from './exportService';

vi.mock('./storageIndexedDB', () => ({
  getItemIndexedDB: vi.fn(),
  setItemIndexedDB: vi.fn().mockResolvedValue(undefined),
  STORE_SESSIONS: 'sessions_cache',
  STORE_HEALTH: 'health_cache',
}));

describe('exportService', () => {
  it('generates a valid export payload structure', async () => {
    const mockProfile = { id: 'u-1', name: 'Atleta' } as any;
    const mockSessions = [{ id: 's-1', name: 'Empuje' }] as any;
    const mockSets = [{ id: 'st-1', weight_kg: 80 }] as any;
    const mockHealth = [{ date: '2026-07-21', steps: 10000 }] as any;

    const data = await exportUserData('u-1', mockProfile, mockSessions, mockSets, mockHealth, []);

    expect(data.version).toBe('2.0.0');
    expect(data.profile?.name).toBe('Atleta');
    expect(data.sessions.length).toBe(1);
    expect(data.dailyHealth.length).toBe(1);
  });

  it('parses valid import JSON correctly', () => {
    const jsonStr = JSON.stringify({
      version: '2.0.0',
      exportedAt: '2026-07-21T00:00:00Z',
      sessions: [{ id: 's-1' }],
      dailyHealth: [{ date: '2026-07-21' }],
    });

    const parsed = parseImportJSON(jsonStr);
    expect(parsed.version).toBe('2.0.0');
    expect(parsed.sessions.length).toBe(1);
  });

  it('throws error for invalid import JSON', () => {
    expect(() => parseImportJSON('{"invalid": true}')).toThrow();
  });

  it('generates CSV report formatted correctly for workout sessions', () => {
    const mockSessions = [
      { id: 's1', name: 'Torso Fuerza', started_at: '2026-07-27T10:00:00Z', duration_minutes: 60, total_volume_kg: 4500 }
    ] as any;

    const mockSets = [
      { session_id: 's1', exercise_id: 'bench-press', set_number: 1, weight_kg: 100, reps: 5, rpe: 8, rir: 2, e1rm_kg: 116 }
    ] as any;

    const csv = exportSessionsToCSV(mockSessions, mockSets);

    expect(csv).toContain('Fecha,Sesión,Duración (min),Volumen Total (kg)');
    expect(csv).toContain('"Torso Fuerza"');
    expect(csv).toContain('"bench-press"');
    expect(csv).toContain('100,5,8,2,116');
  });
});
