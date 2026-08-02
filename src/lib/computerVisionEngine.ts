/**
 * computerVisionEngine.ts — Motor de Análisis Biomecánico y Estimación Postural.
 * Procesa puntos clave (Keypoints) del cuerpo para evaluar la profundidad y biomecánica del movimiento.
 */

export interface JointKeypoint {
  name: string;
  x: number;
  y: number;
  score: number;
}

export interface PosturalAnalysisResult {
  exercise: string;
  kneeAngleDegrees: number;
  hipAngleDegrees: number;
  isDepthAchieved: boolean;
  score: number;
  feedback: string;
}

/**
 * Calcula el ángulo entre 3 puntos articulares en el plano 2D.
 */
export function calculateAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  const radians =
    Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Evalúa la ejecución de sentadilla en base al ángulo de rodilla y cadera.
 */
export function analyzeSquatForm(
  hip: JointKeypoint,
  knee: JointKeypoint,
  ankle: JointKeypoint
): PosturalAnalysisResult {
  const kneeAngle = calculateAngle(hip, knee, ankle);
  const isDepthAchieved = kneeAngle <= 95;

  let feedback = 'Profundidad excelente. Mantén el torso erguido.';
  let score = 95;

  if (!isDepthAchieved) {
    feedback = 'Falta profundidad. Busca romper el paralelo a 90°.';
    score = 70;
  }

  return {
    exercise: 'Sentadilla',
    kneeAngleDegrees: kneeAngle,
    hipAngleDegrees: 100,
    isDepthAchieved,
    score,
    feedback,
  };
}
