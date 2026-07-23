import { describe, it, expect } from 'vitest';
import { strengthScoreEngine } from './strengthScoreEngine';

describe('StrengthScoreEngine', () => {
  it('returns 0 for non-positive input', () => {
    const res = strengthScoreEngine.calculateDots(0, 75, 'male');
    expect(res.dotsPoints).toBe(0);
    expect(res.strengthCategory).toBe('Sin Datos');
  });

  it('calculates reasonable DOTS score for a 75kg male lifting 300kg total', () => {
    const res = strengthScoreEngine.calculateDots(300, 75, 'male');
    expect(res.dotsPoints).toBeGreaterThan(100);
    expect(res.dotsPoints).toBeLessThan(400);
    expect(res.strengthCategory).toBeDefined();
  });

  it('calculates reasonable DOTS score for a 60kg female lifting 250kg total', () => {
    const res = strengthScoreEngine.calculateDots(250, 60, 'female');
    expect(res.dotsPoints).toBeGreaterThan(150);
    expect(res.strengthCategory).toBeDefined();
  });
});
