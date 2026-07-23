/**
 * gamificationEngine.ts — Athlete Level & XP Calculation Engine.
 *
 * Calculates cumulative Experience Points (XP) from completed sessions,
 * volume lifted, active streaks, and unlocked achievements.
 */

export interface AthleteLevelInfo {
  level: number;
  rankTitle: string;
  totalXP: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progressPercent: number;
}

export class GamificationEngine {
  /**
   * Calculates total XP based on user workout statistics.
   *  - 100 XP per completed session
   *  - 1 XP for every 100 kg of total volume lifted
   *  - 50 XP per day of active streak
   *  - 150 XP per unlocked achievement / PR
   */
  public calculateTotalXP(stats: {
    sessionsCount: number;
    totalVolumeKg: number;
    streakDays: number;
    achievementsCount: number;
  }): number {
    const sessionXP = stats.sessionsCount * 100;
    const volumeXP = Math.floor(stats.totalVolumeKg / 100);
    const streakXP = stats.streakDays * 50;
    const achievementXP = stats.achievementsCount * 150;

    return sessionXP + volumeXP + streakXP + achievementXP;
  }

  /**
   * Evaluates the athlete rank title and level progress for a given XP amount.
   * Uses quadratic scaling: Level N requires 200 * (N^1.2) XP.
   */
  public getAthleteLevelInfo(totalXP: number): AthleteLevelInfo {
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = 200;

    while (totalXP >= xpForNextLevel && level < 100) {
      level++;
      xpForCurrentLevel = xpForNextLevel;
      xpForNextLevel = Math.round(200 * Math.pow(level, 1.25));
    }

    const currentLevelXP = totalXP - xpForCurrentLevel;
    const levelXpRange = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = Math.min(100, Math.max(0, Math.round((currentLevelXP / levelXpRange) * 100)));

    return {
      level,
      rankTitle: this.getRankTitle(level),
      totalXP,
      currentLevelXP,
      nextLevelXP: levelXpRange,
      progressPercent,
    };
  }

  /**
   * Returns human-readable athletic rank titles based on level.
   */
  public getRankTitle(level: number): string {
    if (level < 5) return 'Novato del Hierro';
    if (level < 15) return 'Iniciado Disciplinado';
    if (level < 30) return 'Atleta de Élite';
    if (level < 50) return 'Titán de Acero';
    return 'Leyenda Estoica';
  }
}

export const gamificationEngine = new GamificationEngine();
