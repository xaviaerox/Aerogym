// Service to communicate with the MuscleWiki API.
import { BASE_EXERCISES } from '../constants/exercises';

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
  // Pecho
  'bench-press': '0025-EIeI8Vf',
  'incline-bb-press': '0047-3TZduzM',
  'incline-db-press': '0314-ns0SIbU',
  'chest-machine-press': '0989-c16nYGA',
  'pec-dec': '1494-bWlZvXh',
  'dips': '3287-LkoAWAE',
  'cable-flyes': '1262-w4dLzSx',
  'decline-bb-press': '0033-GrO65fd',
  'smith-incline-press': '0757-5v7KYld',
  'incline-db-flyes': '0319-ESOd5Pl',
  'pushup': '0975-ufaxB52',

  // Espalda
  'lat-pulldown': '2330-LEprlgG',
  'hammer-row': '0990-DKBwJrL',
  'chest-supported-row': '0010-8K0w2yA',
  'seated-row': '0990-DKBwJrL',
  'db-rows': '0293-BJ0Hz5L',
  'pullups': '0015-vrhHa6D',
  'pull-up': '0015-vrhHa6D',
  'chinups': '1431-7OeHptV',
  'deadlift': '1009-kuMiR2T',
  'cable-pullover': '1316-cA9FuWG',
  'db-pullover': '0288-vi8EhoE',
  'hyperextensions': '0489-zhMwOwE',
  't-bar-row': '1349-BgljGjd',
  'close-grip-pulldown': '0007-4IKbhHV',
  'unilateral-cable-row': '0159-kesXOpB',
  'bb-rows': '0027-eZyBC3j',
  'barbell-row': '0027-eZyBC3j',

  // Piernas / Cuádriceps
  'squats': '0024-Y7YcmIJ',
  'squat': '0024-Y7YcmIJ',
  'leg-press-45': '2287-V07qpXy',
  'leg-press-light': '2287-V07qpXy',
  'leg-extensions': '0585-my33uHU',
  'lunges': '1410-py1HSzx',
  'lunge': '1410-py1HSzx',
  'bulgarian-split-squat': '0987-arsYEd3',
  'hack-squat': '0046-5VCj6iH',
  'goblet-squat': '1760-yn8yg1r',
  'front-squat': '0024-Y7YcmIJ',
  'reverse-lunges': '1410-py1HSzx',
  'sissy-squat': '1489-xdYPUtE',
  'single-leg-extension': '0585-my33uHU',

  // Isquiotibiales
  'romanian-deadlift': '0085-wQ2c4XD',
  'leg-curls': '3235-zHEpuuc',
  'seated-leg-curls': '0599-Zg3XY7P',
  'stiff-leg-deadlift': '0085-wQ2c4XD',
  'standing-leg-curl': '3235-zHEpuuc',
  'db-romanian-deadlift': '1459-rR0LJzx',

  // Glúteos
  'hip-thrust': '3236-Pjbc0Kt',
  'cable-kickbacks': '0860-HEJ6DIX',
  'abductor-machine': '1427-mQ1tBXn',
  'glute-bridge': '1409-qKBpF7I',
  'lateral-lunges': '1410-py1HSzx',
  'step-ups': '1008-d5bTEPV',
  'cable-abduction': '0597-CHpahtl',

  // Gemelos
  'calf-raises-standing': '0999-9JprnPh',
  'calf-raises-seated': '0088-ktsFQAZ',
  'press-calf-raises': '0999-9JprnPh',

  // Hombros
  'db-overhead-press': '0361-84RyJf8',
  'bb-overhead-press': '0091-kTbSH9h',
  'arnold-press': '2137-Xy4jlWA',
  'lateral-raises': '0977-sTg7iys',
  'lateral-raise': '0977-sTg7iys',
  'cable-lateral-raises': '0178-goJ6ezq',
  'reverse-flys': '0993-sTfvVsG',
  'cable-reverse-flys': '0225-P5p0j8B',
  'face-pulls': '0993-sTfvVsG',
  'front-raises': '0978-TFA88iB',
  'upright-row': '0120-UDlhcO8',
  'smith-overhead-press': '0765-xUwnBMT',
  'shrugs': '1018-trmte8s',

  // Bíceps
  'bb-curls': '0023-Yza7XrQ',
  'barbell-curl': '0023-Yza7XrQ',
  'db-alt-curls': '0285-BU15nH4',
  'hammer-curls': '0165-HPlPoQA',
  'hammer-curl': '0165-HPlPoQA',
  'preacher-curl': '0059-SYJ4Bkt',
  'db-preacher-curl': '1646-fy7Tgy4',
  'cable-curls': '3235-zHEpuuc',
  'concentration-curls': '0976-kmVVAfu',
  'incline-db-curls': '0072-WLvTAv5',
  'cable-hammer-curls': '0165-HPlPoQA',
  'zottman-curl': '0439-kXaIn5A',
  'high-cable-curls': '3235-zHEpuuc',
  'french-press': '0018-7HcfMBP',

  // Antebrazos
  'wrist-curls-prono': '0994-Ezpnw9d',
  'wrist-curls-supino': '0994-Ezpnw9d',
  'reverse-bb-curl': '0080-xNrS20v',
  'farmers-walk': '2133-qPEzJjA',

  // Core
  'plank': '3544-5VXmnV5',
  'hanging-leg-raises': '0012-UGhRD1A',
  'cable-crunch': '0972-tZkGYZ9',
  'russian-twist': '0014-r7cT9YD',
  'reverse-crunch': '0873-RqOtqD7',
  'side-plank': '3544-5VXmnV5',
  'ab-wheel': '0971-zhF9lW4',
  'machine-crunch': '0972-tZkGYZ9',
  'incline-leg-raises': '0012-UGhRD1A',
  'cable-woodchopper': '0972-tZkGYZ9',
  'burpee': '1160-dK9394r',
  'crunch': '0972-tZkGYZ9',

  // Cardio
  'treadmill': '3666-rjiM4L3',
  'cycling': '0972-tZkGYZ9',
  'rowing-machine': '0990-DKBwJrL',
  'elliptical': '2141-rjtuP6X',
  'jump-rope': '0128-RJa4tCo',
  'stairmaster': '1490-6HmFgmx',
  'swimming': '3433-SP3hUez',
  'brisk-walk': '2133-qPEzJjA',
  'hiit-run': '0972-tZkGYZ9',
};

import { BASE_EXERCISES_DETAILS } from '../data/baseExercisesDetails';

// Helper to build local media URLs
function mwVideo(category: string, slug: string): MuscleWikiVideo[] {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  const detail = BASE_EXERCISES_DETAILS[slug];
  const mediaId = SLUG_TO_MEDIA_ID[slug] || detail?.mediaId;
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

  // Add BASE_EXERCISES baseline enriched with detailed Spanish instructions and real media
  BASE_EXERCISES.forEach((ex) => {
    const wikiMuscle = mapSpanishMuscleToWikiKey(ex.muscleGroup);
    const wikiCategory = mapCategoryFromExercise(ex.id, ex.type, ex.name);
    const detail = BASE_EXERCISES_DETAILS[ex.id];

    const steps = (detail && detail.steps && detail.steps.length > 0)
      ? detail.steps
      : [
          `Adopta una posición erguida y estable sujetando el equipamiento de ${ex.name} con alineación anatómica correcta.`,
          `Realiza la fase excéntrica (descenso/estiramiento) de forma suave y controlada durante 2-3 segundos.`,
          `Pausa 1 segundo en el punto de máxima contracción muscular sintiendo la tensión focalizada.`,
          `Ejecuta la fase concéntrica aplicando fuerza de forma fluida mientras exhalas el aire de los pulmones.`,
          `Mantén el torso estable y evita compensar con inercias durante todas las repeticiones.`
        ];

    const exerciseItem: MuscleWikiExercise = {
      id: ex.id,
      name: ex.name,
      primary_muscles: [wikiMuscle],
      secondary_muscles: [],
      category: wikiCategory,
      difficulty: 'Beginner',
      force: detail?.force || (ex.type === 'Compuesto' ? 'Push' : null),
      grips: [],
      mechanic: ex.type === 'Compuesto' ? 'compound' : 'isolation',
      steps,
      videos: mwVideo(wikiCategory, ex.id),
    };

    map.set(String(ex.id), exerciseItem);
    map.set(ex.name.toLowerCase().trim(), exerciseItem);
  });

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
  
  return equipment;
}

// ─── SERVICE CLASS ─────────────────────────────────────────────────────────
export class MuscleWikiService {
  private static _datasetCache: MuscleWikiExercise[] | null = null;

  static async loadDataset(): Promise<MuscleWikiExercise[]> {
    if (this._datasetCache && this._datasetCache.length > 0) return this._datasetCache;

    const map = new Map<string, MuscleWikiExercise>();

    // 1. ALWAYS populate map first with local Spanish exercises to guarantee they are never lost or overridden!
    const baseLocal = await loadLocalExercises();
    baseLocal.forEach(e => {
      map.set(String(e.id), e);
      map.set(e.name.toLowerCase().trim(), e);
    });

    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

      // 2. Try to load the full ExerciseDB dataset
      let res: Response | null = null;
      try { res = await fetch(`${cleanBase}data/exercises.json`); } catch (_) {}

      if (res?.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            const itemId = `mw-${item.id}`;
            const cleanName = item.name ? item.name.toLowerCase().trim() : '';

            // Do not overwrite our rich Spanish local exercises
            if (map.has(itemId) || (cleanName && map.has(cleanName))) return;

            const primaryMuscle = mapTargetToMuscleWiki(item.target, item.body_part);
            const category = mapEquipmentToMuscleWiki(item.equipment);
            const steps = (item.instruction_steps?.es && item.instruction_steps.es.length > 0)
              ? item.instruction_steps.es
              : (item.instructions?.es
                ? [item.instructions.es]
                : (item.instruction_steps?.en && item.instruction_steps.en.length > 0
                  ? item.instruction_steps.en
                  : [`Ejecuta ${capitalize(item.name)} con técnica adecuada y rango de movimiento completo.`]));

            const imagePath = item.image ? item.image.replace(/^\//, '') : '';
            const gifPath = item.gif_url ? item.gif_url.replace(/^\//, '') : '';

            // Only attach videos array if image/gif is a valid path
            const hasValidImage = imagePath && (imagePath.startsWith('images/') || imagePath.startsWith('videos/'));
            const videos: MuscleWikiVideo[] = hasValidImage ? [{
              angle: 'front',
              gender: 'male' as const,
              og_image: `${cleanBase}${imagePath}`,
              url: gifPath ? `${cleanBase}${gifPath}` : `${cleanBase}${imagePath}`,
            }] : [];

            const parsedEx: MuscleWikiExercise = {
              id: itemId,
              name: capitalize(item.name),
              primary_muscles: [primaryMuscle],
              secondary_muscles: item.secondary_muscles ? item.secondary_muscles.map((m: string) => capitalize(m)) : [],
              category,
              difficulty: 'Beginner',
              force: null,
              grips: [],
              mechanic: null,
              steps,
              videos,
            };

            map.set(itemId, parsedEx);
          });
        }
      }
    } catch (e) {
      console.warn('[MuscleWikiService] loadDataset fetch warning:', e);
    }

    this._datasetCache = Array.from(map.values());
    return this._datasetCache;
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

  /** Match category filter flexibly against category synonyms */
  private static _matchCategoryFilter(exCat: string, filterCat: string): boolean {
    const c = exCat.toLowerCase();
    const f = filterCat.toLowerCase();

    if (c === f) return true;

    if (f === 'barbell' || f === 'barra') {
      return c.includes('barbell') || c.includes('barra') || c === 'ez barbell' || c === 'olympic barbell' || c === 'trap bar';
    }
    if (f === 'dumbbell' || f === 'mancuernas') {
      return c.includes('dumbbell') || c.includes('mancuerna');
    }
    if (f === 'cables' || f === 'poleas') {
      return c.includes('cable') || c.includes('polea') || c.includes('rope');
    }
    if (f === 'bodyweight' || f === 'peso corporal') {
      return c.includes('bodyweight') || c.includes('body weight') || c.includes('assisted') || c.includes('weighted') || c.includes('corporal');
    }
    if (f === 'machine' || f === 'máquinas' || f === 'maquinas') {
      return c.includes('machine') || c.includes('máquina') || c.includes('prensa') || c.includes('roller') || c.includes('sled') || c.includes('smith');
    }
    if (f === 'stretch' || f === 'estiramientos') {
      return c.includes('stretch') || c.includes('estiramiento');
    }
    if (f === 'kettlebells' || f === 'pesa rusa (kettlebell)') {
      return c.includes('kettlebell') || c.includes('pesa rusa');
    }

    return c.includes(f) || f.includes(c);
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
        ex.primary_muscles.some(m => m.toLowerCase().includes(q) || (TRANSLATE_MUSCLE[m] || '').toLowerCase().includes(q)) ||
        ex.steps.some(s => s.toLowerCase().includes(q));

      const matchesMuscle =
        !filters.muscle ||
        ex.primary_muscles.includes(filters.muscle) ||
        ex.primary_muscles.some(m => m.toLowerCase() === filters.muscle!.toLowerCase() || (TRANSLATE_MUSCLE[m] || '').toLowerCase() === filters.muscle!.toLowerCase()) ||
        (ex.secondary_muscles || []).some(m => m.toLowerCase() === filters.muscle!.toLowerCase() || (TRANSLATE_MUSCLE[m] || '').toLowerCase() === filters.muscle!.toLowerCase());

      const matchesCategory = !filters.category || this._matchCategoryFilter(ex.category, filters.category);
      const matchesDifficulty = !filters.difficulty || ex.difficulty === filters.difficulty;

      return matchesQuery && matchesMuscle && matchesCategory && matchesDifficulty;
    });
  }
}

// Keep MOCK_MUSCLEWIKI_EXERCISES as alias for backwards compatibility
export const MOCK_MUSCLEWIKI_EXERCISES = LOCAL_EXERCISES;
