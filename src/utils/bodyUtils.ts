import type { FatigueInput } from '../types/HumanBody';

const GROUP_ALIASES: Record<string, string> = {
  // English aliases
  shoulders: 'shoulders',
  shoulder: 'shoulders',
  deltoids: 'shoulders',
  delts: 'shoulders',
  chest: 'chest',
  biceps: 'biceps',
  bicep: 'biceps',
  triceps: 'triceps',
  tricep: 'triceps',
  forearms: 'forearms',
  forearm: 'forearms',
  abs: 'abs',
  abdominals: 'abs',
  abdominal: 'abs',
  back: 'back',
  lats: 'back',
  latissimus: 'back',
  traps: 'traps',
  trapezius: 'traps',
  lower_back: 'lower_back',
  'lower back': 'lower_back',
  lowerback: 'lower_back',
  quads: 'quads',
  quadriceps: 'quads',
  glutes: 'glutes',
  gluteus: 'glutes',
  hamstrings: 'hamstrings',
  hamstring: 'hamstrings',
  calves: 'calves',
  calf: 'calves',
  legs: 'quads',

  // Spanish aliases
  pecho: 'chest',
  espalda: 'back',
  cuádriceps: 'quads',
  cuadriceps: 'quads',
  isquios: 'hamstrings',
  isquiotibiales: 'hamstrings',
  hombros: 'shoulders',
  hombro: 'shoulders',
  tríceps: 'triceps',
  bíceps: 'biceps',
  abdominales: 'abs',
  abdomen: 'abs',
  gemelos: 'calves',
  pantorrillas: 'calves',
  glúteos: 'glutes',
  gluteos: 'glutes',
  trapecio: 'traps',
  trapecios: 'traps',
  antebrazo: 'forearms',
  antebrazos: 'forearms',
  lumbar: 'lower_back',
  zona_lumbar: 'lower_back',
  'zona lumbar': 'lower_back',
};

function resolveGroup(raw: string): string {
  const normalized = raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');

  if (GROUP_ALIASES[normalized]) {
    return GROUP_ALIASES[normalized];
  }

  const unaccented = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return GROUP_ALIASES[unaccented] ?? normalized;
}

export function normalizeFatigueData(input?: FatigueInput): Record<string, number> {
  if (!input) return {};
  const result: Record<string, number> = {};
  if (Array.isArray(input)) {
    for (const item of input) {
      const group = resolveGroup(item.muscleGroup);
      result[group] = Math.max(0, Math.min(100, item.fatiguePercent));
    }
  } else if (input instanceof Map) {
    input.forEach((val, key) => {
      const group = resolveGroup(key);
      result[group] = Math.max(0, Math.min(100, val));
    });
  } else {
    for (const [key, val] of Object.entries(input)) {
      const group = resolveGroup(key);
      result[group] = Math.max(0, Math.min(100, val));
    }
  }
  return result;
}
