import { describe, it, expect } from 'vitest';
import { calculateE1RM, getBestE1RM, suggestWeight } from './engine';

describe('engine calculations', () => {
  describe('calculateE1RM', () => {
    it('returns 0 when weight or reps are 0 or negative', () => {
      expect(calculateE1RM(0, 10)).toBe(0);
      expect(calculateE1RM(100, 0)).toBe(0);
      expect(calculateE1RM(-50, 5)).toBe(0);
    });

    it('returns exact weight for 1 rep', () => {
      expect(calculateE1RM(100, 1)).toBe(100);
    });

    it('calculates Epley 1RM correctly for multiple reps', () => {
      // 100kg * (1 + 10/30) = 133.33kg
      const e1rm = calculateE1RM(100, 10);
      expect(e1rm).toBeCloseTo(133.33, 1);
    });
  });

  describe('getBestE1RM', () => {
    it('returns highest 1RM from set history', () => {
      const mockSessions = [
        {
          id: 's-1',
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                { weight: 80, reps: 10, completed: true },  // ~106.6
                { weight: 100, reps: 5, completed: true },  // ~116.6
                { weight: 120, reps: 1, completed: true },  // 120
              ],
            },
          ],
        },
      ];
      expect(getBestE1RM(mockSessions as any, 'bench-press')).toBe(120);
    });

    it('ignores incomplete sets', () => {
      const mockSessions = [
        {
          id: 's-1',
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                { weight: 80, reps: 10, completed: true },
                { weight: 200, reps: 10, completed: false },
              ],
            },
          ],
        },
      ];
      expect(getBestE1RM(mockSessions as any, 'bench-press')).toBeCloseTo(106.67, 1);
    });
  });

  describe('suggestWeight', () => {
    it('recommends weight based on target reps and previous best 1RM', () => {
      const best1RM = 100;
      const weight = suggestWeight(best1RM, 10);
      expect(weight).toBeGreaterThan(0);
      expect(weight).toBeLessThan(best1RM);
    });
  });
});
