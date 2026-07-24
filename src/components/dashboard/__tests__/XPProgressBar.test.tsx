import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import XPProgressBar from '../XPProgressBar';

describe('XPProgressBar component', () => {
  it('renders level and total XP correctly', () => {
    render(
      <XPProgressBar
        userXP={{
          level: 5,
          total: 2500,
          progressPercent: 45,
        }}
      />
    );

    expect(screen.getByText('Nivel 5')).toBeDefined();
    expect(screen.getByText('2500 XP total')).toBeDefined();
    expect(screen.getByText('45% para Lvl 6')).toBeDefined();
  });
});
