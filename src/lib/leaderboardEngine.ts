import { strengthScoreEngine } from './strengthScoreEngine';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatarUrl?: string;
  dotsPoints: number;
  strengthCategory: string;
  weeklyVolumeKg: number;
  streakDays: number;
  isCurrentUser?: boolean;
}

export const COMMUNITY_LEADERBOARD_SEED: Omit<LeaderboardEntry, 'rank'>[] = [
  { userId: 'user-001', name: 'Alex M. (Powerlifter)', dotsPoints: 462, strengthCategory: 'Leyenda de Fuerza', weeklyVolumeKg: 18400, streakDays: 14 },
  { userId: 'user-002', name: 'Elena V. (Calisthenics)', dotsPoints: 395, strengthCategory: 'Élite', weeklyVolumeKg: 14200, streakDays: 9 },
  { userId: 'user-003', name: 'Carlos R. (Hypertrophy)', dotsPoints: 340, strengthCategory: 'Avanzado', weeklyVolumeKg: 12500, streakDays: 7 },
  { userId: 'user-004', name: 'Sofia T. (CrossFit)', dotsPoints: 310, strengthCategory: 'Avanzado', weeklyVolumeKg: 11000, streakDays: 5 },
  { userId: 'user-005', name: 'Mateo P. (Strength)', dotsPoints: 275, strengthCategory: 'Intermedio', weeklyVolumeKg: 9400, streakDays: 4 },
  { userId: 'user-006', name: 'Lucía G.', dotsPoints: 230, strengthCategory: 'Intermedio', weeklyVolumeKg: 7800, streakDays: 3 },
  { userId: 'user-007', name: 'David B.', dotsPoints: 190, strengthCategory: 'Intermedio', weeklyVolumeKg: 5200, streakDays: 2 },
];

export function computeLeaderboard(
  currentUser: {
    userId: string;
    name: string;
    bodyWeightKg: number;
    totalLiftedKg: number;
    gender: 'male' | 'female' | 'other';
    weeklyVolumeKg: number;
    streakDays: number;
  },
  sortBy: 'dots' | 'volume' | 'streak' = 'dots'
): { entries: LeaderboardEntry[]; userRank: number; totalAthletes: number; userPercentileText: string } {
  const dotsRes = strengthScoreEngine.calculateDots(
    currentUser.totalLiftedKg,
    currentUser.bodyWeightKg,
    currentUser.gender
  );

  const userEntry: Omit<LeaderboardEntry, 'rank'> = {
    userId: currentUser.userId,
    name: `${currentUser.name || 'Tú'} (Tú)`,
    dotsPoints: dotsRes.dotsPoints || 280,
    strengthCategory: dotsRes.strengthCategory || 'Intermedio',
    weeklyVolumeKg: currentUser.weeklyVolumeKg || 8500,
    streakDays: currentUser.streakDays || 4,
    isCurrentUser: true,
  };

  const allEntries = [...COMMUNITY_LEADERBOARD_SEED, userEntry];

  // Ordenar según criterio seleccionado
  allEntries.sort((a, b) => {
    if (sortBy === 'dots') return b.dotsPoints - a.dotsPoints;
    if (sortBy === 'volume') return b.weeklyVolumeKg - a.weeklyVolumeKg;
    return b.streakDays - a.streakDays;
  });

  const rankedEntries: LeaderboardEntry[] = allEntries.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const userRankIndex = rankedEntries.findIndex((e) => e.isCurrentUser);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : rankedEntries.length;
  const totalAthletes = rankedEntries.length;

  const topPercent = Math.max(1, Math.round((userRank / totalAthletes) * 100));
  const userPercentileText = `Puesto #${userRank} de ${totalAthletes} atletas · Top ${topPercent}%`;

  return {
    entries: rankedEntries,
    userRank,
    totalAthletes,
    userPercentileText,
  };
}
