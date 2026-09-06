import { describe, it, expect } from 'vitest';
import { calculateAngle, analyzeSquatForm, JointKeypoint } from './computerVisionEngine';

describe('computerVisionEngine', () => {
  describe('calculateAngle', () => {
    it('calculates a 90 degree right angle correctly', () => {
      const p1 = { x: 0, y: 1 };
      const p2 = { x: 0, y: 0 };
      const p3 = { x: 1, y: 0 };

      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBe(90);
    });

    it('calculates a straight 180 degree line correctly', () => {
      const p1 = { x: -1, y: 0 };
      const p2 = { x: 0, y: 0 };
      const p3 = { x: 1, y: 0 };

      const angle = calculateAngle(p1, p2, p3);
      expect(angle).toBe(180);
    });
  });

  describe('analyzeSquatForm', () => {
    it('detects deep squat when knee angle is <= 95 degrees', () => {
      // Points simulating a deep squat with knee flexed under 90 degrees
      const hip: JointKeypoint = { name: 'hip', x: 0, y: 10, score: 0.95 };
      const knee: JointKeypoint = { name: 'knee', x: 10, y: 10, score: 0.95 };
      const ankle: JointKeypoint = { name: 'ankle', x: 10, y: 0, score: 0.95 };

      const result = analyzeSquatForm(hip, knee, ankle);
      expect(result.isDepthAchieved).toBe(true);
      expect(result.kneeAngleDegrees).toBe(90);
      expect(result.score).toBe(95);
      expect(result.feedback).toContain('Profundidad excelente');
    });

    it('detects shallow squat when knee angle is > 95 degrees', () => {
      // Points simulating an incomplete squat (~135 degrees)
      const hip: JointKeypoint = { name: 'hip', x: -7, y: 7, score: 0.95 };
      const knee: JointKeypoint = { name: 'knee', x: 0, y: 0, score: 0.95 };
      const ankle: JointKeypoint = { name: 'ankle', x: 10, y: 0, score: 0.95 };

      const result = analyzeSquatForm(hip, knee, ankle);
      expect(result.isDepthAchieved).toBe(false);
      expect(result.kneeAngleDegrees).toBeGreaterThan(95);
      expect(result.score).toBe(70);
      expect(result.feedback).toContain('Falta profundidad');
    });
  });
});
