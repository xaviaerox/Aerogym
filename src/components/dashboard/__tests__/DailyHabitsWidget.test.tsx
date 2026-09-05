import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DailyHabitsWidget from '../DailyHabitsWidget';
import { useHabitStore } from '../../../application/stores/useHabitStore';
import { useAuthStore } from '../../../application/stores/useAuthStore';
import { formatDateString } from '../../../lib/habitsEngine';

vi.mock('../../../application/stores/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('DailyHabitsWidget component', () => {
  const mockOnOpenHabits = vi.fn();

  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'user-1' },
    } as any);

    useHabitStore.setState({
      habits: [],
      habitLogs: [],
      selectedDate: formatDateString(new Date()),
    });
  });

  it('renders empty callout when no habits exist yet', () => {
    render(<DailyHabitsWidget onOpenHabits={mockOnOpenHabits} />);

    expect(screen.getByText('Hábitos de Hoy')).toBeDefined();
    expect(screen.getByText('Configurar tus hábitos diarios')).toBeDefined();

    fireEvent.click(screen.getByText('Configurar tus hábitos diarios'));
    expect(mockOnOpenHabits).toHaveBeenCalledTimes(1);
  });

  it('renders habits checklist when habits are present', () => {
    const todayStr = formatDateString(new Date());

    useHabitStore.setState({
      habits: [
        {
          id: 'h1',
          user_id: 'user-1',
          name: 'NOPORN',
          description: null,
          category: 'discipline',
          icon: 'Shield',
          color: '#ef4444',
          frequency: 'daily',
          target_days: [1, 2, 3, 4, 5, 6, 0],
          order_index: 0,
          is_archived: false,
          created_at: '',
          updated_at: '',
        },
      ],
      habitLogs: [
        {
          id: 'l1',
          habit_id: 'h1',
          user_id: 'user-1',
          date: todayStr,
          completed: true,
          notes: null,
          created_at: '',
          updated_at: '',
        },
      ],
    });

    render(<DailyHabitsWidget onOpenHabits={mockOnOpenHabits} />);

    expect(screen.getByText('NOPORN')).toBeDefined();
    expect(screen.getByText('1/1 (100%)')).toBeDefined();
  });
});
