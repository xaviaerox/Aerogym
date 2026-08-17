import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RestTimer from '../RestTimer';

describe('RestTimer Component', () => {
  it('renders null when startTime is null', () => {
    const { container } = render(<RestTimer startTime={null} onClear={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders timer when startTime is provided', () => {
    const startTime = Date.now();
    render(<RestTimer startTime={startTime} onClear={vi.fn()} />);
    expect(screen.getByText('Descanso')).toBeDefined();
  });
});
