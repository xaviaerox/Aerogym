import { Exercise } from '../types';

// Catálogo base de ejercicios — sincronizado con la tabla exercises de Supabase
// IDs coinciden exactamente con los slugs de la BD para compatibilidad de datos históricos
export const BASE_EXERCISES: Exercise[] = [
  // PECHO
  { id: 'bench-press', name: 'Press de Banca', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'incline-bb-press', name: 'Press Inclinado con Barra', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'incline-db-press', name: 'Press Superior con Mancuernas', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'chest-machine-press', name: 'Máquina de Pecho', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'pec-dec', name: 'Pec Deck / Aperturas', muscleGroup: 'Pecho', type: 'Aislamiento' },
  { id: 'dips', name: 'Fondos en Paralelas', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'cable-flyes', name: 'Cruces en Polea', muscleGroup: 'Pecho', type: 'Aislamiento' },
  { id: 'decline-bb-press', name: 'Press Declinado con Barra', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'smith-incline-press', name: 'Press Inclinado en Multipower', muscleGroup: 'Pecho', type: 'Compuesto' },
  { id: 'incline-db-flyes', name: 'Aperturas Inclinadas con Mancuernas', muscleGroup: 'Pecho', type: 'Aislamiento' },

  // ESPALDA
  { id: 'lat-pulldown', name: 'Jalón al Pecho', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'hammer-row', name: 'Remo Hammer', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'chest-supported-row', name: 'Remo Soporte Pecho', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'seated-row', name: 'Remo en Polea Baja', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'db-rows', name: 'Remo con Mancuerna', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'pullups', name: 'Dominadas', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'chinups', name: 'Dominadas Supinas', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'deadlift', name: 'Peso Muerto Convencional', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'cable-pullover', name: 'Pullover en Polea', muscleGroup: 'Espalda', type: 'Aislamiento' },
  { id: 'db-pullover', name: 'Pullover con Mancuerna', muscleGroup: 'Espalda', type: 'Aislamiento' },
  { id: 'hyperextensions', name: 'Hiperextensiones Lumbares', muscleGroup: 'Espalda', type: 'Aislamiento' },
  { id: 't-bar-row', name: 'Remo en Punta (T-Bar)', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'close-grip-pulldown', name: 'Jalón Agrego Cerrado', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'unilateral-cable-row', name: 'Remo Unilateral en Polea', muscleGroup: 'Espalda', type: 'Compuesto' },

  // PIERNAS / CUÁDRICEPS
  { id: 'squats', name: 'Sentadilla con Barra', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-press-45', name: 'Prensa 45º', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-press-light', name: 'Prensa Ligera', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-extensions', name: 'Extensiones de Cuádriceps', muscleGroup: 'Cuádriceps', type: 'Aislamiento' },
  { id: 'lunges', name: 'Zancadas', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'bulgarian-split-squat', name: 'Sentadilla Búlgara', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'hack-squat', name: 'Sentadilla Hack', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'goblet-squat', name: 'Sentadilla Goblet', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'front-squat', name: 'Sentadilla Frontal', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'reverse-lunges', name: 'Zancadas Inversas', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'sissy-squat', name: 'Sentadilla Sissy', muscleGroup: 'Cuádriceps', type: 'Aislamiento' },
  { id: 'single-leg-extension', name: 'Extensiones Unilaterales de Cuádriceps', muscleGroup: 'Cuádriceps', type: 'Aislamiento' },

  // ISQUIOTIBIALES
  { id: 'romanian-deadlift', name: 'Peso Muerto Rumano', muscleGroup: 'Isquios', type: 'Compuesto' },
  { id: 'leg-curls', name: 'Curl Femoral Tumbado', muscleGroup: 'Isquios', type: 'Aislamiento' },
  { id: 'seated-leg-curls', name: 'Curl Femoral Sentado', muscleGroup: 'Isquios', type: 'Aislamiento' },
  { id: 'stiff-leg-deadlift', name: 'Peso Muerto Piernas Semirrígidas', muscleGroup: 'Isquios', type: 'Compuesto' },
  { id: 'standing-leg-curl', name: 'Curl Femoral de Pie', muscleGroup: 'Isquios', type: 'Aislamiento' },
  { id: 'db-romanian-deadlift', name: 'Peso Muerto Rumano con Mancuernas', muscleGroup: 'Isquios', type: 'Compuesto' },

  // GLÚTEOS
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'Glúteos', type: 'Compuesto' },
  { id: 'cable-kickbacks', name: 'Patada de Glúteo en Polea', muscleGroup: 'Glúteos', type: 'Aislamiento' },
  { id: 'abductor-machine', name: 'Abducción en Máquina', muscleGroup: 'Glúteos', type: 'Aislamiento' },
  { id: 'glute-bridge', name: 'Puente de Glúteo', muscleGroup: 'Glúteos', type: 'Aislamiento' },
  { id: 'lateral-lunges', name: 'Zancada Lateral', muscleGroup: 'Glúteos', type: 'Compuesto' },
  { id: 'step-ups', name: 'Subidas al Cajón (Step-ups)', muscleGroup: 'Glúteos', type: 'Compuesto' },
  { id: 'cable-abduction', name: 'Patada Lateral en Polea', muscleGroup: 'Glúteos', type: 'Aislamiento' },

  // GEMELOS
  { id: 'calf-raises-standing', name: 'Elevación de Talones de Pie', muscleGroup: 'Gemelos', type: 'Aislamiento' },
  { id: 'calf-raises-seated', name: 'Elevación de Talones Sentado', muscleGroup: 'Gemelos', type: 'Aislamiento' },
  { id: 'press-calf-raises', name: 'Elevación de Talones en Prensa', muscleGroup: 'Gemelos', type: 'Aislamiento' },

  // HOMBROS
  { id: 'db-overhead-press', name: 'Press Militar con Mancuernas', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'bb-overhead-press', name: 'Press Militar con Barra', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'arnold-press', name: 'Press Arnold', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'lateral-raises', name: 'Elevaciones Laterales Mancuernas', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'cable-lateral-raises', name: 'Elevaciones Laterales en Polea', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'reverse-flys', name: 'Reverse Fly / Pájaros Mancuernas', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'cable-reverse-flys', name: 'Pájaros en Polea', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'front-raises', name: 'Elevaciones Frontales Mancuernas', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'upright-row', name: 'Tirón al Mentón (Upright Row)', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'smith-overhead-press', name: 'Press Militar en Multipower', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'shrugs', name: 'Encogimientos de Hombros', muscleGroup: 'Hombros', type: 'Aislamiento' },

  // BÍCEPS
  { id: 'bb-curls', name: 'Curl de Bíceps con Barra', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'db-alt-curls', name: 'Curl Mancuernas Alterno', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'hammer-curls', name: 'Curl Martillo', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'preacher-curl', name: 'Curl Predicador Barra EZ', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'db-preacher-curl', name: 'Curl Predicador con Mancuerna', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'cable-curls', name: 'Curl en Polea', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'concentration-curls', name: 'Curl Concentrado', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'incline-db-curls', name: 'Curl Inclinado con Mancuernas', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'cable-hammer-curls', name: 'Curl Martillo en Polea', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'zottman-curl', name: 'Curl Zottman', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'high-cable-curls', name: 'Curl en Polea Alta (Doble Bíceps)', muscleGroup: 'Bíceps', type: 'Aislamiento' },

  // TRÍCEPS
  { id: 'tricep-extensions', name: 'Extensión de Tríceps en Polea', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'tricep-overhead', name: 'Extensión Tríceps sobre Cabeza', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'skull-crushers', name: 'Rompe Cráneos', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'assisted-dips', name: 'Fondos Asistidos', muscleGroup: 'Tríceps', type: 'Compuesto' },
  { id: 'close-grip-bench', name: 'Press Cerrado con Barra', muscleGroup: 'Tríceps', type: 'Compuesto' },
  { id: 'overhead-cable-extension', name: 'Extensión Tríceps tras Nuca con Polea', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'db-kickbacks', name: 'Patada de Tríceps con Mancuerna', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'bench-dips', name: 'Fondos entre Bancos', muscleGroup: 'Tríceps', type: 'Compuesto' },
  { id: 'french-press', name: 'Press Francés con Mancuernas', muscleGroup: 'Tríceps', type: 'Aislamiento' },

  // ANTEBRAZOS
  { id: 'wrist-curls-prono', name: 'Curl de Muñeca Prono', muscleGroup: 'Antebrazos', type: 'Aislamiento' },
  { id: 'wrist-curls-supino', name: 'Curl de Muñeca Supino', muscleGroup: 'Antebrazos', type: 'Aislamiento' },
  { id: 'reverse-bb-curl', name: 'Curl Invertido con Barra', muscleGroup: 'Antebrazos', type: 'Aislamiento' },
  { id: 'farmers-walk', name: 'Paseo del Granjer (Farmer\'s Walk)', muscleGroup: 'Antebrazos', type: 'Compuesto' },

  // CORE
  { id: 'plank', name: 'Plancha Abdominal', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'hanging-leg-raises', name: 'Elevaciones de Piernas Colgado', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'cable-crunch', name: 'Crunch en Polea', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'russian-twist', name: 'Rotación Rusa', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'reverse-crunch', name: 'Crunch Inverso', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'side-plank', name: 'Plancha Lateral', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'ab-wheel', name: 'Rueda Abdominal (Ab Wheel)', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'machine-crunch', name: 'Crunch Abdominal en Máquina', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'incline-leg-raises', name: 'Elevaciones de Piernas en Banco Inclinado', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'cable-woodchopper', name: 'Leñador en Polea (Woodchopper)', muscleGroup: 'Abdominales', type: 'Aislamiento' },

  // CARDIO
  { id: 'treadmill', name: 'Cinta de Correr', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'cycling', name: 'Bicicleta Estática', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'rowing-machine', name: 'Máquina de Remo', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'elliptical', name: 'Elíptica', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'jump-rope', name: 'Saltar la Cuerda', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'stairmaster', name: 'Subir Escaleras (Stairmaster)', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'swimming', name: 'Natación', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'brisk-walk', name: 'Caminar a Ritmo Ligero', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'hiit-run', name: 'HIIT en Cinta', muscleGroup: 'Cardio', type: 'Compuesto' },
];
