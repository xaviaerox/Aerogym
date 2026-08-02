import { describe, it, expect } from 'vitest';
import { calculateAngle } from './computerVisionEngine';
import { parseVoiceInputToSet } from './voiceParserEngine';

describe('voiceParserEngine', () => {
  it('parses spoken weight and reps accurately', () => {
    const result = parseVoiceInputToSet('100 kg a 8 repeticiones');

    expect(result.weightKg).toBe(100);
    expect(result.reps).toBe(8);
  });

  it('parses fractional weight and RPE values', () => {
    const result = parseVoiceInputToSet('82.5 kilos 10 reps RPE 8.5');

    expect(result.weightKg).toBe(82.5);
    expect(result.reps).toBe(10);
    expect(result.rpe).toBe(8.5);
  });

  it('handles empty input gracefully', () => {
    const result = parseVoiceInputToSet('');

    expect(result.weightKg).toBeNull();
    expect(result.reps).toBeNull();
  });
});

describe('computerVisionEngine', () => {
  it('calculates joint angle between 3 keypoints', () => {
    const p1 = { x: 0, y: 10 };
    const p2 = { x: 0, y: 0 };
    const p3 = { x: 10, y: 0 };

    const angle = calculateAngle(p1, p2, p3);
    expect(angle).toBe(90);
  });
});
