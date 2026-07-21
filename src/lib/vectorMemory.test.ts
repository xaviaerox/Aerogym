import { describe, it, expect } from 'vitest';
import { VectorMemoryEngine } from './vectorMemory';

describe('VectorMemoryEngine (RAG Memory)', () => {
  const engine = new VectorMemoryEngine();

  const mockSessions: any[] = [
    {
      id: 'session-1',
      name: 'Push Heavy',
      started_at: '2026-07-15T10:00:00Z',
      duration_minutes: 60,
      total_volume_kg: 4500,
      notes: 'Gran sensación en el hombro',
    },
    {
      id: 'session-2',
      name: 'Legs & Core',
      started_at: '2026-07-18T10:00:00Z',
      duration_minutes: 50,
      total_volume_kg: 6200,
      notes: 'Sentadilla muy fluida',
    },
  ];

  const mockSets: any[] = [
    {
      id: 'set-1',
      session_id: 'session-1',
      exercise_id: 'bench-press',
      reps: 5,
      weight_kg: 100,
      is_pr: true,
      e1rm_kg: 116,
      logged_at: '2026-07-15T10:30:00Z',
    },
    {
      id: 'set-2',
      session_id: 'session-2',
      exercise_id: 'squats',
      reps: 8,
      weight_kg: 120,
      is_pr: false,
      e1rm_kg: 150,
      logged_at: '2026-07-18T10:20:00Z',
    },
  ];

  it('builds memory documents from sessions and sets', () => {
    const docs = engine.buildMemoryDocuments(mockSessions, mockSets);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.some((d) => d.content.includes('Push Heavy'))).toBe(true);
    expect(docs.some((d) => d.type === 'pr')).toBe(true);
  });

  it('finds relevant history for specific keywords', () => {
    const results = engine.searchRelevantHistory('press de banca', mockSessions, mockSets);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toContain('Press de Banca');
  });

  it('finds relevant history for squat query', () => {
    const results = engine.searchRelevantHistory('sentadilla', mockSessions, mockSets);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].toLowerCase()).toContain('sentadilla');
  });
});
