// Service to communicate with the MuscleWiki API or fallback to mock data
// if the key is on the BASIC/Free tier.

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

// Default key provided by the user
const DEFAULT_API_KEY = 'mw_rJ7RFufexI5drONWeYvc3ANy3HwnfgL8Sw8KpUHtdNk';
const STORAGE_KEY_API_KEY = 'aerogym_musclewiki_api_key';
const STORAGE_KEY_MOCK_MODE = 'aerogym_musclewiki_mock_mode';

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
};

// Rich Mock exercise database for BASIC tier fallback
export const MOCK_MUSCLEWIKI_EXERCISES: MuscleWikiExercise[] = [
  {
    id: 1001,
    name: 'Curl de Bíceps con Barra (Barbell Curl)',
    primary_muscles: ['Biceps'],
    category: 'Barbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Underhand'],
    mechanic: 'Isolation',
    steps: [
      'Párate derecho sosteniendo una barra con un agarre supinado (palmas hacia arriba) al ancho de tus hombros.',
      'Manteniendo los codos cerca de tu torso y los brazos inmóviles, contrae los bíceps para flexionar la barra hacia adelante.',
      'Continúa el movimiento hasta que tus bíceps estén completamente contraídos y la barra a la altura de los hombros.',
      'Mantén la posición contraída por un segundo para maximizar la tensión.',
      'Baja lentamente la barra de regreso a la posición inicial, controlando el peso en todo momento.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Barbell-barbell-curl-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Barbell-barbell-curl-front.mp4'
      },
      {
        angle: 'side',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Barbell-barbell-curl-side.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Barbell-barbell-curl-side.mp4'
      }
    ],
    bodymap_male: 'https://api.musclewiki.com/stream/images/bodymaps/1?gender=male',
    bodymap_female: 'https://api.musclewiki.com/stream/images/bodymaps/1?gender=female'
  },
  {
    id: 1002,
    name: 'Press de Banca con Mancuernas (Dumbbell Bench Press)',
    primary_muscles: ['Chest'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Acuéstate boca arriba en un banco plano sosteniendo una mancuerna en cada mano a los costados de tu pecho.',
      'Mantén los pies bien apoyados en el suelo y los hombros retraídos contra el banco.',
      'Empuja las mancuernas hacia arriba extendiendo los brazos, asegurándote de que no choquen arriba.',
      'Baja las mancuernas de forma controlada hasta que sientas un estiramiento cómodo en el pecho.',
      'Repite el movimiento manteniendo los codos en un ángulo aproximado de 45 a 60 grados con respecto al torso.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Dumbbells-dumbbell-chest-press-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Dumbbells-dumbbell-chest-press-front.mp4'
      }
    ],
    bodymap_male: 'https://api.musclewiki.com/stream/images/bodymaps/2?gender=male',
    bodymap_female: 'https://api.musclewiki.com/stream/images/bodymaps/2?gender=female'
  },
  {
    id: 1003,
    name: 'Jalón Dorsal en Polea (Cable Lat Pulldown)',
    primary_muscles: ['Lats'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Siéntate en la máquina de jalón al pecho y ajusta la almohadilla de las rodillas para que queden firmes.',
      'Sujeta la barra con un agarre prono un poco más ancho que tus hombros.',
      'Saca pecho e inclina el torso ligeramente hacia atrás.',
      'Tira de la barra hacia abajo hacia la parte superior de tu pecho, llevando los codos hacia tus costados y apretando los dorsales.',
      'Regresa la barra lentamente a la posición inicial permitiendo que los dorsales se estiren por completo.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Cables-lat-pulldown-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Cables-lat-pulldown-front.mp4'
      }
    ]
  },
  {
    id: 1004,
    name: 'Sentadilla Goblet (Goblet Squat)',
    primary_muscles: ['Quadriceps'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Sostén una mancuerna verticalmente frente a tu pecho, sujetándola con ambas manos por la base superior.',
      'Párate con los pies a una anchura ligeramente mayor que la de tus hombros y las puntas de los pies apuntando ligeramente hacia afuera.',
      'Inicia el descenso empujando la cadera hacia atrás y flexionando las rodillas, como si fueras a sentarte en una silla.',
      'Baja hasta que tus muslos estén paralelos al suelo o lo más profundo que te permita tu movilidad.',
      'Mantén la espalda recta y el pecho erguido. Empuja con fuerza los talones para volver a la posición de pie.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Dumbbells-goblet-squat-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Dumbbells-goblet-squat-front.mp4'
      }
    ]
  },
  {
    id: 1005,
    name: 'Peso Muerto Rumano con Mancuernas (Dumbbell Romanian Deadlift)',
    primary_muscles: ['Hamstrings'],
    category: 'Dumbbell',
    difficulty: 'Intermediate',
    force: 'Pull',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Párate con los pies separados al ancho de las caderas, sosteniendo una mancuerna en cada mano frente a tus muslos.',
      'Mantén una flexión muy ligera en las rodillas y la columna en una posición neutra (espalda recta).',
      'Empuja las caderas hacia atrás para iniciar el descenso del torso, deslizando las mancuernas cerca de tus piernas.',
      'Baja el peso hasta sentir un estiramiento completo en los isquiotibiales (generalmente justo debajo de las rodillas).',
      'Contrae los glúteos e isquiotibiales para empujar la cadera hacia adelante y volver a la posición vertical.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Dumbbells-romanian-deadlift-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Dumbbells-romanian-deadlift-front.mp4'
      }
    ]
  },
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
      'Párate derecho con una mancuerna en cada mano a los costados de tus muslos, inclinando el torso ligeramente hacia adelante.',
      'Manteniendo los codos ligeramente flexionados, eleva los brazos hacia los lados formando un arco.',
      'Continúa elevando el peso hasta que tus brazos queden paralelos al suelo (altura de los hombros).',
      'Siente la contracción en los deltoides laterales por una fracción de segundo.',
      'Baja las mancuernas de manera controlada y repite.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Dumbbells-lateral-raises-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Dumbbells-lateral-raises-front.mp4'
      }
    ]
  },
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
      'Sjeta una barra recta o en V conectada a una polea alta con un agarre prono al ancho de los hombros.',
      'Párate cerca de la polea con el torso ligeramente inclinado hacia adelante y coloca tus codos pegados a los costados del cuerpo.',
      'Empuja la barra hacia abajo extendiendo los brazos por completo, apretando los tríceps al final del rango.',
      'Evita que los codos se muevan hacia adelante o hacia los lados.',
      'Sube lentamente la barra de regreso a la posición de inicio, sintiendo el estiramiento en los tríceps.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Cables-tricep-pushdown-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Cables-tricep-pushdown-front.mp4'
      }
    ]
  },
  {
    id: 1008,
    name: 'Flexiones de Pecho (Push Up)',
    primary_muscles: ['Chest'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Colócate en posición de plancha con las manos alineadas justo debajo de tus hombros y el cuerpo formando una línea recta desde la cabeza a los talones.',
      'Mantén el abdomen contraído y la cabeza en posición neutra, mirando al suelo.',
      'Flexiona los codos hacia atrás en un ángulo de unos 45 grados con respecto a tu cuerpo para bajar el pecho.',
      'Baja hasta que tu pecho casi toque el suelo.',
      'Empuja el suelo con fuerza para extender los brazos y volver a la posición de inicio.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Bodyweight-pushup-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Bodyweight-pushup-front.mp4'
      }
    ]
  },
  {
    id: 1009,
    name: 'Prensa de Piernas (Leg Press)',
    primary_muscles: ['Quadriceps'],
    category: 'Machine',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Siéntate en la máquina de prensa y apoya la espalda y cabeza firmemente contra el soporte.',
      'Coloca los pies en la plataforma separados al ancho de los hombros.',
      'Libera las barras de seguridad y sujeta las manijas laterales para estabilidad.',
      'Flexiona las rodillas para bajar la plataforma lentamente hacia tu pecho, formando un ángulo de 90 grados con las rodillas sin levantar la espalda baja.',
      'Empuja la plataforma con fuerza extendiendo las piernas, asegurándote de no bloquear las rodillas al final del recorrido.'
    ],
    videos: [
      {
        angle: 'side',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Machine-leg-press-side.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Machine-leg-press-side.mp4'
      }
    ]
  },
  {
    id: 1010,
    name: 'Press Militar con Mancuernas (Dumbbell Shoulder Press)',
    primary_muscles: ['Shoulders'],
    category: 'Dumbbell',
    difficulty: 'Beginner',
    force: 'Push',
    grips: ['Overhand'],
    mechanic: 'Compound',
    steps: [
      'Siéntate en un banco con respaldo vertical sosteniendo una mancuerna en cada mano a la altura de las orejas.',
      'Mantén los pies firmemente apoyados en el suelo y el abdomen activo.',
      'Empuja las mancuernas verticalmente hacia arriba hasta que tus brazos estén extendidos casi por completo.',
      'Baja las mancuernas controladamente hasta la altura inicial de los hombros/orejas.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Dumbbells-dumbbell-shoulder-press-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Dumbbells-dumbbell-shoulder-press-front.mp4'
      }
    ]
  },
  {
    id: 1011,
    name: 'Plancha Abdominal (Plank)',
    primary_muscles: ['Abs'],
    category: 'Bodyweight',
    difficulty: 'Beginner',
    force: 'Hold',
    grips: [],
    mechanic: 'Isolation',
    steps: [
      'Apoya los antebrazos en el suelo alineando los codos justo debajo de los hombros.',
      'Extiende las piernas hacia atrás apoyando solo la punta de los pies, elevando el cuerpo.',
      'Contrae fuertemente el abdomen y los glúteos para mantener la espalda recta.',
      'Sostén esta posición estática respirando con normalidad, evitando elevar o dejar caer la cadera.'
    ],
    videos: [
      {
        angle: 'side',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Bodyweight-plank-side.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Bodyweight-plank-side.mp4'
      }
    ]
  },
  {
    id: 1012,
    name: 'Tirón al Rostro (Face Pull)',
    primary_muscles: ['Shoulders'],
    category: 'Cables',
    difficulty: 'Beginner',
    force: 'Pull',
    grips: ['Neutral'],
    mechanic: 'Compound',
    steps: [
      'Ajusta la polea a la altura del pecho o la cabeza y conecta el accesorio de cuerda doble.',
      'Sujeta las cuerdas con las palmas mirándose y da unos pasos atrás para tensar el cable.',
      'Tira de la cuerda hacia tu rostro, separando tus manos a los lados de tus orejas mientras llevas los codos hacia atrás y arriba.',
      'Aprieta los deltoides posteriores y rotadores al final del movimiento por un segundo.',
      'Regresa lentamente al inicio controlando la tensión.'
    ],
    videos: [
      {
        angle: 'front',
        gender: 'male',
        og_image: 'https://images.musclewiki.com/media/images/og-male-Cables-face-pull-front.jpg',
        url: 'https://media.musclewiki.com/media/videos/unbranded/male-Cables-face-pull-front.mp4'
      }
    ]
  }
];

export class MuscleWikiService {
  // Get the stored API key or return the default one
  static getApiKey(): string {
    const key = localStorage.getItem(STORAGE_KEY_API_KEY);
    return key !== null ? key : DEFAULT_API_KEY;
  }

  // Set and persist a new API key
  static setApiKey(key: string): void {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_API_KEY);
    }
  }

  // Check if mock mode is forced or active
  static isMockModeActive(): boolean {
    const mode = localStorage.getItem(STORAGE_KEY_MOCK_MODE);
    if (mode === 'true') return true;
    if (mode === 'false') return false;
    
    // Default to true if key is default (BASIC tier), because we know it fails from browser CORS/direct requests
    const key = this.getApiKey();
    return key === DEFAULT_API_KEY || key.startsWith('mw_') && !mode;
  }

  // Set mock mode status
  static setMockMode(active: boolean): void {
    localStorage.setItem(STORAGE_KEY_MOCK_MODE, String(active));
  }

  // Test the key against the actual endpoint to identify the tier
  static async verifyConnection(key: string): Promise<{ success: boolean; message: string; tier: 'BASIC' | 'TESTING+' | 'INVALID' }> {
    try {
      const response = await fetch('https://api.musclewiki.com/muscles', {
        method: 'GET',
        headers: {
          'X-API-Key': key.trim(),
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        return {
          success: true,
          tier: 'TESTING+',
          message: '¡Conexión exitosa! Clave válida con acceso directo de producción.'
        };
      }

      if (response.status === 403) {
        const text = await response.text();
        if (text.includes('BASIC tier')) {
          return {
            success: true, // We count it as success because the key is VALID, but tier is BASIC
            tier: 'BASIC',
            message: 'Clave válida en plan gratuito BASIC (se activará la simulación local de MuscleWiki).'
          };
        }
      }

      return {
        success: false,
        tier: 'INVALID',
        message: `Error de conexión (${response.status}): Clave no válida o expirada.`
      };
    } catch (e: any) {
      return {
        success: false,
        tier: 'INVALID',
        message: `Error de red: ${e.message || 'No se pudo contactar con MuscleWiki.'}`
      };
    }
  }

  // Search exercises using the query and filters
  static async searchExercises(
    query: string,
    filters: { muscle?: string; category?: string; difficulty?: string } = {}
  ): Promise<MuscleWikiExercise[]> {
    const isMock = this.isMockModeActive();
    
    if (isMock) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return MOCK_MUSCLEWIKI_EXERCISES.filter(ex => {
        const matchesQuery = !query || 
          ex.name.toLowerCase().includes(query.toLowerCase()) || 
          ex.steps.some(step => step.toLowerCase().includes(query.toLowerCase()));
        
        const matchesMuscle = !filters.muscle || 
          ex.primary_muscles.includes(filters.muscle);
          
        const matchesCategory = !filters.category || 
          ex.category === filters.category;
          
        const matchesDifficulty = !filters.difficulty || 
          ex.difficulty === filters.difficulty;

        return matchesQuery && matchesMuscle && matchesCategory && matchesDifficulty;
      });
    }

    // Real API Call
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.muscle) params.append('muscles', filters.muscle); // muscle group in API

      const url = `https://api.musclewiki.com/search?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': this.getApiKey(),
          'Accept': 'application/json'
        }
      });

      if (response.status === 403) {
        // Automatically switch on mock mode locally since the key is BASIC tier
        this.setMockMode(true);
        return this.searchExercises(query, filters);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as MuscleWikiExercise[];
    } catch (error) {
      console.warn("MuscleWiki search error, falling back to mock:", error);
      // Temporary fallback to mock
      return MOCK_MUSCLEWIKI_EXERCISES.filter(ex => {
        const matchesQuery = !query || ex.name.toLowerCase().includes(query.toLowerCase());
        const matchesMuscle = !filters.muscle || ex.primary_muscles.includes(filters.muscle);
        return matchesQuery && matchesMuscle;
      });
    }
  }

  // Get details of a single exercise
  static async getExerciseDetails(id: string | number): Promise<MuscleWikiExercise | null> {
    const numericId = typeof id === 'string' ? parseInt(id.replace('mw-', '')) : id;
    
    // Check if it's in our mock database
    const mockEx = MOCK_MUSCLEWIKI_EXERCISES.find(e => e.id === numericId);
    if (mockEx && (this.isMockModeActive() || isNaN(numericId) || numericId >= 1000)) {
      return mockEx;
    }

    if (this.isMockModeActive()) {
      return mockEx || null;
    }

    // Real API Call
    try {
      const url = `https://api.musclewiki.com/exercises/${numericId}?detail=true`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': this.getApiKey(),
          'Accept': 'application/json'
        }
      });

      if (response.status === 403) {
        this.setMockMode(true);
        return this.getExerciseDetails(id);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as MuscleWikiExercise;
    } catch (error) {
      console.warn("MuscleWiki details error, falling back to mock:", error);
      return mockEx || null;
    }
  }

  // Get local cache of a MuscleWiki exercise info (synchronous fallback for list renderers)
  static getCachedExerciseInfo(id: string | number): { name: string; muscleGroup: string } {
    const cleanId = String(id).replace('mw-', '');
    const numericId = parseInt(cleanId);
    
    const mockEx = MOCK_MUSCLEWIKI_EXERCISES.find(e => String(e.id) === cleanId);
    if (mockEx) {
      return {
        name: mockEx.name,
        muscleGroup: TRANSLATE_MUSCLE[mockEx.primary_muscles[0]] || mockEx.primary_muscles[0]
      };
    }

    // Dynamic label for unidentified live exercises
    return {
      name: `Ejercicio MuscleWiki #${cleanId}`,
      muscleGroup: 'MuscleWiki'
    };
  }
}
