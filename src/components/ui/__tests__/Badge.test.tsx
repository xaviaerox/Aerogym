import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../Badge';

describe('Badge component', () => {
  it('renders badge label correctly', () => {
    render(<Badge variant="success">PR Batido</Badge>);
    expect(screen.getByText('PR Batido')).toBeDefined();
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Test</Badge>);
    const element = screen.getByText('Test');
    expect(element.className).toContain('custom-class');
  });
});
