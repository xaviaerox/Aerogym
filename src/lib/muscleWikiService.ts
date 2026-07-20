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
// 50+ exercises covering all major muscle groups with detailed instructions.
// Based on real MuscleWiki exercise data and CDN URL patterns.
export const LOCAL_EXERCISES: MuscleWikiExercise[] = [

  // ─── BÍCEPS ───────────────────────────────────────────────────────────────
  {
    id: 1001,
    name: 'Curl de Bíceps con Barra (Barbell Curl)',
    primary_muscles: ['Biceps'],
    secondary_muscles: ['Forearms'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Underhand'],
    mechanic: 'Isolation',
    steps: [
      'Párate derecho sosteniendo una barra con agarre supinado (palmas hacia arriba) al ancho de los hombros.',
      'Mantén los codos pegados al torso durante todo el movimiento.',
      'Contrae los bíceps para flexionar la barra hacia los hombros de forma controlada.',
      'Sube hasta que los bíceps estén completamente contraídos y la barra a la altura de los hombros.',
      'Mantén la contracción 1 segundo y baja lentamente hasta la posición inicial.',
    ],
    videos: mwVideo('Barbell', 'barbell-curl'),
    bodymap_male: 'https://api.musclewiki.com/stream/images/bodymaps/1?gender=male',
  },
  {
    id: 1051,
    name: 'Curl Martillo con Mancuernas (Hammer Curl)',
    primary_muscles: ['Biceps'],
    secondary_muscles: ['Forearms'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Párate con los pies al ancho de los hombros, sosteniendo una mancuerna en cada mano con agarre neutro (palmas enfrentadas).',
      'Mantén los codos junto al torso y los pulgares apuntando hacia arriba.',
      'Flexiona los codos para subir las mancuernas hacia los hombros sin rotar las muñecas.',
      'Aprieta los bíceps y el braquiorradial en la parte superior.',
      'Baja lentamente hasta la posición inicial con control total.',
    ],
    videos: mwVideo('Dumbbells', 'hammer-curl'),
  },
  {
    id: 1052,
    name: 'Curl Concentrado con Mancuerna (Concentration Curl)',
    primary_muscles: ['Biceps'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Underhand'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate en un banco, inclínate ligeramente hacia adelante y apoya el codo derecho en la cara interna del muslo derecho.',
      'Sostén una mancuerna con agarre supinado dejando el brazo extendido.',
      'Contrae el bíceps para levantar la mancuerna hacia el hombro, rotando ligeramente la muñeca hacia afuera al llegar arriba.',
      'Mantén la contracción máxima 1-2 segundos antes de bajar.',
      'Completa las repeticiones en un lado y cambia al otro brazo.',
    ],
    videos: mwVideo('Dumbbells', 'concentration-curl', ['side']),
  },
  {
    id: 1053,
    name: 'Curl de Bíceps en Polea (Cable Curl)',
    primary_muscles: ['Biceps'],
    secondary_muscles: ['Forearms'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Underhand'],
    mechanic: 'Isolation',
    steps: [
      'Ajusta la polea a la posición más baja y conecta la barra recta o EZ.',
      'Sujeta la barra con agarre supinado al ancho de los hombros y da un pequeño paso atrás.',
      'Mantén los codos fijos a los costados y curva la barra hacia los hombros.',
      'La polea mantiene tensión constante en los bíceps durante todo el recorrido.',
      'Baja de forma controlada evitando que el peso caiga libremente.',
    ],
    videos: mwVideo('Cables', 'cable-curl'),
  },
  {
    id: 1054,
    name: 'Curl Inclinado con Mancuernas (Incline Dumbbell Curl)',
    primary_muscles: ['Biceps'],
    category: 'Dumbbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Underhand'],
    mechanic: 'Isolation',
    steps: [
      'Recuéstate en un banco inclinado a 45-60° con una mancuerna en cada mano colgando libremente.',
      'Partiendo de esta posición estirada (máximo estiramiento del bíceps), curva las mancuernas hacia los hombros.',
      'Gira ligeramente las muñecas hacia afuera al subir para mayor contracción.',
      'No lleves los codos hacia adelante: deben permanecer detrás del torso.',
      'Baja completamente para maximizar el estiramiento en cada repetición.',
    ],
    videos: mwVideo('Dumbbells', 'incline-dumbbell-curl', ['side']),
  },

  // ─── TRÍCEPS ──────────────────────────────────────────────────────────────
  {
    id: 1007,
    name: 'Extensión de Tríceps en Polea (Triceps Pushdown)',
    primary_muscles: ['Triceps'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Isolation',
    steps: [
      'Sujeta la barra recta o en V conectada a la polea alta con agarre prono al ancho de los hombros.',
      'Párate cerca de la polea con el torso ligeramente inclinado y los codos pegados al torso.',
      'Extiende los brazos completamente hacia abajo apretando los tríceps al final.',
      'Evita que los codos se muevan durante el movimiento: son el eje fijo.',
      'Sube lentamente la barra hasta la posición inicial sintiendo el estiramiento.',
    ],
    videos: mwVideo('Cables', 'tricep-pushdown'),
  },
  {
    id: 1055,
    name: 'Extensión de Tríceps sobre la Cabeza (Overhead Tricep Extension)',
    primary_muscles: ['Triceps'],
    category: 'Dumbbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate o párate sosteniendo una mancuerna con ambas manos por encima de la cabeza (agarre en copa).',
      'Mantén los codos apuntando al techo y cerca de la cabeza.',
      'Dobla los codos para bajar la mancuerna detrás de la cabeza hasta sentir el estiramiento en los tríceps.',
      'Extiende los codos para subir la mancuerna de vuelta a la posición inicial.',
      'Mantén el core activo para no sobrecargar la zona lumbar.',
    ],
    videos: mwVideo('Dumbbells', 'overhead-tricep-extension', ['side']),
  },
  {
    id: 1056,
    name: 'Press de Codo Cerrado con Barra (Close-Grip Bench Press)',
    primary_muscles: ['Triceps'],
    secondary_muscles: ['Chest', 'Shoulders'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Acuéstate en un banco plano y sujeta la barra con un agarre más estrecho que el hombro (20-30 cm entre las manos).',
      'Baja la barra hacia el pecho inferior manteniendo los codos cerca del torso (no abiertos).',
      'Toca el pecho ligeramente y empuja la barra verticalmente hacia arriba.',
      'Aprieta los tríceps al extender los brazos por completo en la parte superior.',
      'Repite controlando el descenso para maximizar el trabajo de los tríceps.',
    ],
    videos: mwVideo('Barbell', 'close-grip-bench-press'),
  },
  {
    id: 1057,
    name: 'Fondos en Paralelas (Tricep Dips)',
    primary_muscles: ['Triceps'],
    secondary_muscles: ['Chest', 'Shoulders'],
    category: 'Bodyweight',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Sujeta las barras paralelas y eleva el cuerpo hasta que los brazos estén totalmente extendidos.',
      'Para enfatizar los tríceps, mantén el torso erguido (sin inclinarse hacia adelante) y los codos cerca del cuerpo.',
      'Baja lentamente doblando los codos hasta que los brazos queden paralelos al suelo (90°).',
      'Empuja hacia arriba para volver a la posición inicial apretando los tríceps.',
      'Evita balancear las piernas durante el movimiento.',
    ],
    videos: mwVideo('Bodyweight', 'tricep-dips', ['side']),
  },
  {
    id: 1058,
    name: 'Extensión de Tríceps con Cuerda en Polea',
    primary_muscles: ['Triceps'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Conecta la cuerda a la polea alta y sujeta cada extremo con agarre neutro.',
      'Coloca los pulgares mirando hacia arriba y los codos pegados al torso.',
      'Extiende los brazos hacia abajo separando ligeramente las cuerdas al llegar al fondo.',
      'La separación de las cuerdas aumenta la contracción final de los tríceps.',
      'Sube lentamente manteniendo los codos fijos como punto de apoyo.',
    ],
    videos: mwVideo('Cables', 'tricep-rope-pushdown'),
  },

  // ─── PECHO ────────────────────────────────────────────────────────────────
  {
    id: 1002,
    name: 'Press de Banca con Mancuernas (Dumbbell Bench Press)',
    primary_muscles: ['Chest'],
    secondary_muscles: ['Triceps', 'Shoulders'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Acuéstate en un banco plano con una mancuerna en cada mano a los costados del pecho.',
      'Mantén los pies en el suelo, la espalda contra el banco y los hombros retraídos.',
      'Empuja las mancuernas hacia arriba extendiendo los brazos sin que choquen en la parte superior.',
      'Baja controladamente hasta sentir un buen estiramiento en el pecho.',
      'Mantén los codos a 45-60° respecto al torso para proteger los hombros.',
    ],
    videos: mwVideo('Dumbbells', 'dumbbell-chest-press'),
    bodymap_male: 'https://api.musclewiki.com/stream/images/bodymaps/2?gender=male',
  },
  {
    id: 1008,
    name: 'Flexiones de Pecho (Push Up)',
    primary_muscles: ['Chest'],
    secondary_muscles: ['Triceps', 'Shoulders'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Posición de plancha con manos alineadas debajo de los hombros y cuerpo en línea recta.',
      'Contraer abdomen y glúteos para evitar que la cadera suba o baje.',
      'Dobla los codos hacia atrás en ~45° al cuerpo para bajar el pecho hacia el suelo.',
      'Baja hasta que el pecho casi toque el suelo.',
      'Empuja con fuerza para volver a la posición inicial apretando el pecho.',
    ],
    videos: mwVideo('Bodyweight', 'pushup'),
  },
  {
    id: 1059,
    name: 'Press de Banca Inclinado con Barra (Incline Barbell Bench Press)',
    primary_muscles: ['Chest'],
    secondary_muscles: ['Triceps', 'Shoulders'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Recuéstate en un banco inclinado a 30-45° con la barra sobre el pecho superior.',
      'Sujeta la barra con agarre ligeramente más ancho que los hombros.',
      'Baja la barra de forma controlada hacia la parte superior del pecho.',
      'Empuja hacia arriba y ligeramente hacia atrás siguiendo el arco natural del movimiento.',
      'El pecho superior (clavicular) es el músculo más activado en esta variante.',
    ],
    videos: mwVideo('Barbell', 'incline-barbell-bench-press'),
  },
  {
    id: 1060,
    name: 'Cruce de Poleas (Cable Fly)',
    primary_muscles: ['Chest'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Ajusta las poleas a la altura del pecho o por encima y sujeta los mangos con agarre neutro.',
      'Da un paso al frente para tensar los cables y posiciónate en el centro.',
      'Con los codos ligeramente doblados, une las manos frente al pecho dibujando un arco amplio.',
      'Aprieta el pecho al unir las manos y mantén 1 segundo la contracción máxima.',
      'Vuelve lentamente a la posición inicial sintiendo el estiramiento en el pecho.',
    ],
    videos: mwVideo('Cables', 'cable-fly'),
  },
  {
    id: 1061,
    name: 'Aperturas con Mancuernas (Dumbbell Fly)',
    primary_muscles: ['Chest'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Acuéstate en un banco plano con una mancuerna en cada mano y los brazos extendidos sobre el pecho.',
      'Con los codos ligeramente doblados, baja los brazos hacia los lados en un arco amplio.',
      'Siente el estiramiento completo del pecho en la posición más baja.',
      'Contrae el pecho para unir las mancuernas de vuelta sobre el torso.',
      'Mantén los codos en el mismo ángulo durante todo el movimiento.',
    ],
    videos: mwVideo('Dumbbells', 'dumbbell-fly'),
  },

  // ─── ESPALDA ──────────────────────────────────────────────────────────────
  {
    id: 1003,
    name: 'Jalón Dorsal en Polea (Cable Lat Pulldown)',
    primary_muscles: ['Lats'],
    secondary_muscles: ['Biceps', 'Middle Back'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Siéntate en la máquina ajustando la almohadilla de rodillas para que queden firmes.',
      'Sujeta la barra con agarre prono un poco más ancho que los hombros.',
      'Saca pecho e inclina el torso ligeramente hacia atrás.',
      'Tira de la barra hacia la parte superior del pecho llevando los codos hacia abajo y atrás.',
      'Regresa la barra lentamente a la posición inicial permitiendo que los dorsales se estiren.',
    ],
    videos: mwVideo('Cables', 'lat-pulldown'),
  },
  {
    id: 1062,
    name: 'Dominadas (Pull Up)',
    primary_muscles: ['Lats'],
    secondary_muscles: ['Biceps', 'Middle Back'],
    category: 'Bodyweight',
    difficulty: 'Advanced',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Cuélgate de una barra con agarre prono ligeramente más ancho que los hombros.',
      'Activa los dorsales deprimiendo las escápulas antes de empezar a tirar.',
      'Tira del cuerpo hacia arriba hasta que la barbilla supere la barra.',
      'Enfócate en llevar los codos hacia abajo y atrás, no en doblar los brazos.',
      'Baja lentamente hasta la extensión completa para maximizar el estiramiento.',
    ],
    videos: mwVideo('Bodyweight', 'pull-up'),
  },
  {
    id: 1063,
    name: 'Remo con Barra (Barbell Row)',
    primary_muscles: ['Middle Back'],
    secondary_muscles: ['Lats', 'Biceps', 'Traps'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Con la barra cargada en el suelo, ponte de pie con los pies al ancho de los hombros.',
      'Inclínate hacia adelante hasta que el torso quede casi paralelo al suelo, con rodillas ligeramente dobladas.',
      'Sujeta la barra con agarre prono al ancho de los hombros.',
      'Tira de la barra hacia el abdomen llevando los codos hacia atrás y apretando la espalda media.',
      'Baja lentamente la barra hasta la posición colgante, manteniendo la columna neutral.',
    ],
    videos: mwVideo('Barbell', 'barbell-row'),
  },
  {
    id: 1064,
    name: 'Remo con Mancuerna (Dumbbell Row)',
    primary_muscles: ['Lats'],
    secondary_muscles: ['Middle Back', 'Biceps'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Coloca una mano y la rodilla del mismo lado en un banco para soporte.',
      'Con la otra mano sostén una mancuerna y deja el brazo extendido hacia el suelo.',
      'Tira de la mancuerna hacia la cadera llevando el codo hacia el techo.',
      'Aprieta la espalda en la posición superior y baja controladamente.',
      'Mantén la espalda paralela al suelo y evita rotar el torso.',
    ],
    videos: mwVideo('Dumbbells', 'dumbbell-row', ['side']),
  },
  {
    id: 1065,
    name: 'Remo Sentado en Polea (Seated Cable Row)',
    primary_muscles: ['Middle Back'],
    secondary_muscles: ['Lats', 'Biceps', 'Traps'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Siéntate en la máquina de remo con los pies apoyados en la plataforma y las rodillas ligeramente dobladas.',
      'Sujeta el mango en V y extiende los brazos hacia adelante manteniendo la espalda neutra.',
      'Tira del mango hacia el abdomen apretando los omóplatos al final del movimiento.',
      'Los codos deben pasar rozando los costados hacia atrás.',
      'Estira los brazos completamente antes de cada nueva repetición.',
    ],
    videos: mwVideo('Cables', 'seated-cable-row'),
  },
  {
    id: 1066,
    name: 'Remo en T (T-Bar Row)',
    primary_muscles: ['Middle Back'],
    secondary_muscles: ['Lats', 'Biceps', 'Lower Back'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Fija un extremo de la barra en un rincón o usa una máquina de remo en T.',
      'Inclínate hacia adelante colocando el pecho sobre el soporte si existe, o el torso casi paralelo al suelo.',
      'Sujeta los mangos y tira hacia la parte baja del pecho.',
      'Lleva los codos hacia atrás y aprieta los omóplatos al máximo.',
      'Baja de forma controlada permitiendo el estiramiento completo de la espalda.',
    ],
    videos: mwVideo('Barbell', 't-bar-row', ['side']),
  },

  // ─── HOMBROS ──────────────────────────────────────────────────────────────
  {
    id: 1006,
    name: 'Elevación Lateral con Mancuernas (Dumbbell Lateral Raise)',
    primary_muscles: ['Shoulders'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Párate con pies al ancho de los hombros, mancuernas a los costados con agarre neutro.',
      'Inclina el torso ligeramente hacia adelante y dobla los codos en ~15°.',
      'Eleva los brazos hacia los lados hasta la altura de los hombros.',
      'Inclina ligeramente el meñique hacia arriba (como vertiendo agua) para mayor activación del deltoides lateral.',
      'Baja controladamente: esta fase excéntrica es tan importante como la subida.',
    ],
    videos: mwVideo('Dumbbells', 'lateral-raises'),
  },
  {
    id: 1010,
    name: 'Press Militar con Mancuernas (Dumbbell Shoulder Press)',
    primary_muscles: ['Shoulders'],
    secondary_muscles: ['Triceps'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Siéntate con respaldo vertical sosteniendo una mancuerna en cada mano a la altura de las orejas.',
      'Mantén los pies firmemente en el suelo y el abdomen activo.',
      'Empuja las mancuernas verticalmente hacia arriba hasta casi extender los brazos.',
      'Baja controladamente hasta la posición inicial (a la altura de los hombros/orejas).',
      'Evita arquear la espalda baja empujando el core hacia el respaldo.',
    ],
    videos: mwVideo('Dumbbells', 'dumbbell-shoulder-press'),
  },
  {
    id: 1012,
    name: 'Tirón al Rostro (Face Pull)',
    primary_muscles: ['Shoulders'],
    secondary_muscles: ['Traps', 'Middle Back'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Ajusta la polea a la altura de la cabeza y conecta la cuerda doble.',
      'Sujeta los extremos con agarre neutro y da pasos atrás para tensar.',
      'Tira de la cuerda hacia el rostro separando las manos a ambos lados de las orejas.',
      'Lleva los codos hacia atrás y arriba apretando los deltoides posteriores.',
      'Mantén la posición 1 segundo y vuelve lentamente controlando la tensión.',
    ],
    videos: mwVideo('Cables', 'face-pull'),
  },
  {
    id: 1067,
    name: 'Elevación Frontal con Mancuernas (Front Raise)',
    primary_muscles: ['Shoulders'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Isolation',
    steps: [
      'Párate con los pies al ancho de los hombros sosteniendo mancuernas frente a los muslos.',
      'Con los codos ligeramente doblados, sube un brazo hacia adelante hasta la altura del hombro.',
      'Mantén el torso estático evitando el balanceo.',
      'Baja el brazo de forma controlada mientras el otro sube alternando o sube ambos a la vez.',
      'Enfoca el movimiento en el deltoides anterior.',
    ],
    videos: mwVideo('Dumbbells', 'front-raise'),
  },
  {
    id: 1068,
    name: 'Press Militar con Barra (Barbell Overhead Press)',
    primary_muscles: ['Shoulders'],
    secondary_muscles: ['Triceps', 'Traps'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Sujeta la barra con agarre ligeramente más ancho que los hombros frente al pecho superior.',
      'Con los pies al ancho de los hombros y el core apretado, empuja la barra directamente hacia arriba.',
      'Al pasar la cabeza mueve ligeramente el torso hacia adelante para lograr la posición vertical final.',
      'Extiende los brazos por completo en la posición superior con la barra sobre la cabeza.',
      'Baja la barra lentamente frente al cuello hasta la posición inicial.',
    ],
    videos: mwVideo('Barbell', 'overhead-press'),
  },

  // ─── CUÁDRICEPS / PIERNAS ─────────────────────────────────────────────────
  {
    id: 1004,
    name: 'Sentadilla Goblet (Goblet Squat)',
    primary_muscles: ['Quadriceps'],
    secondary_muscles: ['Glutes', 'Abs'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Sostén una mancuerna verticalmente frente al pecho sujetándola por la base.',
      'Pies ligeramente más anchos que los hombros con puntas apuntando a las 11 y 1.',
      'Inicia empujando la cadera hacia atrás y doblando las rodillas para bajar.',
      'Baja hasta que los muslos estén paralelos o más al suelo manteniendo la espalda recta.',
      'Los codos empujan las rodillas hacia afuera para abrirlas al bajar.',
      'Empuja los talones para volver a la posición de pie apretando los glúteos arriba.',
    ],
    videos: mwVideo('Dumbbells', 'goblet-squat'),
  },
  {
    id: 1009,
    name: 'Prensa de Piernas (Leg Press)',
    primary_muscles: ['Quadriceps'],
    secondary_muscles: ['Glutes', 'Hamstrings'],
    category: 'Machine',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Siéntate en la prensa de piernas con la espalda y cabeza firmemente contra el soporte.',
      'Coloca los pies en la plataforma al ancho de los hombros.',
      'Suelta las barras de seguridad y sujeta las manijas para estabilizarte.',
      'Baja la plataforma flexionando las rodillas hasta 90°, sin despegar la espalda baja.',
      'Empuja con fuerza extendiendo las piernas sin bloquear las rodillas al final.',
    ],
    videos: mwVideo('Machine', 'leg-press', ['side']),
  },
  {
    id: 1069,
    name: 'Sentadilla con Barra (Barbell Back Squat)',
    primary_muscles: ['Quadriceps'],
    secondary_muscles: ['Glutes', 'Hamstrings', 'Lower Back'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Coloca la barra en el trapecio superior (high bar) o en la parte media de la espalda (low bar).',
      'Pies al ancho de los hombros o ligeramente más anchos con las puntas giradas 15-30°.',
      'Respira hondo y aprieta el core antes de descender.',
      'Baja empujando las rodillas hacia afuera siguiendo la línea de los pies, hasta que los muslos estén paralelos al suelo.',
      'Empuja los pies contra el suelo para subir manteniendo el pecho erguido y la espalda recta.',
    ],
    videos: mwVideo('Barbell', 'barbell-squat'),
  },
  {
    id: 1070,
    name: 'Extensión de Cuádriceps en Máquina (Leg Extension)',
    primary_muscles: ['Quadriceps'],
    category: 'Machine',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate en la máquina y ajusta el rodillo para que quede encima del tobillo.',
      'Ajusta el respaldo para que las rodillas queden alineadas con el eje de la máquina.',
      'Extiende las piernas completamente apretando los cuádriceps al máximo.',
      'Mantén 1 segundo la contracción y baja lentamente sin dejar caer el peso.',
      'No bloquees las rodillas en la posición superior de forma brusca.',
    ],
    videos: mwVideo('Machine', 'leg-extension'),
  },
  {
    id: 1071,
    name: 'Zancadas con Mancuernas (Dumbbell Lunges)',
    primary_muscles: ['Quadriceps'],
    secondary_muscles: ['Glutes', 'Hamstrings'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Párate con pies juntos sosteniendo una mancuerna en cada mano.',
      'Da un paso largo hacia adelante y baja la rodilla trasera hacia el suelo.',
      'La rodilla delantera no debe sobrepasar la punta del pie.',
      'Empuja con el talón delantero para volver a la posición inicial.',
      'Alterna las piernas o completa todas las repeticiones en un lado antes de cambiar.',
    ],
    videos: mwVideo('Dumbbells', 'dumbbell-lunge'),
  },
  {
    id: 1072,
    name: 'Sentadilla Búlgara (Bulgarian Split Squat)',
    primary_muscles: ['Quadriceps'],
    secondary_muscles: ['Glutes', 'Hamstrings'],
    category: 'Dumbbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Párate de espaldas a un banco y coloca el empeine del pie trasero sobre él.',
      'El pie delantero debe estar lo suficientemente adelante para que la rodilla no sobrepase la punta al bajar.',
      'Sostén mancuernas a los costados y baja el cuerpo doblando la rodilla delantera.',
      'Baja hasta que el muslo delantero quede paralelo al suelo.',
      'Empuja con el talón delantero para volver arriba. Completa las series en un lado y cambia.',
    ],
    videos: mwVideo('Dumbbells', 'bulgarian-split-squat', ['side']),
  },

  // ─── ISQUIOTIBIALES ───────────────────────────────────────────────────────
  {
    id: 1005,
    name: 'Peso Muerto Rumano con Mancuernas (Romanian Deadlift)',
    primary_muscles: ['Hamstrings'],
    secondary_muscles: ['Glutes', 'Lower Back'],
    category: 'Dumbbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Párate con pies al ancho de las caderas sosteniendo mancuernas frente a los muslos.',
      'Mantén una ligera flexión en las rodillas y la columna neutral.',
      'Empuja las caderas hacia atrás para bajar el torso, deslizando las mancuernas cerca de las piernas.',
      'Baja hasta sentir el estiramiento completo en los isquiotibiales (generalmente a la altura de la espinilla).',
      'Contrae los glúteos e isquiotibiales para empujar la cadera hacia adelante y volver arriba.',
    ],
    videos: mwVideo('Dumbbells', 'romanian-deadlift'),
  },
  {
    id: 1073,
    name: 'Curl de Isquiotibiales en Máquina (Lying Leg Curl)',
    primary_muscles: ['Hamstrings'],
    category: 'Machine',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Acuéstate boca abajo en la máquina con el rodillo sobre los tobillos.',
      'Ajusta la almohadilla de la cadera para que las rodillas queden en el borde de la máquina.',
      'Flexiona las rodillas trayendo los talones hacia los glúteos.',
      'Aprieta los isquiotibiales al máximo en la posición superior.',
      'Baja lentamente a la posición inicial con total control.',
    ],
    videos: mwVideo('Machine', 'lying-leg-curl', ['side']),
  },
  {
    id: 1074,
    name: 'Peso Muerto Convencional (Conventional Deadlift)',
    primary_muscles: ['Hamstrings'],
    secondary_muscles: ['Lower Back', 'Glutes', 'Traps'],
    category: 'Barbell',
    difficulty: 'Advanced',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Coloca los pies al ancho de las caderas debajo de la barra. La barra debe estar sobre el medio del pie.',
      'Inclínate para sujetar la barra con agarre prono o mixto al ancho de los hombros.',
      'Con la espalda recta y el pecho erguido, toma una respiración profunda y aprieta el core.',
      'Empuja el suelo con los pies para extender las rodillas y levantar la barra manteniendo la espalda neutral.',
      'En la posición superior, extiende caderas y rodillas completamente. Baja controladamente.',
    ],
    videos: mwVideo('Barbell', 'deadlift'),
  },

  // ─── GLÚTEOS ──────────────────────────────────────────────────────────────
  {
    id: 1075,
    name: 'Hip Thrust con Barra (Barbell Hip Thrust)',
    primary_muscles: ['Glutes'],
    secondary_muscles: ['Hamstrings'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate con la parte superior de la espalda apoyada en un banco y la barra sobre las caderas.',
      'Coloca los pies planos en el suelo al ancho de los hombros.',
      'Empuja las caderas hacia el techo contrayendo fuertemente los glúteos.',
      'En la posición superior el cuerpo debe formar una línea recta de rodillas a hombros.',
      'Mantén 1-2 segundos la contracción y baja lentamente.',
    ],
    videos: mwVideo('Barbell', 'barbell-hip-thrust', ['side']),
  },
  {
    id: 1076,
    name: 'Patada de Glúteo en Polea (Cable Glute Kickback)',
    primary_muscles: ['Glutes'],
    secondary_muscles: ['Hamstrings'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Conecta el accesorio de tobillera a la polea baja y engancha tu pie.',
      'Agárrate de la máquina para soporte y mantén el torso ligeramente inclinado.',
      'Extiende la pierna hacia atrás contrayendo el glúteo, manteniendo la pierna casi recta.',
      'Sube hasta sentir la máxima contracción del glúteo sin arquear excesivamente la espalda.',
      'Baja lentamente y completa las repeticiones antes de cambiar de pierna.',
    ],
    videos: mwVideo('Cables', 'cable-glute-kickback', ['side']),
  },

  // ─── GEMELOS ──────────────────────────────────────────────────────────────
  {
    id: 1077,
    name: 'Elevación de Talones de Pie (Standing Calf Raise)',
    primary_muscles: ['Calves'],
    category: 'Machine',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Coloca los hombros debajo de las almohadillas de la máquina y los antepies en el escalón.',
      'Baja los talones hacia el suelo para sentir el máximo estiramiento.',
      'Sube en punta de pies lo más alto posible apretando los gemelos.',
      'Mantén la contracción máxima 1-2 segundos antes de bajar.',
      'El movimiento lento y controlado es más efectivo que el rápido con rebote.',
    ],
    videos: mwVideo('Machine', 'calf-raise'),
  },
  {
    id: 1078,
    name: 'Elevación de Talones Sentado (Seated Calf Raise)',
    primary_muscles: ['Calves'],
    category: 'Machine',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate en la máquina con las almohadillas sobre los muslos y los antepies en el escalón.',
      'Baja los talones para estirar completamente el sóleo (músculo profundo del gemelo).',
      'Eleva los talones subiendo en puntas de pie al máximo.',
      'La posición sentada enfatiza el sóleo más que la cabeza del gastrocnemio.',
      'Realiza el movimiento lentamente con pausa en la parte alta.',
    ],
    videos: mwVideo('Machine', 'seated-calf-raise', ['side']),
  },

  // ─── ABDOMINALES ──────────────────────────────────────────────────────────
  {
    id: 1011,
    name: 'Plancha Abdominal (Plank)',
    primary_muscles: ['Abs'],
    secondary_muscles: ['Shoulders', 'Glutes'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Hold',
    grips: [],
    mechanic: 'Isolation',
    steps: [
      'Apoya los antebrazos con los codos debajo de los hombros y las puntas de los pies.',
      'El cuerpo debe formar una línea recta de cabeza a talones.',
      'Contrae abdomen, glúteos y cuádriceps para mantener la posición.',
      'Respira con normalidad, evitando aguantar la respiración.',
      'Mantén la posición el tiempo objetivo sin que la cadera suba ni baje.',
    ],
    videos: mwVideo('Bodyweight', 'plank', ['side']),
  },
  {
    id: 1079,
    name: 'Elevación de Piernas Colgado (Hanging Leg Raise)',
    primary_muscles: ['Abs'],
    secondary_muscles: ['Obliques', 'Forearms'],
    category: 'Bodyweight',
    difficulty: 'Advanced',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Cuélgate de una barra con agarre prono al ancho de los hombros.',
      'Desde la posición colgante, eleva las piernas hacia arriba manteniendo el control.',
      'Para mayor dificultad lleva las piernas rectas hasta el paralelo o más arriba.',
      'Contrae fuertemente el abdomen al llegar arriba, sin balancearte.',
      'Baja lentamente sin soltar la tensión abdominal al descender.',
    ],
    videos: mwVideo('Bodyweight', 'hanging-leg-raise'),
  },
  {
    id: 1080,
    name: 'Crunch Abdominal (Crunch)',
    primary_muscles: ['Abs'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Push',
    grips: [],
    mechanic: 'Isolation',
    steps: [
      'Acuéstate boca arriba con las rodillas dobladas y los pies en el suelo.',
      'Coloca las manos detrás de la cabeza sin entrelazar los dedos.',
      'Contrae el abdomen para levantar los hombros del suelo, curvando la zona lumbar ligeramente.',
      'No tires de la cabeza: el movimiento debe venir del abdomen.',
      'Baja lentamente sin apoyar completamente los hombros entre repeticiones.',
    ],
    videos: mwVideo('Bodyweight', 'crunch'),
  },
  {
    id: 1081,
    name: 'Crunch en Polea (Cable Crunch)',
    primary_muscles: ['Abs'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Arrodíllate frente a una polea alta y sujeta la cuerda a los lados de la cabeza.',
      'Desde esa posición, flexiona la columna contrayendo el abdomen para llevar los codos hacia las rodillas.',
      'El movimiento debe venir de la contracción del abdomen, no de jalar con los brazos.',
      'Mantén la posición baja 1 segundo y vuelve lentamente arriba.',
      'La polea permite añadir peso progresivo para sobrecargar los abdominales.',
    ],
    videos: mwVideo('Cables', 'cable-crunch', ['side']),
  },
  {
    id: 1082,
    name: 'Giro Ruso (Russian Twist)',
    primary_muscles: ['Obliques'],
    secondary_muscles: ['Abs'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate en el suelo con las rodillas dobladas y eleva ligeramente los pies.',
      'Inclina el torso hacia atrás hasta ~45° formando una V con los muslos.',
      'Sostén una mancuerna o pelota medicinal frente al pecho.',
      'Rota el torso de un lado al otro llevando las manos hacia cada cadera.',
      'Mantén el abdomen activo y la espalda recta durante todo el movimiento.',
    ],
    videos: mwVideo('Bodyweight', 'russian-twist', ['front']),
  },

  // ─── TRAPECIO / ESPALDA ALTA ──────────────────────────────────────────────
  {
    id: 1083,
    name: 'Encogimiento de Hombros con Barra (Barbell Shrug)',
    primary_muscles: ['Traps'],
    secondary_muscles: ['Forearms'],
    category: 'Barbell',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Isolation',
    steps: [
      'Párate con los pies al ancho de los hombros y la barra frente a los muslos.',
      'Sujeta la barra con agarre prono ligeramente más ancho que los hombros.',
      'Levanta los hombros directamente hacia las orejas lo más alto posible.',
      'Mantén los brazos rectos durante todo el movimiento.',
      'Mantén 1-2 segundos la contracción en el tope y baja de forma controlada.',
    ],
    videos: mwVideo('Barbell', 'barbell-shrug'),
  },

  // ─── LUMBARES ─────────────────────────────────────────────────────────────
  {
    id: 1084,
    name: 'Hiperextensión de Espalda (Back Extension)',
    primary_muscles: ['Lower Back'],
    secondary_muscles: ['Glutes', 'Hamstrings'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Isolation',
    steps: [
      'Colócate en el banco de hiperextensión con los pies asegurados y la cadera apoyada.',
      'Con los brazos cruzados sobre el pecho o detrás de la cabeza, baja el torso hacia el suelo.',
      'Extiende la espalda para levantar el torso hasta que quede en línea con las piernas.',
      'Mantén la posición superior 1 segundo apretando glúteos y lumbares.',
      'Evita hiperextenderte demasiado para proteger la zona lumbar.',
    ],
    videos: mwVideo('Bodyweight', 'back-extension', ['side']),
  },

  // ─── ANTEBRAZOS ───────────────────────────────────────────────────────────
  {
    id: 1085,
    name: 'Curl de Muñeca con Barra (Wrist Curl)',
    primary_muscles: ['Forearms'],
    category: 'Barbell',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Underhand'],
    mechanic: 'Isolation',
    steps: [
      'Siéntate en un banco y apoya los antebrazos sobre los muslos con las muñecas hacia afuera del borde.',
      'Sujeta la barra con agarre supinado (palmas arriba).',
      'Permite que la barra baje curvando las muñecas hacia abajo.',
      'Flexiona las muñecas para levantar la barra tan alto como sea posible.',
      'Mantén 1 segundo en la posición alta y baja de forma controlada.',
    ],
    videos: mwVideo('Barbell', 'wrist-curl', ['side']),
  },

  // ─── KETTLEBELL ───────────────────────────────────────────────────────────
  {
    id: 1086,
    name: 'Swing con Pesa Rusa (Kettlebell Swing)',
    primary_muscles: ['Glutes'],
    secondary_muscles: ['Hamstrings', 'Lower Back', 'Shoulders'],
    category: 'Kettlebells',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Párate con pies al ancho de los hombros y la kettlebell en el suelo frente a ti.',
      'Sujeta la kettlebell con ambas manos, doble la cadera hacia atrás (hip hinge) y dale impulso entre las piernas.',
      'Extiende explosivamente las caderas hacia adelante para lanzar la kettlebell hacia adelante y arriba.',
      'La kettlebell debe llegar hasta la altura del pecho o cabeza impulsada por la fuerza de la cadera.',
      'Deja que la kettlebell vuelva entre las piernas y repite el ciclo de forma fluida.',
    ],
    videos: mwVideo('Kettlebells', 'kettlebell-swing'),
  },
  {
    id: 1087,
    name: 'Goblet Squat con Kettlebell',
    primary_muscles: ['Quadriceps'],
    secondary_muscles: ['Glutes', 'Abs'],
    category: 'Kettlebells',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Sostén la kettlebell con ambas manos por los lados de la campana, frente al pecho.',
      'Pies al ancho de los hombros o más anchos con las puntas giradas hacia afuera.',
      'Baja en sentadilla profunda manteniendo el pecho erguido y la espalda neutral.',
      'Los codos deben poder pasar por dentro de las rodillas al bajar.',
      'Empuja los talones para volver arriba apretando glúteos y cuádriceps.',
    ],
    videos: mwVideo('Kettlebells', 'goblet-squat'),
  },

  // ─── EJERCICIO CARDIO / FUNCIONAL ─────────────────────────────────────────
  {
    id: 1088,
    name: 'Escalador de Montaña (Mountain Climber)',
    primary_muscles: ['Abs'],
    secondary_muscles: ['Shoulders', 'Quadriceps'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Adopta la posición de plancha alta con brazos extendidos y manos debajo de los hombros.',
      'Lleva la rodilla derecha hacia el pecho lo más rápido posible.',
      'Vuelve la pierna derecha al punto de partida mientras llevas la izquierda al pecho.',
      'Alterna rápidamente las piernas manteniendo la cadera estable y el core activo.',
      'Mantén los hombros sobre las muñecas y evita que la cadera suba durante el movimiento.',
    ],
    videos: mwVideo('Bodyweight', 'mountain-climbers'),
  },
  {
    id: 1089,
    name: 'Burpee',
    primary_muscles: ['Chest'],
    secondary_muscles: ['Quadriceps', 'Shoulders', 'Abs'],
    category: 'Bodyweight',
    difficulty: 'Intermediate',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Párate con los pies al ancho de los hombros.',
      'Baja en sentadilla y apoya las manos en el suelo.',
      'Salta hacia atrás para quedar en plancha y realiza una flexión.',
      'Salta los pies hacia las manos para volver a la posición agachada.',
      'Salta verticalmente con los brazos por encima de la cabeza al levantarte.',
    ],
    videos: mwVideo('Bodyweight', 'burpee'),
  },

  // ─── ESTIRAMIENTOS / MOVILIDAD ────────────────────────────────────────────
  {
    id: 1090,
    name: 'Estiramiento de Pecho en Pared',
    primary_muscles: ['Chest'],
    secondary_muscles: ['Shoulders'],
    category: 'Stretch',
    difficulty: 'Beginner',
    force: 'Hold',
    grips: [],
    mechanic: 'Isolation',
    steps: [
      'Párate junto a una pared y apoya el brazo en la pared con el codo a la altura del hombro.',
      'Gira suavemente el torso hacia el lado opuesto hasta sentir el estiramiento en el pecho.',
      'Mantén la posición 20-30 segundos respirando de forma profunda.',
      'Repite del otro lado.',
    ],
    videos: [],
  },
  {
    id: 1091,
    name: 'Estiramiento de Isquiotibiales (Hamstring Stretch)',
    primary_muscles: ['Hamstrings'],
    category: 'Stretch',
    difficulty: 'Beginner',
    force: 'Hold',
    grips: [],
    mechanic: 'Isolation',
    steps: [
      'Siéntate en el suelo con las piernas extendidas y juntas.',
      'Inclínate hacia adelante desde la cadera (no desde la espalda) alcanzando las puntas de los pies.',
      'Mantén la espalda lo más recta posible durante el estiramiento.',
      'Mantén la posición 30-45 segundos sin rebotar.',
    ],
    videos: [],
  },
];

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

      let res: Response | null = null;
      try {
        res = await fetch(`${cleanBase}data/exercises.json`);
      } catch (e) {}

      if (!res || !res.ok) {
        try {
          res = await fetch('/data/exercises.json');
        } catch (e) {}
      }

      if (!res || !res.ok) {
        try {
          res = await fetch('data/exercises.json');
        } catch (e) {}
      }

      if (!res || !res.ok) throw new Error('Failed to fetch exercises.json');
      const data = await res.json();
      
      this._datasetCache = data.map((item: any) => {
        const primaryMuscle = mapTargetToMuscleWiki(item.target, item.body_part);
        const category = mapEquipmentToMuscleWiki(item.equipment);
        
        // Use Spanish instructions if available, fallback to English
        const steps = item.instruction_steps && item.instruction_steps.es && item.instruction_steps.es.length > 0
          ? item.instruction_steps.es
          : (item.instruction_steps && item.instruction_steps.en ? item.instruction_steps.en : []);
          
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
          videos: [
            {
              angle: 'front',
              gender: 'male' as const,
              og_image: imagePath ? `${cleanBase}${imagePath}` : '',
              url: gifPath ? `${cleanBase}${gifPath}` : ''
            }
          ]
        };
      });
      return this._datasetCache || [];
    } catch (e) {
      console.error('Error loading exercises.json, falling back to LOCAL_EXERCISES', e);
      return [];
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
