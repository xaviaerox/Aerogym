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

/**
 * Calcula el volumen equivalente en kg para un ejercicio cardiovascular.
 * En fisiología del entrenamiento, 1 minuto de cardio moderado-vigoroso equivale
 * a mover ~175 kg de carga mecánica (2.5 kg/min por kg de peso corporal para 70 kg de base).
 * Se modula por el RPE percibido y la distancia recorrida si están disponibles.
 */
export function calculateCardioEquivalentVolume(
  durationSeconds: number,
  bodyWeightKg = 70,
  rpe?: number | null,
  distanceMeters?: number | null
): number {
  if (durationSeconds <= 0) return 0;

  const minutes = durationSeconds / 60;
  const bw = Math.min(Math.max(bodyWeightKg > 0 ? bodyWeightKg : 70, 40), 160);

  // Modulador de intensidad basado en RPE (RPE 5 = 1.0; RPE 8 = 1.24; RPE 10 = 1.4)
  let intensityMultiplier = 1.0;
  if (rpe && rpe >= 1) {
    const clampedRPE = Math.min(10, Math.max(1, rpe));
    intensityMultiplier = 0.6 + clampedRPE * 0.08;
  }

  // Carga basada en tiempo (kg equivalente)
  const timeBasedVolume = minutes * (bw * 2.5) * intensityMultiplier;

  // Carga basada en desplazamiento/distancia (1.2 kg por metro normalizado a peso)
  const distanceBasedVolume = distanceMeters && distanceMeters > 0
    ? distanceMeters * 1.2 * (bw / 70) * intensityMultiplier
    : 0;

  const finalVolume = Math.max(timeBasedVolume, distanceBasedVolume);
  return Math.round(finalVolume);
}

/**
 * Evalúa si una serie cardiovascular constituye un Récord Personal (PR)
 * comparando tiempo total, distancia o ritmo/velocidad contra la mejor marca histórica.
 */
export function isCardioPersonalRecord(
  currentDuration: number,
  currentDistance: number | null,
  historicBestDuration: number,
  historicBestDistance: number | null
): boolean {
  if (currentDuration <= 0) return false;

  // Si no existe historial previo, marca inicial válida
  if (historicBestDuration <= 0 && (!historicBestDistance || historicBestDistance <= 0)) {
    return true;
  }

  // Récord en duración sostenida (> mejor tiempo previo)
  if (historicBestDuration > 0 && currentDuration > historicBestDuration) {
    return true;
  }

  // Récord en distancia (> mejor distancia previa)
  if (
    currentDistance !== null &&
    currentDistance > 0 &&
    historicBestDistance !== null &&
    historicBestDistance > 0 &&
    currentDistance > historicBestDistance
  ) {
    return true;
  }

  // Récord en ritmo / velocidad para distancias comparables (>= 500m)
  if (
    currentDistance &&
    currentDistance >= 500 &&
    historicBestDistance &&
    historicBestDistance >= 500 &&
    historicBestDuration > 0
  ) {
    const currentSpeed = currentDistance / currentDuration;
    const historicSpeed = historicBestDistance / historicBestDuration;
    if (currentSpeed > historicSpeed * 1.01) {
      return true;
    }
  }

  return false;
}

/**
 * Calcula el ritmo (min/km) y velocidad (km/h) para una serie cardiovascular con distancia.
 */
export function calculateCardioPace(
  durationSeconds: number,
  distanceMeters: number
): { paceMinKm: number; speedKmH: number } | null {
  if (durationSeconds <= 0 || distanceMeters <= 0) return null;

  const distanceKm = distanceMeters / 1000;
  const durationHours = durationSeconds / 3600;
  const speedKmH = Number((distanceKm / durationHours).toFixed(2));

  const paceMinutesPerKm = durationSeconds / 60 / distanceKm;
  return {
    paceMinKm: Number(paceMinutesPerKm.toFixed(2)),
    speedKmH,
  };
}
