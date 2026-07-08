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

// Keywords to skip when doing name-based matching (stop words)
const STOP_WORDS = new Set(['with', 'the', 'and', 'for', 'from', 'using', 'on', 'in', 'at', 'of', 'a']);

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

  // Exact match → perfect score
  if (nameLower === candidateLower) return 1000;

  let score = 0;

  // Keyword overlap
  const keywords = nameLower
    .split(/[\s,()\/]+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  for (const kw of keywords) {
    if (candidateLower.includes(kw)) score += 10;
  }

  // Equipment hint from exercise name
  if (nameLower.includes('barbell') && candidate.equipments.includes('barbell')) score += 5;
  if (nameLower.includes('dumbbell') && candidate.equipments.includes('dumbbell')) score += 5;
  if (nameLower.includes('cable') && candidate.equipments.includes('cable')) score += 5;
  if (nameLower.includes('machine') && (candidate.equipments.includes('leverage machine') || candidate.equipments.includes('smith machine'))) score += 5;
  if ((nameLower.includes('bodyweight') || nameLower.includes('flexion') || nameLower.includes('push up') || nameLower.includes('pull up')) && candidate.equipments.includes('body weight')) score += 5;
  if (nameLower.includes('kettlebell') && candidate.equipments.includes('kettlebell')) score += 5;

  return score;
}

/**
 * Finds the best matching GIF URL from ExerciseDB for a given exercise.
 * Caches results per exercise name to avoid repeated network calls.
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

  // Filter candidates: must target the right muscle group
  let candidates = targetMuscles.length
    ? all.filter(ex =>
        ex.targetMuscles.some(m => targetMuscles.includes(m)) ||
        ex.secondaryMuscles.some(m => targetMuscles.includes(m))
      )
    : all;

  if (!candidates.length) candidates = all; // fallback: no muscle filter

  // Score each candidate by name similarity
  let best: ExerciseDBItem | null = null;
  let bestScore = -1;

  for (const ex of candidates) {
    const s = scoreMatch(exerciseName, ex);
    if (s > bestScore) {
      bestScore = s;
      best = ex;
    }
  }

  const gifUrl = best?.gifUrl ?? null;
  if (gifUrl) gifCache.set(cacheKey, gifUrl);
  return gifUrl;
}

/** Pre-warm the cache (call on app start or component mount) */
export function prewarmGifCache(): void {
  fetchBatch().catch(() => {});
}
