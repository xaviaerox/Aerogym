// ExerciseDB OSS API – fetches animated exercise GIFs freely without API key.
// Docs: https://oss.exercisedb.dev  |  GIF URL: https://static.exercisedb.dev/media/{id}.gif

const BASE_URL = 'https://oss.exercisedb.dev/api/v1/exercises';
const PAGE_SIZE = 400; // fetch a good batch per request
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in-memory cache

// Maps our MuscleWiki muscle names → ExerciseDB targetMuscles values
const MUSCLE_MAP: Record<string, string[]> = {
  Biceps:       ['biceps'],
  Chest:        ['pectorals'],
  Lats:         ['lats'],
  Quadriceps:   ['quads'],
  Hamstrings:   ['hamstrings'],
  Glutes:       ['glutes'],
  Shoulders:    ['delts'],
  Triceps:      ['triceps'],
  Abs:          ['abs'],
  Obliques:     ['abs'],
  'Middle Back':['upper back', 'lats'],
  'Lower Back': ['spine', 'lower back'],
  Calves:       ['calves'],
  Forearms:     ['forearms', 'biceps'],
  Traps:        ['traps', 'upper back'],
};

// Spanish term to English mapping for fallback search
const ES_TO_EN_KEYWORDS: Record<string, string> = {
  'burpee': 'burpee',
  'sentadilla': 'squat',
  'sentadillas': 'squat',
  'zancada': 'lunge',
  'zancadas': 'lunge',
  'flexion': 'push up',
  'flexiones': 'push up',
  'dominada': 'pull up',
  'dominadas': 'pull up',
  'peso muerto': 'deadlift',
  'remo': 'row',
  'pres': 'press',
  'press': 'press',
  'pecho': 'chest',
  'hombro': 'shoulder',
  'hombros': 'shoulder',
  'espalda': 'back',
  'biceps': 'biceps',
  'triceps': 'triceps',
  'gemelos': 'calves',
  'elevacion': 'raise',
  'elevaciones': 'raise',
  'encogimiento': 'crunch',
  'encogimientos': 'crunch',
  'plancha': 'plank',
  'curl': 'curl',
};

// Keywords to skip when doing name-based matching (stop words)
const STOP_WORDS = new Set(['with', 'the', 'and', 'for', 'from', 'using', 'on', 'in', 'at', 'of', 'a', 'de', 'con', 'para', 'del', 'las', 'los', 'un', 'una']);

interface ExerciseDBItem {
  exerciseId: string;
  name: string;
  gifUrl: string;
  bodyParts: string[];
  equipments: string[];
  targetMuscles: string[];
  secondaryMuscles: string[];
}

// In-memory state
let allExercisesCache: ExerciseDBItem[] | null = null;
let cacheTime = 0;

// Per-exercise GIF cache (exerciseName → gifUrl)
const gifCache = new Map<string, string>();

async function fetchBatch(): Promise<ExerciseDBItem[]> {
  const now = Date.now();
  if (allExercisesCache && now - cacheTime < CACHE_TTL_MS) {
    return allExercisesCache;
  }

  try {
    const res = await fetch(`${BASE_URL}?limit=${PAGE_SIZE}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    allExercisesCache = (json.data as ExerciseDBItem[]) || [];
    cacheTime = Date.now();
    return allExercisesCache;
  } catch {
    return [];
  }
}

function scoreMatch(exerciseName: string, candidate: ExerciseDBItem): number {
  const nameLower = exerciseName.toLowerCase();
  const candidateLower = candidate.name.toLowerCase();

  // 1. Extract English name inside parens if any, e.g. "Curl de Bíceps (Barbell Curl)" -> "barbell curl"
  const parensMatch = nameLower.match(/\(([^)]+)\)/);
  const englishInParens = parensMatch ? parensMatch[1].trim() : '';

  if (englishInParens && englishInParens === candidateLower) return 1000;
  if (nameLower === candidateLower) return 1000;

  const targetName = englishInParens || nameLower;

  // 2. Extract keywords
  const rawKeywords = targetName
    .split(/[\s,()\/]+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

  const translatedKeywords: string[] = [];
  for (const kw of rawKeywords) {
    translatedKeywords.push(kw);
    if (ES_TO_EN_KEYWORDS[kw]) {
      translatedKeywords.push(ES_TO_EN_KEYWORDS[kw]);
    }
  }

  let matchedKeywords = 0;
  let score = 0;

  for (const kw of translatedKeywords) {
    if (candidateLower.includes(kw)) {
      score += 10;
      matchedKeywords++;
    }
  }

  // Must match at least ONE non-stopword keyword in name
  if (matchedKeywords === 0) {
    return 0;
  }

  // Equipment hint bonuses
  if ((nameLower.includes('barbell') || nameLower.includes('barra')) && candidate.equipments.includes('barbell')) score += 5;
  if ((nameLower.includes('dumbbell') || nameLower.includes('mancuerna')) && candidate.equipments.includes('dumbbell')) score += 5;
  if ((nameLower.includes('cable') || nameLower.includes('polea')) && candidate.equipments.includes('cable')) score += 5;
  if (nameLower.includes('machine') && (candidate.equipments.includes('leverage machine') || candidate.equipments.includes('smith machine'))) score += 5;
  if (nameLower.includes('kettlebell') && candidate.equipments.includes('kettlebell')) score += 5;

  return score;
}

/**
 * Finds the best matching GIF URL from ExerciseDB for a given exercise.
 * Caches results per exercise name to avoid repeated network calls.
 * Returns null if no relevant keyword match is found (score <= 0).
 */
export async function findGifForExercise(
  exerciseName: string,
  primaryMuscle: string
): Promise<string | null> {
  const cacheKey = exerciseName.toLowerCase();
  if (gifCache.has(cacheKey)) return gifCache.get(cacheKey)!;

  const all = await fetchBatch();
  if (!all.length) return null;

  const targetMuscles = MUSCLE_MAP[primaryMuscle] || [];

  // Filter candidates by target muscle group if known
  let candidates = targetMuscles.length
    ? all.filter(ex =>
        ex.targetMuscles.some(m => targetMuscles.includes(m)) ||
        ex.secondaryMuscles.some(m => targetMuscles.includes(m))
      )
    : all;

  if (!candidates.length) candidates = all;

  let best: ExerciseDBItem | null = null;
  let bestScore = 0; // MUST be > 0 (require a real keyword match!)

  for (const ex of candidates) {
    const s = scoreMatch(exerciseName, ex);
    if (s > bestScore) {
      bestScore = s;
      best = ex;
    }
  }

  const gifUrl = (best && bestScore > 0) ? best.gifUrl : null;
  if (gifUrl) gifCache.set(cacheKey, gifUrl);
  return gifUrl;
}

/** Pre-warm the cache (call on app start or component mount) */
export function prewarmGifCache(): void {
  fetchBatch().catch(() => {});
}
