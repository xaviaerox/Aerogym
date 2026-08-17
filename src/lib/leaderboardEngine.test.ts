import { describe, it, expect } from 'vitest';
import { computeLeaderboard } from './leaderboardEngine';

describe('leaderboardEngine', () => {
  it('computes correct ranking for current user sorted by DOTS', () => {
    const res = computeLeaderboard({
      userId: 'user-me',
      name: 'Atleta Test',
      bodyWeightKg: 75,
      totalLiftedKg: 400,
      gender: 'male',
      weeklyVolumeKg: 10000,
      streakDays: 5,
    }, 'dots');

    expect(res.entries.length).toBeGreaterThan(0);
    expect(res.userRank).toBeGreaterThan(0);
    expect(res.userPercentileText).toContain('Puesto #');
  });

  it('sorts by weekly volume correctly', () => {
    const res = computeLeaderboard({
      userId: 'user-me',
      name: 'Atleta Test',
      bodyWeightKg: 75,
      totalLiftedKg: 400,
      gender: 'male',
      weeklyVolumeKg: 50000, // Very high volume to guarantee #1 rank
      streakDays: 5,
    }, 'volume');

    expect(res.entries[0].isCurrentUser).toBe(true);
    expect(res.userRank).toBe(1);
  });
});
