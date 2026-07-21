import { describe, it, expect, vi } from 'vitest';
import { exportUserData, parseImportJSON } from './exportService';

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
});
