/**
 * cardioScoreEngine.ts — Motor de Coeficiente de Resistencia Cardiovascular & Score Atlético.
 *
 * Normaliza el rendimiento aeróbico en una escala equivalente a DOTS (0-500 puntos)
 * evaluando volumen semanal (minutos), duración pico, ritmo/intensidad y peso corporal.
 */

export interface CardioSessionInput {
  duration_seconds?: number | null;
  distance_meters?: number | null;
  rpe?: number | null;
  logged_at?: string | Date;
}

export interface CardioScoreResult {
  cardioPoints: number;
  cardioCategory: string;
  percentileText: string;
  weeklyMinutesAvg: number;
  bestDurationMinutes: number;
  bestSpeedKmH: number | null;
}

export interface AthleticScoreResult {
  athleticPoints: number;
  strengthPoints: number;
  cardioPoints: number;
  category: string;
  percentileText: string;
  dominance: 'fuerza' | 'cardio' | 'hibrido' | 'sin_datos';
}

export class CardioScoreEngine {
  /**
   * Calcula el puntaje de resistencia cardiovascular en escala 0-500.
   */
  public calculateCardioScore(
    cardioSets: CardioSessionInput[],
    bodyWeightKg = 70,
    gender: 'male' | 'female' | 'other' = 'male'
  ): CardioScoreResult {
    const validSets = (cardioSets || []).filter(
      (s) => s && s.duration_seconds && s.duration_seconds > 0
    );

    if (validSets.length === 0) {
      return {
        cardioPoints: 0,
        cardioCategory: 'Sin Datos',
        percentileText: 'Registra ejercicios de cardio para calcular tu puntaje aeróbico.',
        weeklyMinutesAvg: 0,
        bestDurationMinutes: 0,
        bestSpeedKmH: null,
      };
    }

    // 1. Duración total y media semanal (últimos 28 días)
    const now = new Date();
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const recentSets = validSets.filter((s) => {
      if (!s.logged_at) return true;
      const d = new Date(s.logged_at);
      return d >= fourWeeksAgo;
    });

    const setsToAnalyze = recentSets.length > 0 ? recentSets : validSets;

    const totalMinutes = setsToAnalyze.reduce(
      (sum, s) => sum + (s.duration_seconds || 0) / 60,
      0
    );

    // Semanas activas estimadas (mínimo 1, máximo 4)
    const weeklyMinutesAvg = Math.round(totalMinutes / 4);

    // Puntos por volumen semanal (hasta 240 pts)
    // 60 min/sem = 80 pts; 150 min/sem (OMS) = 175 pts; 240 min/sem (4h) = 240 pts
    const volumeScore = Math.min(240, (weeklyMinutesAvg / 150) * 175);

    // 2. Mejor sesión continua (hasta 130 pts)
    const bestDurationSeconds = Math.max(
      ...setsToAnalyze.map((s) => s.duration_seconds || 0)
    );
    const bestDurationMinutes = Math.round(bestDurationSeconds / 60);

    // 30 min = 60 pts; 60 min = 100 pts; 90+ min = 130 pts
    const durationScore = Math.min(130, (bestDurationMinutes / 60) * 100);

    // 3. Intensidad / Ritmo pico (hasta 130 pts)
    let bestSpeedKmH: number | null = null;
    let intensityScore = 0;

    const setsWithDistance = setsToAnalyze.filter(
      (s) => s.distance_meters && s.distance_meters > 0 && s.duration_seconds && s.duration_seconds > 0
    );

    if (setsWithDistance.length > 0) {
      setsWithDistance.forEach((s) => {
        const hours = (s.duration_seconds || 1) / 3600;
        const km = (s.distance_meters || 0) / 1000;
        const speed = km / hours;
        if (!bestSpeedKmH || speed > bestSpeedKmH) {
          bestSpeedKmH = Number(speed.toFixed(2));
        }
      });

      if (bestSpeedKmH !== null) {
        // Velocidad: 6 km/h = 50 pts; 10 km/h = 90 pts; 14+ km/h = 130 pts
        intensityScore = Math.min(130, Math.max(30, (bestSpeedKmH / 12) * 100));
      }
    } else {
      // Fallback a RPE reportado
      const maxRPE = Math.max(...setsToAnalyze.map((s) => s.rpe || 6));
      intensityScore = Math.min(130, (maxRPE / 10) * 110);
    }

    // 4. Normalización por peso y género
    const bw = Math.min(Math.max(bodyWeightKg > 0 ? bodyWeightKg : 70, 40), 160);
    const weightFactor = Math.pow(bw / 70, 0.25);
    const genderFactor = gender === 'female' ? 1.08 : 1.0;

    const rawTotal = (volumeScore + durationScore + intensityScore) * weightFactor * genderFactor;
    const cardioPoints = Math.min(500, Math.max(0, Math.round(rawTotal)));

    const categoryInfo = this.getCategory(cardioPoints);

    return {
      cardioPoints,
      cardioCategory: categoryInfo.category,
      percentileText: categoryInfo.percentile,
      weeklyMinutesAvg,
      bestDurationMinutes,
      bestSpeedKmH,
    };
  }

  /**
   * Pondera el Score Atlético Global combinando Fuerza (DOTS) y Resistencia (Cardio).
   */
  public calculateAthleticScore(
    strengthPoints: number,
    cardioPoints: number,
    goal: string = 'Hipertrofia'
  ): AthleticScoreResult {
    const hasStrength = strengthPoints > 0;
    const hasCardio = cardioPoints > 0;

    if (!hasStrength && !hasCardio) {
      return {
        athleticPoints: 0,
        strengthPoints: 0,
        cardioPoints: 0,
        category: 'Sin Datos',
        percentileText: 'Completa sesiones de fuerza o cardio para calcular tu nivel.',
        dominance: 'sin_datos',
      };
    }

    if (hasStrength && !hasCardio) {
      const cat = this.getCategory(strengthPoints);
      return {
        athleticPoints: strengthPoints,
        strengthPoints,
        cardioPoints: 0,
        category: cat.category,
        percentileText: cat.percentile,
        dominance: 'fuerza',
      };
    }

    if (!hasStrength && hasCardio) {
      const cat = this.getCategory(cardioPoints);
      return {
        athleticPoints: cardioPoints,
        strengthPoints: 0,
        cardioPoints,
        category: cat.category,
        percentileText: cat.percentile,
        dominance: 'cardio',
      };
    }

    // Perfil Híbrido: Ponderar según objetivo
    let strengthWeight = 0.6;
    let cardioWeight = 0.4;

    const normalizedGoal = (goal || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalizedGoal.includes('fuerza')) {
      strengthWeight = 0.75;
      cardioWeight = 0.25;
    } else if (normalizedGoal.includes('hipertrofia') || normalizedGoal.includes('musculo')) {
      strengthWeight = 0.7;
      cardioWeight = 0.3;
    } else if (normalizedGoal.includes('definicion')) {
      strengthWeight = 0.5;
      cardioWeight = 0.5;
    } else if (normalizedGoal.includes('mantenimiento')) {
      strengthWeight = 0.55;
      cardioWeight = 0.45;
    }

    const athleticPoints = Math.round(
      strengthPoints * strengthWeight + cardioPoints * cardioWeight
    );
    const cat = this.getCategory(athleticPoints);

    return {
      athleticPoints,
      strengthPoints,
      cardioPoints,
      category: cat.category,
      percentileText: cat.percentile,
      dominance: 'hibrido',
    };
  }

  public getCategory(points: number): { category: string; percentile: string } {
    if (points < 150) return { category: 'Iniciando', percentile: 'Superando la base aeróbica' };
    if (points < 250) return { category: 'Intermedio', percentile: 'Capacidad cardiovascular sólida' };
    if (points < 350) return { category: 'Avanzado', percentile: 'Top 25% resistencia aeróbica' };
    if (points < 450) return { category: 'Élite', percentile: 'Top 5% atletas de fondo' };
    return { category: 'Leyenda de Resistencia', percentile: 'Nivel Fondo y Capacidad Élite Mundial' };
  }
}

export const cardioScoreEngine = new CardioScoreEngine();
