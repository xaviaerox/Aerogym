import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useHabitStore } from '../useHabitStore';
import { supabaseHabitRepository } from '../../../infrastructure/repositories/SupabaseHabitRepository';
import type { Habit } from '../../../infrastructure/supabase/types';

vi.mock('../../../infrastructure/repositories/SupabaseHabitRepository', () => ({
  supabaseHabitRepository: {
    fetchHabits: vi.fn(),
    saveHabit: vi.fn(),
    updateHabit: vi.fn(),
    deleteHabit: vi.fn(),
    reorderHabits: vi.fn(),
    fetchHabitLogs: vi.fn(),
    toggleHabitLog: vi.fn(),
  },
}));

describe('useHabitStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHabitStore.setState({
      habits: [],
      habitLogs: [],
      selectedDate: '2026-09-05',
      isLoading: false,
      isSaving: false,
    });
  });

  it('creates a habit and adds it to the store', async () => {
    const mockHabit: Habit = {
      id: 'habit-1',
      user_id: 'user-1',
      name: 'NOPORN',
      description: 'Disciplina',
      category: 'discipline',
      icon: 'Shield',
      color: '#ef4444',
      frequency: 'daily',
      target_days: [1, 2, 3, 4, 5, 6, 0],
      order_index: 0,
      is_archived: false,
      created_at: '2026-09-05T00:00:00Z',
      updated_at: '2026-09-05T00:00:00Z',
    };

    vi.mocked(supabaseHabitRepository.saveHabit).mockResolvedValueOnce(mockHabit);

    const created = await useHabitStore.getState().createHabit('user-1', {
      name: 'NOPORN',
      description: 'Disciplina',
      category: 'discipline',
      icon: 'Shield',
      color: '#ef4444',
      frequency: 'daily',
      target_days: [1, 2, 3, 4, 5, 6, 0],
    });

    expect(created).toEqual(mockHabit);
    expect(useHabitStore.getState().habits).toHaveLength(1);
    expect(useHabitStore.getState().habits[0].name).toBe('NOPORN');
  });

  it('toggles habit log optimistically', async () => {
    await useHabitStore.getState().toggleHabitLog('user-1', 'habit-1', '2026-09-05');

    const logs = useHabitStore.getState().habitLogs;
    expect(logs).toHaveLength(1);
    expect(logs[0].habit_id).toBe('habit-1');
    expect(logs[0].completed).toBe(true);

    // Toggle again to uncomplete
    await useHabitStore.getState().toggleHabitLog('user-1', 'habit-1', '2026-09-05');
    expect(useHabitStore.getState().habitLogs[0].completed).toBe(false);
  });

  it('updates a habit in store', async () => {
    useHabitStore.setState({
      habits: [
        {
          id: 'habit-1',
          user_id: 'user-1',
          name: 'Old Name',
          description: null,
          category: 'fitness',
          icon: 'Dumbbell',
          color: '#3b82f6',
          frequency: 'daily',
          target_days: [1, 2, 3, 4, 5, 6, 0],
          order_index: 0,
          is_archived: false,
          created_at: '',
          updated_at: '',
        },
      ],
    });

    await useHabitStore.getState().updateHabit('habit-1', { name: 'New Name' });
    expect(useHabitStore.getState().habits[0].name).toBe('New Name');
  });

  it('deletes a habit from store', async () => {
    useHabitStore.setState({
      habits: [
        {
          id: 'habit-1',
          user_id: 'user-1',
          name: 'Delete Me',
          description: null,
          category: 'health',
          icon: 'Droplets',
          color: '#06b6d4',
          frequency: 'daily',
          target_days: [1, 2, 3, 4, 5, 6, 0],
          order_index: 0,
          is_archived: false,
          created_at: '',
          updated_at: '',
        },
      ],
    });

    await useHabitStore.getState().deleteHabit('habit-1');
    expect(useHabitStore.getState().habits).toHaveLength(0);
  });
});
