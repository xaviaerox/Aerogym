import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '../Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Iniciar Entreno</Button>);
    expect(screen.getByRole('button', { name: /iniciar entreno/i })).toBeDefined();
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Guardar</Button>);
    screen.getByRole('button', { name: /guardar/i }).click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when isLoading is true', () => {
    render(<Button isLoading>Cargando</Button>);
    const btn = screen.getByRole('button', { name: /cargando/i });
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});
