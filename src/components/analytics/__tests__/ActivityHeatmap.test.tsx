import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ActivityHeatmap from '../ActivityHeatmap';
import type { WorkoutSession } from '../../../infrastructure/supabase/types';

describe('ActivityHeatmap component', () => {
  const mockSessions: WorkoutSession[] = [
    {
      id: 'session-1',
      user_id: 'user-1',
      routine_id: null,
      name: 'Fuerza Pecho y Tríceps',
      started_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
      duration_minutes: 60,
      total_volume_kg: 8500,
      notes: 'Excelente entreno',
      perceived_difficulty: 8,
      created_at: new Date().toISOString(),
    },
  ];

  it('renders title and KPI metrics correctly', () => {
    render(<ActivityHeatmap sessions={mockSessions} />);

    expect(screen.getAllByText('Matriz de Actividad y Esfuerzo')[0]).toBeDefined();
    expect(screen.getAllByText('Días Activos')[0]).toBeDefined();
    expect(screen.getAllByText('Racha Máxima')[0]).toBeDefined();
    expect(screen.getAllByText('Volumen Total')[0]).toBeDefined();
  });

  it('allows switching metrics (Volume, Effort, Duration, Sessions)', () => {
    render(<ActivityHeatmap sessions={mockSessions} />);

    const effortBtn = screen.getAllByText('Esfuerzo (RPE)')[0].closest('button')!;
    expect(effortBtn).toBeDefined();

    fireEvent.click(effortBtn);
    expect(effortBtn.className).toContain('bg-emerald-500');

    const durationBtn = screen.getAllByText('Minutos')[0].closest('button')!;
    fireEvent.click(durationBtn);
    expect(durationBtn.className).toContain('bg-emerald-500');
  });
});
