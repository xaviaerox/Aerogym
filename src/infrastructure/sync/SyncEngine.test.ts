import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncEngine } from './SyncEngine';

vi.mock('../../lib/storageIndexedDB', () => ({
  getSyncQueue: vi.fn().mockResolvedValue([
    {
      id: 'sync-1',
      type: 'SAVE_SESSION',
      payload: { session: { user_id: 'user-1', name: 'Leg Day' }, sets: [] },
      timestamp: new Date().toISOString(),
      retryCount: 0,
    },
  ]),
  removeSyncAction: vi.fn().mockResolvedValue(undefined),
  setItemIndexedDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'session-100', name: 'Leg Day' }, error: null }),
        }),
      }),
    }),
  },
}));

describe('SyncEngine', () => {
  let engine: SyncEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new SyncEngine();
  });

  it('detects online status correctly', () => {
    expect(engine.isOnline()).toBe(true);
  });

  it('subscribes and notifies listeners during processQueue', async () => {
    const listener = vi.fn();
    const unsubscribe = engine.subscribe(listener);

    const result = await engine.processQueue();

    expect(listener).toHaveBeenCalledWith(true);
    expect(listener).toHaveBeenCalledWith(false);
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(0);

    unsubscribe();
  });
});
