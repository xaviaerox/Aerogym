import { describe, it, expect } from 'vitest';
import {
  calculateE1RM,
  calculateSetVolume,
  isPersonalRecord,
  calculateCardioEquivalentVolume,
  isCardioPersonalRecord,
  calculateCardioPace,
} from './formulas';

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

  describe('calculateCardioEquivalentVolume', () => {
    it('returns 0 for non-positive duration', () => {
      expect(calculateCardioEquivalentVolume(0)).toBe(0);
      expect(calculateCardioEquivalentVolume(-60)).toBe(0);
    });

    it('calculates baseline volume correctly for 30 minutes (70kg athlete)', () => {
      // 30 min * (70 * 2.5) * 1.0 = 5,250 kg
      const vol = calculateCardioEquivalentVolume(1800, 70);
      expect(vol).toBe(5250);
    });

    it('modulates volume with RPE intensity factor', () => {
      // RPE 8: factor = 0.6 + 8 * 0.08 = 1.24. 30 min * 175 * 1.24 = 6,510 kg
      const volRPE8 = calculateCardioEquivalentVolume(1800, 70, 8);
      expect(volRPE8).toBe(6510);
    });

    it('uses distance-based volume when it exceeds time-based volume', () => {
      // 10km (10000m) in 30min: 10000 * 1.2 = 12,000 kg > 5,250 kg
      const volWithDistance = calculateCardioEquivalentVolume(1800, 70, 5, 10000);
      expect(volWithDistance).toBe(12000);
    });
  });

  describe('isCardioPersonalRecord', () => {
    it('returns true for first time recording valid duration', () => {
      expect(isCardioPersonalRecord(1800, null, 0, null)).toBe(true);
    });

    it('returns false for non-positive current duration', () => {
      expect(isCardioPersonalRecord(0, 5000, 1800, 4000)).toBe(false);
    });

    it('detects duration PR', () => {
      expect(isCardioPersonalRecord(2400, null, 1800, null)).toBe(true);
      expect(isCardioPersonalRecord(1500, null, 1800, null)).toBe(false);
    });

    it('detects distance PR', () => {
      expect(isCardioPersonalRecord(1800, 6000, 1800, 5000)).toBe(true);
      expect(isCardioPersonalRecord(1800, 4500, 1800, 5000)).toBe(false);
    });

    it('detects pace PR for comparable distance', () => {
      // Ran 5000m in 1500s (faster pace than 5000m in 1800s)
      expect(isCardioPersonalRecord(1500, 5000, 1800, 5000)).toBe(true);
    });
  });

  describe('calculateCardioPace', () => {
    it('returns null for non-positive inputs', () => {
      expect(calculateCardioPace(0, 5000)).toBeNull();
      expect(calculateCardioPace(1800, 0)).toBeNull();
    });

    it('calculates pace and speed correctly', () => {
      // 5km in 30min (1800s): pace = 6 min/km, speed = 10 km/h
      const res = calculateCardioPace(1800, 5000);
      expect(res).not.toBeNull();
      expect(res?.paceMinKm).toBe(6);
      expect(res?.speedKmH).toBe(10);
    });
  });
});
