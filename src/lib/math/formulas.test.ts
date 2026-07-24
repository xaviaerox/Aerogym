import { describe, it, expect } from 'vitest';
import { calculateE1RM, calculateSetVolume, isPersonalRecord } from './formulas';

describe('formulas math domain module', () => {
  describe('calculateE1RM', () => {
    it('returns 0 if weight or reps are <= 0', () => {
      expect(calculateE1RM(0, 10)).toBe(0);
      expect(calculateE1RM(100, 0)).toBe(0);
      expect(calculateE1RM(-10, 5)).toBe(0);
    });

    it('returns exact weight for 1 rep', () => {
      expect(calculateE1RM(100, 1)).toBe(100);
    });

    it('calculates e1RM correctly using Epley formula for reps > 1', () => {
      // 100kg x 10 reps = 100 * (1 + 10/30) = 133.33
      expect(calculateE1RM(100, 10)).toBe(133.33);
    });
  });

  describe('calculateSetVolume', () => {
    it('returns 0 for non-positive inputs', () => {
      expect(calculateSetVolume(0, 5)).toBe(0);
      expect(calculateSetVolume(80, 0)).toBe(0);
    });

    it('multiplies weight by reps', () => {
      expect(calculateSetVolume(80, 8)).toBe(640);
    });
  });

  describe('isPersonalRecord', () => {
    it('returns true when current e1RM beats historical best', () => {
      expect(isPersonalRecord(105, 100)).toBe(true);
    });

    it('returns false when current e1RM is equal or lower', () => {
      expect(isPersonalRecord(100, 100)).toBe(false);
      expect(isPersonalRecord(95, 100)).toBe(false);
      expect(isPersonalRecord(0, 0)).toBe(false);
    });
  });
});
