/**
 * voiceParserEngine.ts — Extractor de Lenguaje Natural (NL) para dictado inteligente de series por voz.
 * Parsea comandos hablados como "100 kg a 8 repeticiones" o "80 kilos 10 reps rpe 8".
 */

export interface ParsedVoiceSet {
  weightKg: number | null;
  reps: number | null;
  rpe: number | null;
  rawText: string;
}

export function parseVoiceInputToSet(rawInput: string): ParsedVoiceSet {
  if (!rawInput || typeof rawInput !== 'string') {
    return { weightKg: null, reps: null, rpe: null, rawText: '' };
  }

  const normalized = rawInput.toLowerCase().trim();

  // 1. Extraer Peso (ej: "100 kg", "82.5 kilos", "100k")
  let weightKg: number | null = null;
  const weightMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(?:kg|kilos?|kilo|k)\b/i);
  if (weightMatch) {
    weightKg = parseFloat(weightMatch[1].replace(',', '.'));
  }

  // 2. Extraer Repeticiones (ej: "8 repeticiones", "10 reps", "8 r")
  let reps: number | null = null;
  const repsMatch = normalized.match(/(\d+)\s*(?:repeticiones|reps?|rep)\b/i);
  if (repsMatch) {
    reps = parseInt(repsMatch[1], 10);
  } else if (!weightMatch) {
    // Si no hay unidad de kg, intentar tomar el primer número como reps
    const numberMatch = normalized.match(/\b(\d+)\b/);
    if (numberMatch) {
      reps = parseInt(numberMatch[1], 10);
    }
  }

  // 3. Extraer RPE (ej: "rpe 8", "rpe 8.5")
  let rpe: number | null = null;
  const rpeMatch = normalized.match(/\brpe\s*(\d+(?:[.,]\d+)?)\b/i);
  if (rpeMatch) {
    rpe = parseFloat(rpeMatch[1].replace(',', '.'));
  }

  return {
    weightKg,
    reps,
    rpe,
    rawText: rawInput,
  };
}
