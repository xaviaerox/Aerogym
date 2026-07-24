/**
 * Módulo de dominio con fórmulas matemáticas centralizadas para entrenamiento y rendimiento físico.
 */

/**
 * Calcula el e1RM (Estimación de 1 Repetición Máxima) utilizando la fórmula de Epley.
 * Para repeticiones <= 1, el e1RM es exactamente el peso levantado.
 */
export function calculateE1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Number(weightKg.toFixed(2));
  const e1rm = weightKg * (1 + reps / 30);
  return Number(e1rm.toFixed(2));
}

/**
 * Calcula el volumen total de una serie (peso * repeticiones).
 */
export function calculateSetVolume(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  return Number((weightKg * reps).toFixed(2));
}

/**
 * Determina si una marca dada (e1RM) supera el récord histórico previo por un margen significativo.
 */
export function isPersonalRecord(currentE1RM: number, historicalBestE1RM: number): boolean {
  if (currentE1RM <= 0) return false;
  return currentE1RM > historicalBestE1RM;
}
