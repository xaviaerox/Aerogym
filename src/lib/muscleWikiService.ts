// Service to communicate with the MuscleWiki API.
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

// Helper to build local media URLs
function mwVideo(category: string, slug: string, angles: string[] = ['front']): MuscleWikiVideo[] {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Map known exercise slugs to local asset IDs
  const slugToId: Record<string, string> = {
    'barbell-curl': '0001-2gPfomN',
    'hammer-curl': '0002-Hy9D21L',
    'burpee': '0006-qaZVsGk',
    'bench-press': '0007-4IKbhHV',
    'squat': '0009-PAgTVaK',
    'push-up': '0010-8K0w2yA',
    'pull-up': '0011-03lzqwk',
    'deadlift': '0012-UGhRD1A',
    'lunge': '0013-VX5YKR5',
    'plank': '0014-r7cT9YD',
    'crunch': '0015-vrhHa6D',
  };

  const id = slugToId[slug] || '0001-2gPfomN';

  return [{
    angle: 'front',
    gender: 'male' as const,
    og_image: `${cleanBase}images/${id}.jpg`,
    url: `${cleanBase}videos/${id}.gif`,
  }];
}

// ─── COMPREHENSIVE LOCAL EXERCISE DATABASE ─────────────────────────────────
// Loaded asynchronously from /public/data/exercises-local.json to keep the
// main JS bundle lean. Falls back to an empty array if the fetch fails.
// NOTE: LOCAL_EXERCISES is kept as a mutable reference for backwards compat.
export let LOCAL_EXERCISES: MuscleWikiExercise[] = [];

let _localExercisesLoaded = false;
let _localExercisesLoading: Promise<MuscleWikiExercise[]> | null = null;

async function loadLocalExercises(): Promise<MuscleWikiExercise[]> {
  if (_localExercisesLoaded) return LOCAL_EXERCISES;
  if (_localExercisesLoading) return _localExercisesLoading;

  _localExercisesLoading = (async () => {
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const res = await fetch(`${cleanBase}data/exercises-local.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: MuscleWikiExercise[] = await res.json();
      LOCAL_EXERCISES = data;
      _localExercisesLoaded = true;
      return data;
    } catch (err) {
      console.warn('[muscleWikiService] Could not load exercises-local.json:', err);
      _localExercisesLoaded = true; // avoid retrying every call
      return [];
    }
  })();

  return _localExercisesLoading;
}

// Eagerly start loading in the background (non-blocking)
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
    const pool = this._datasetCache && this._datasetCache.length > 0 ? this._datasetCache : LOCAL_EXERCISES;
    const ex = pool.find(e => String(e.id) === String(id) || String(e.id) === `mw-${cleanId}` || e.id === numericId);
    if (ex) {
      return {
        name: ex.name,
        muscleGroup: TRANSLATE_MUSCLE[ex.primary_muscles[0]] || ex.primary_muscles[0],
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
