// Service to communicate with the MuscleWiki API.
import { BASE_EXERCISES } from '../constants/exercises';
import { localExercisesData as localExercisesJson } from '../data/exercises-local';

// Priority order:
//   1. Supabase Edge Function proxy (bypasses CORS, works with any tier from server)
//   2. Direct API call (only works on TESTING+ tier)
//   3. Local exercise database (always available, 50+ exercises, real data)

export interface MuscleWikiVideo {
  angle: string;
  gender: 'male' | 'female';
  og_image: string;
  url: string;
}

export interface MuscleWikiExercise {
  id: string | number;
  name: string;
  primary_muscles: string[];
  secondary_muscles?: string[];
  category: string;
  difficulty: string | null;
  force: string | null;
  grips: string[];
  mechanic: string | null;
  steps: string[];
  videos: MuscleWikiVideo[];
  bodymap_male?: string | null;
  bodymap_female?: string | null;
}

// Offline Local Exercises Storage Keys
const STORAGE_KEY_OFFLINE_MODE = 'aerogym_musclewiki_offline_mode';

// Translations English -> Spanish for UI consistency
export const TRANSLATE_MUSCLE: Record<string, string> = {
  'Biceps': 'Bíceps',
  'Chest': 'Pecho',
  'Forearms': 'Antebrazos',
  'Lats': 'Espalda (Lats)',
  'Middle Back': 'Espalda Media',
  'Lower Back': 'Lumbares',
  'Neck': 'Cuello',
  'Quadriceps': 'Cuádriceps',
  'Hamstrings': 'Isquiotibiales',
  'Glutes': 'Glúteos',
  'Calves': 'Gemelos',
  'Triceps': 'Tríceps',
  'Shoulders': 'Hombros',
  'Abs': 'Abdominales',
  'Obliques': 'Oblicuos',
  'Traps': 'Trapecio',
};

export const TRANSLATE_CATEGORY: Record<string, string> = {
  'Barbell': 'Barra',
  'Dumbbell': 'Mancuernas',
  'Kettlebells': 'Pesa Rusa (Kettlebell)',
  'Cables': 'Poleas',
  'Band': 'Bandas Elásticas',
  'Plate': 'Disco',
  'Bodyweight': 'Peso Corporal',
  'Machine': 'Máquinas',
  'Stretch': 'Estiramientos',
  
  // Mapeos adicionales para el dataset multilingüe
  'assisted': 'Asistido',
  'band': 'Bandas Elásticas',
  'barbell': 'Barra',
  'bosu ball': 'Bosu',
  'cable': 'Polea',
  'dumbbell': 'Mancuernas',
  'elliptical machine': 'Elíptica',
  'ez barbell': 'Barra EZ',
  'hammer': 'Martillo',
  'kettlebell': 'Pesa Rusa (Kettlebell)',
  'leverage machine': 'Máquina de Palanca',
  'medicine ball': 'Balón Medicinal',
  'olympic barbell': 'Barra Olímpica',
  'resistance band': 'Banda de Resistencia',
  'roller': 'Rodillo de Espuma',
  'rope': 'Cuerda',
  'skierg machine': 'Máquina SkiErg',
  'sled machine': 'Trineo (Sled)',
  'smith machine': 'Multipower / Smith',
  'stability ball': 'Balón de Estabilidad',
  'stationary bike': 'Bicicleta Estática',
  'stepmill machine': 'Subir Escaleras',
  'tire': 'Neumático',
  'trap bar': 'Barra Hexagonal / Trap',
  'upper body ergometer': 'Ergómetro de Brazos',
  'weighted': 'Con Lastre / Peso',
  'wheel roller': 'Rueda Abdominal',
  'body weight': 'Peso Corporal',
};

// Map Spanish muscle group names in BASE_EXERCISES to MuscleWiki muscle keys
function mapSpanishMuscleToWikiKey(mg: string): string {
  switch (mg) {
    case 'Pecho': return 'Chest';
    case 'Espalda': return 'Lats';
    case 'Cuádriceps': return 'Quadriceps';
    case 'Isquios': return 'Hamstrings';
    case 'Glúteos': return 'Glutes';
    case 'Gemelos': return 'Calves';
    case 'Hombros': return 'Shoulders';
    case 'Bíceps': return 'Biceps';
    case 'Tríceps': return 'Triceps';
    case 'Antebrazos': return 'Forearms';
    case 'Abdominales': return 'Abs';
    case 'Cardio': return 'Cardio';
    default: return mg;
  }
}

// Map exercise equipment category dynamically
function mapCategoryFromExercise(id: string, type: string, name: string): string {
  const lowerId = id.toLowerCase();
  const lowerName = name.toLowerCase();

  if (lowerId.includes('cable') || lowerId.includes('pulldown') || (lowerId.includes('row') && lowerId.includes('seated')) || lowerId.includes('kickback') || lowerId.includes('pushdown') || lowerId.includes('woodchopper') || lowerName.includes('polea')) {
    return 'Cables';
  }
  if (lowerId.includes('pullup') || lowerId.includes('chinup') || lowerId.includes('dip') || lowerId.includes('pushup') || lowerId.includes('plank') || lowerId.includes('bodyweight') || lowerId.includes('burpee') || lowerName.includes('dominada') || lowerName.includes('flexion') || lowerName.includes('plancha')) {
    return 'Bodyweight';
  }
  if (lowerId.includes('machine') || lowerId.includes('press-45') || lowerId.includes('extension') || (lowerId.includes('curl') && lowerId.includes('leg')) || lowerId.includes('pec-dec') || lowerId.includes('multipower') || lowerId.includes('smith') || lowerId.includes('abductor') || lowerId.includes('treadmill') || lowerId.includes('cycling') || lowerId.includes('rowing-machine') || lowerId.includes('elliptical') || lowerId.includes('stairmaster') || lowerName.includes('máquina') || lowerName.includes('prensa')) {
    return 'Machine';
  }
  if (lowerId.includes('db-') || lowerId.includes('-db') || lowerId.includes('dumbbell') || lowerName.includes('mancuerna')) {
    return 'Dumbbell';
  }
  if (lowerId.includes('bb-') || lowerId.includes('-bb') || lowerId.includes('barbell') || lowerId.includes('squat') || lowerId.includes('deadlift') || lowerId.includes('bench') || lowerName.includes('barra')) {
    return 'Barbell';
  }
  return type === 'Compuesto' ? 'Barbell' : 'Dumbbell';
}

const SLUG_TO_MEDIA_ID: Record<string, string> = {
  // Biceps
  'bb-curls': '1001-y8bYM8w',
  'barbell-curl': '1001-y8bYM8w',
  'hammer-curls': '1051-pkSoCW9',
  'hammer-curl': '1051-pkSoCW9',
  'db-alt-curls': '1052-ZsiqXYa',
  'concentration-curls': '1052-ZsiqXYa',
  'cable-curls': '1053-1gFNTZV',
  'incline-db-curls': '1054-t8iSghb',

  // Triceps
  'tricep-extensions': '1007-euq4pwp',
  'tricep-overhead': '1055-EcaV7aL',
  'close-grip-bench': '1056-HJ63mSO',
  'dips': '1057-EMpUwRI',

  // Chest
  'bench-press': '0007-4IKbhHV',
  'incline-bb-press': '1059-SYJ4Bkt',
  'cable-flyes': '1060-h8LFzo9',
  'incline-db-flyes': '1061-iZop9xO',
  'pushup': '0010-8K0w2yA',

  // Back / Lats
  'lat-pulldown': '1003-w1NOByi',
  'pullups': '0011-03lzqwk',
  'pull-up': '0011-03lzqwk',
  'chinups': '0011-03lzqwk',
  'deadlift': '0012-UGhRD1A',
  'bb-rows': '1063-gfk9kD4',
  'barbell-row': '1063-gfk9kD4',
  'db-rows': '1064-qOgPVf6',
  'seated-row': '1065-wnEscH8',
  't-bar-row': '1066-WLvTAv5',

  // Shoulders
  'lateral-raises': '1006-HJ63mSO',
  'db-overhead-press': '1010-KUaoUV8',
  'face-pulls': '1012-u4bAmKp',
  'front-raises': '1067-za9Ni4z',
  'bb-overhead-press': '1068-Ln9iTbU',

  // Legs
  'goblet-squat': '1004-TUZLh71',
  'leg-press-45': '1009-kuMiR2T',
  'squats': '0009-PAgTVaK',
  'squat': '0009-PAgTVaK',
  'leg-extensions': '1070-62Nw60O',
  'lunges': '0013-VX5YKR5',
  'lunge': '0013-VX5YKR5',
  'bulgarian-split-squat': '1072-qDnGfDb',
  'romanian-deadlift': '1005-Kzg30R7',
  'leg-curls': '1073-xNrS20v',
  'hip-thrust': '1074-4LIG9xr',
  'cable-kickbacks': '1075-LsZkfU6',

  // Core
  'cable-crunch': '1076-Gxg9lDc',
  'hanging-leg-raises': '1077-7M66AVi',
  'plank': '0014-r7cT9YD',
  'burpee': '0006-qaZVsGk',
  'crunch': '0015-vrhHa6D',
};

// Helper to build local media URLs
function mwVideo(category: string, slug: string): MuscleWikiVideo[] {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const mediaId = SLUG_TO_MEDIA_ID[slug];
  if (!mediaId) {
    // Return empty array if not mapped so we don't display a mismatched image!
    return [];
  }

  return [{
    angle: 'front',
    gender: 'male' as const,
    og_image: `${cleanBase}images/${mediaId}.jpg`,
    url: `${cleanBase}videos/${mediaId}.gif`,
  }];
}

// ─── COMPREHENSIVE LOCAL EXERCISE DATABASE ─────────────────────────────────
// Synchronously populated with BASE_EXERCISES + exercises-local.json
// to guarantee 100% availability offline, in dev, in prod and in unit tests.
const buildInitialLocalExercises = (): MuscleWikiExercise[] => {
  const map = new Map<string, MuscleWikiExercise>();

  // Add BASE_EXERCISES baseline
  BASE_EXERCISES.forEach((ex) => {
    const wikiMuscle = mapSpanishMuscleToWikiKey(ex.muscleGroup);
    const wikiCategory = mapCategoryFromExercise(ex.id, ex.type, ex.name);

    map.set(String(ex.id), {
      id: ex.id,
      name: ex.name,
      primary_muscles: [wikiMuscle],
      secondary_muscles: [],
      category: wikiCategory,
      difficulty: 'Beginner',
      force: null,
      grips: [],
      mechanic: ex.type === 'Compuesto' ? 'compound' : 'isolation',
      steps: [`Ejecuta ${ex.name} con forma técnica adecuada y rango completo de movimiento.`],
      videos: mwVideo(wikiCategory, ex.id),
    });
  });

  // Enrich with detailed local JSON exercises if available
  if (Array.isArray(localExercisesJson)) {
    (localExercisesJson as MuscleWikiExercise[]).forEach((ex) => {
      map.set(String(ex.id), ex);
    });
  }

  return Array.from(map.values());
};

export let LOCAL_EXERCISES: MuscleWikiExercise[] = buildInitialLocalExercises();

let _localExercisesLoaded = false;
let _localExercisesLoading: Promise<MuscleWikiExercise[]> | null = null;

async function loadLocalExercises(): Promise<MuscleWikiExercise[]> {
  if (LOCAL_EXERCISES.length === 0) {
    LOCAL_EXERCISES = buildInitialLocalExercises();
  }
  if (_localExercisesLoaded) return LOCAL_EXERCISES;
  if (_localExercisesLoading) return _localExercisesLoading;

  _localExercisesLoading = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const candidatePaths = [
        `${cleanBase}data/exercises-local.json`,
        `data/exercises-local.json`,
        `./data/exercises-local.json`
      ];

      for (const p of candidatePaths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            const data: MuscleWikiExercise[] = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const map = new Map<string, MuscleWikiExercise>();
              LOCAL_EXERCISES.forEach(e => map.set(String(e.id), e));
              data.forEach(e => map.set(String(e.id), e));
              LOCAL_EXERCISES = Array.from(map.values());
              break;
            }
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('[muscleWikiService] Non-critical fetch warning for exercises-local.json:', err);
    } finally {
      _localExercisesLoaded = true;
    }
    return LOCAL_EXERCISES;
  })();

  return _localExercisesLoading;
}

if (typeof window !== 'undefined') {
  loadLocalExercises();
}


// Helper function to capitalize words
function capitalize(s: string): string {
  if (!s) return '';
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// Maps target muscle & body part to MuscleWiki key names
function mapTargetToMuscleWiki(target: string, bodyPart: string): string {
  const t = target.toLowerCase();
  const bp = bodyPart.toLowerCase();

  if (t.includes('biceps')) return 'Biceps';
  if (t.includes('triceps')) return 'Triceps';
  if (t.includes('forearm') || t.includes('brachioradialis') || t.includes('wrist')) return 'Forearms';
  if (t.includes('delt') || t.includes('shoulder')) return 'Shoulders';
  if (t.includes('pectoral') || t.includes('chest')) return 'Chest';
  if (t.includes('lat')) return 'Lats';
  if (t.includes('trapezius') || t.includes('trap')) return 'Traps';
  if (t.includes('glute')) return 'Glutes';
  if (t.includes('quad') || t.includes('rectus femoris') || t.includes('vastus')) return 'Quadriceps';
  if (t.includes('hamstring')) return 'Hamstrings';
  if (t.includes('calf') || t.includes('gastrocnemius') || t.includes('soleus')) return 'Calves';
  if (t.includes('abs') || t.includes('rectus abdominis')) return 'Abs';
  if (t.includes('oblique')) return 'Obliques';
  if (t.includes('cardio') || bp === 'cardio') return 'Cardio';
  if (t.includes('spine') || t.includes('erector spinae')) return 'Lower Back';
  if (t.includes('upper back')) return 'Middle Back';

  // Fallback based on body part
  if (bp === 'back') return 'Lats';
  if (bp === 'chest') return 'Chest';
  if (bp === 'shoulders') return 'Shoulders';
  if (bp === 'lower arms') return 'Forearms';
  if (bp === 'lower legs') return 'Calves';
  if (bp === 'neck') return 'Neck';
  if (bp === 'waist') return 'Abs';
  if (bp === 'upper legs') {
    if (t.includes('adductor') || t.includes('abductor')) return 'Glutes';
    return 'Quadriceps';
  }
  if (bp === 'upper arms') return 'Biceps';

  return capitalize(target);
}

// Maps equipment strings to MuscleWiki category keys
function mapEquipmentToMuscleWiki(equipment: string): string {
  const eq = equipment.toLowerCase();
  if (eq.includes('barbell')) {
    if (eq.includes('ez')) return 'ez barbell';
    return 'Barbell';
  }
  if (eq.includes('dumbbell')) return 'Dumbbell';
  if (eq.includes('kettlebell')) return 'Kettlebells';
  if (eq.includes('cable')) return 'Cables';
  if (eq.includes('band')) return 'Band';
  if (eq.includes('plate')) return 'Plate';
  if (eq.includes('body weight') || eq.includes('bodyweight')) return 'Bodyweight';
  if (eq.includes('machine') || eq.includes('roller') || eq.includes('sled')) return 'Machine';
  if (eq.includes('stretch')) return 'Stretch';
  
  return equipment; // Keep original if not matched directly
}

// ─── SERVICE CLASS ─────────────────────────────────────────────────────────
export class MuscleWikiService {
  private static _datasetCache: MuscleWikiExercise[] | null = null;

  static async loadDataset(): Promise<MuscleWikiExercise[]> {
    if (this._datasetCache && this._datasetCache.length > 0) return this._datasetCache;
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

      // Try to load the full ExerciseDB dataset first
      let res: Response | null = null;
      try { res = await fetch(`${cleanBase}data/exercises.json`); } catch (_) {}

      if (res?.ok) {
        const data = await res.json();
        this._datasetCache = data.map((item: any) => {
          const primaryMuscle = mapTargetToMuscleWiki(item.target, item.body_part);
          const category = mapEquipmentToMuscleWiki(item.equipment);
          const steps = item.instruction_steps?.es?.length > 0
            ? item.instruction_steps.es
            : (item.instruction_steps?.en ?? []);
          const imagePath = item.image ? item.image.replace(/^\//, '') : '';
          const gifPath = item.gif_url ? item.gif_url.replace(/^\//, '') : '';
          return {
            id: `mw-${item.id}`,
            name: capitalize(item.name),
            primary_muscles: [primaryMuscle],
            secondary_muscles: item.secondary_muscles ? item.secondary_muscles.map((m: string) => capitalize(m)) : [],
            category,
            difficulty: 'Beginner',
            force: null,
            grips: [],
            mechanic: null,
            steps,
            videos: [{
              angle: 'front',
              gender: 'male' as const,
              og_image: imagePath ? `${cleanBase}${imagePath}` : '',
              url: gifPath ? `${cleanBase}${gifPath}` : '',
            }],
          };
        });
        return this._datasetCache || [];
      }

      // Fallback: load our curated local exercises JSON (moved out of JS bundle)
      const local = await loadLocalExercises();
      this._datasetCache = local;
      return local;
    } catch (e) {
      console.error('[MuscleWikiService] loadDataset error, using LOCAL_EXERCISES:', e);
      // Last resort: return whatever was loaded by the background loader
      return LOCAL_EXERCISES;
    }
  }

  static isOfflineModeActive(): boolean {
    return true; // 100% local database
  }

  /** @deprecated Use isOfflineModeActive() */
  static isMockModeActive(): boolean {
    return true;
  }

  static setOfflineMode(_active: boolean): void {
    // Mode is locked to offline local database
  }

  /** @deprecated Use setOfflineMode() */
  static setMockMode(active: boolean): void {
    this.setOfflineMode(active);
  }

  /** Fast local search from memory dataset */
  static async searchExercises(
    query: string,
    filters: { muscle?: string; category?: string; difficulty?: string } = {}
  ): Promise<MuscleWikiExercise[]> {
    await this.loadDataset();
    return this._searchLocal(query, filters);
  }

  /** Get single exercise details from local dataset */
  static async getExerciseDetails(id: string | number): Promise<MuscleWikiExercise | null> {
    await this.loadDataset();
    const cleanId = String(id).replace('mw-', '');
    const numericId = parseInt(cleanId);
    
    const pool = this._datasetCache && this._datasetCache.length > 0 ? this._datasetCache : LOCAL_EXERCISES;
    const localEx = pool.find(e => String(e.id) === String(id) || String(e.id) === `mw-${cleanId}` || e.id === numericId);
    return localEx || null;
  }

  /** Synchronous cached lookup for list renderers */
  static getCachedExerciseInfo(id: string | number): { name: string; muscleGroup: string } {
    const cleanId = String(id).replace('mw-', '');
    const numericId = parseInt(cleanId);
    const pool = (this._datasetCache && this._datasetCache.length > 0) ? this._datasetCache : LOCAL_EXERCISES;
    const ex = pool.find(e => String(e.id) === String(id) || String(e.id) === `mw-${cleanId}` || e.id === numericId || String(e.id) === cleanId);
    if (ex) {
      return {
        name: ex.name,
        muscleGroup: TRANSLATE_MUSCLE[ex.primary_muscles[0]] || ex.primary_muscles[0],
      };
    }
    const baseEx = BASE_EXERCISES.find(e => e.id === cleanId || e.id === String(id));
    if (baseEx) {
      return {
        name: baseEx.name,
        muscleGroup: baseEx.muscleGroup,
      };
    }
    return { name: `Ejercicio #${cleanId}`, muscleGroup: 'Local' };
  }

  /** Local filtering with full-text support */
  private static _searchLocal(
    query: string,
    filters: { muscle?: string; category?: string; difficulty?: string }
  ): MuscleWikiExercise[] {
    const q = query.toLowerCase().trim();
    const pool = this._datasetCache && this._datasetCache.length > 0 ? this._datasetCache : LOCAL_EXERCISES;

    return pool.filter(ex => {
      // Hide stretches by default unless category filter is active
      if (ex.category === 'Stretch' && !filters.category) return false;

      const matchesQuery =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.primary_muscles.some(m => m.toLowerCase().includes(q)) ||
        ex.steps.some(s => s.toLowerCase().includes(q));

      const matchesMuscle =
        !filters.muscle ||
        ex.primary_muscles.includes(filters.muscle) ||
        (ex.secondary_muscles || []).includes(filters.muscle);

      const matchesCategory = !filters.category || ex.category.toLowerCase() === filters.category.toLowerCase();
      const matchesDifficulty = !filters.difficulty || ex.difficulty === filters.difficulty;

      return matchesQuery && matchesMuscle && matchesCategory && matchesDifficulty;
    });
  }
}

// Keep MOCK_MUSCLEWIKI_EXERCISES as alias for backwards compatibility
export const MOCK_MUSCLEWIKI_EXERCISES = LOCAL_EXERCISES;
