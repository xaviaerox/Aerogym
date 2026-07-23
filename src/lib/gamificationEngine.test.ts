import { describe, it, expect } from 'vitest';
import { gamificationEngine } from './gamificationEngine';

describe('GamificationEngine', () => {
  it('calculates total XP correctly', () => {
    const xp = gamificationEngine.calculateTotalXP({
      sessionsCount: 5,     // 500 XP
      totalVolumeKg: 10000, // 100 XP
      streakDays: 3,        // 150 XP
      achievementsCount: 2,  // 300 XP
    });
    expect(xp).toBe(1050);
  });

  it('determines athlete level 1 for 0 XP', () => {
    const info = gamificationEngine.getAthleteLevelInfo(0);
    expect(info.level).toBe(1);
    expect(info.rankTitle).toBe('Novato del Hierro');
    expect(info.progressPercent).toBe(0);
  });

  it('advances level as XP increases', () => {
    const info = gamificationEngine.getAthleteLevelInfo(1200);
    expect(info.level).toBeGreaterThan(1);
    expect(info.rankTitle).toBeDefined();
    expect(info.progressPercent).toBeGreaterThanOrEqual(0);
    expect(info.progressPercent).toBeLessThanOrEqual(100);
  });

  it('returns appropriate rank titles for higher levels', () => {
    expect(gamificationEngine.getRankTitle(2)).toBe('Novato del Hierro');
    expect(gamificationEngine.getRankTitle(10)).toBe('Iniciado Disciplinado');
    expect(gamificationEngine.getRankTitle(25)).toBe('Atleta de Élite');
    expect(gamificationEngine.getRankTitle(40)).toBe('Titán de Acero');
    expect(gamificationEngine.getRankTitle(60)).toBe('Leyenda Estoica');
  });
});
