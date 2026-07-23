/**
 * strengthScoreEngine.ts — DOTS Relative Strength Coefficient Engine.
 *
 * Calculates fair relative strength scores normalized for body weight and gender,
 * allowing athletes of different body weights to compare strength fairly.
 */

// Official DOTS Coefficients for Powerlifting (Male / Female)
const MALE_COEFFS = {
  a: -0.000001093,
  b: 0.0007391293,
  c: -0.1918759221,
  d: 24.0900786,
  e: -307.75376,
};

const FEMALE_COEFFS = {
  a: -0.0000010706,
  b: 0.0005158568,
  c: -0.1126655495,
  d: 13.6175032,
  e: -57.9038,
};

export interface StrengthScoreResult {
  dotsPoints: number;
  strengthCategory: string;
  percentileText: string;
}

export class StrengthScoreEngine {
  /**
   * Calculates the DOTS relative strength coefficient.
   */
  public calculateDots(
    totalLiftedKg: number,
    bodyWeightKg: number,
    gender: 'male' | 'female' | 'other' = 'male'
  ): StrengthScoreResult {
    if (totalLiftedKg <= 0 || bodyWeightKg <= 0) {
      return { dotsPoints: 0, strengthCategory: 'Sin Datos', percentileText: 'Registra entrenamientos para calcular tu puntaje.' };
    }

    const coeffs = gender === 'female' ? FEMALE_COEFFS : MALE_COEFFS;
    const bw = Math.min(Math.max(bodyWeightKg, 40), 200); // Clamp within reasonable body weight limits

    const denominator =
      coeffs.a * Math.pow(bw, 4) +
      coeffs.b * Math.pow(bw, 3) +
      coeffs.c * Math.pow(bw, 2) +
      coeffs.d * bw +
      coeffs.e;

    if (denominator <= 0) {
      return { dotsPoints: 0, strengthCategory: 'Sin Datos', percentileText: 'Rango fuera de escala.' };
    }

    const dots = Math.round((totalLiftedKg * 500) / denominator);
    const categoryInfo = this.getCategory(dots);

    return {
      dotsPoints: dots,
      strengthCategory: categoryInfo.category,
      percentileText: categoryInfo.percentile,
    };
  }

  private getCategory(dots: number): { category: string; percentile: string } {
    if (dots < 150) return { category: 'Iniciando', percentile: 'Superando la base' };
    if (dots < 250) return { category: 'Intermedio', percentile: 'Por encima de la media' };
    if (dots < 350) return { category: 'Avanzado', percentile: 'Top 25% de atletas' };
    if (dots < 450) return { category: 'Élite', percentile: 'Top 5% de atletas' };
    return { category: 'Leyenda de Fuerza', percentile: 'Nivel Powerlifting de Élite Mundial' };
  }
}

export const strengthScoreEngine = new StrengthScoreEngine();
