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

  // ESPALDA
  { id: 'lat-pulldown', name: 'Jalón al Pecho', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'hammer-row', name: 'Remo Hammer', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'chest-supported-row', name: 'Remo Soporte Pecho', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'seated-row', name: 'Remo en Polea Baja', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'db-rows', name: 'Remo con Mancuerna', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'pullups', name: 'Dominadas', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'deadlift', name: 'Peso Muerto Convencional', muscleGroup: 'Espalda', type: 'Compuesto' },
  { id: 'cable-pullover', name: 'Pullover en Polea', muscleGroup: 'Espalda', type: 'Aislamiento' },

  // PIERNAS
  { id: 'squats', name: 'Sentadilla con Barra', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-press-45', name: 'Prensa 45º', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-press-light', name: 'Prensa Ligera', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'leg-extensions', name: 'Extensiones de Cuádriceps', muscleGroup: 'Cuádriceps', type: 'Aislamiento' },
  { id: 'romanian-deadlift', name: 'Peso Muerto Rumano', muscleGroup: 'Isquios', type: 'Compuesto' },
  { id: 'leg-curls', name: 'Curl Femoral', muscleGroup: 'Isquios', type: 'Aislamiento' },
  { id: 'lunges', name: 'Zancadas', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'bulgarian-split-squat', name: 'Sentadilla Búlgara', muscleGroup: 'Cuádriceps', type: 'Compuesto' },
  { id: 'hip-thrust', name: 'Hip Thrust', muscleGroup: 'Glúteos', type: 'Compuesto' },
  // BUG FIX: 'calf-raises' estaba duplicado con el mismo ID. Ahora son IDs únicos.
  { id: 'calf-raises-standing', name: 'Elevación de Talones de Pie', muscleGroup: 'Gemelos', type: 'Aislamiento' },
  { id: 'calf-raises-seated', name: 'Elevación de Talones Sentado', muscleGroup: 'Gemelos', type: 'Aislamiento' },

  // HOMBROS
  { id: 'db-overhead-press', name: 'Press Militar con Mancuernas', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'bb-overhead-press', name: 'Press Militar con Barra', muscleGroup: 'Hombros', type: 'Compuesto' },
  { id: 'lateral-raises', name: 'Elevaciones Laterales', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'reverse-flys', name: 'Reverse Fly / Pájaros', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'Hombros', type: 'Aislamiento' },
  { id: 'arnold-press', name: 'Press Arnold', muscleGroup: 'Hombros', type: 'Compuesto' },

  // BRAZOS
  { id: 'tricep-extensions', name: 'Extensión de Tríceps en Polea', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'tricep-overhead', name: 'Extensión Tríceps sobre Cabeza', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'skull-crushers', name: 'Rompe Cráneos', muscleGroup: 'Tríceps', type: 'Aislamiento' },
  { id: 'assisted-dips', name: 'Fondos Asistidos', muscleGroup: 'Tríceps', type: 'Compuesto' },
  { id: 'bb-curls', name: 'Curl de Bíceps con Barra', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'hammer-curls', name: 'Curl Martillo', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'db-alt-curls', name: 'Curl Mancuernas Alterno', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'concentration-curls', name: 'Curl Concentrado', muscleGroup: 'Bíceps', type: 'Aislamiento' },
  { id: 'cable-curls', name: 'Curl en Polea', muscleGroup: 'Bíceps', type: 'Aislamiento' },

  // CORE
  { id: 'plank', name: 'Plancha Abdominal', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'hanging-leg-raises', name: 'Elevaciones de Piernas Colgado', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'cable-crunch', name: 'Crunch en Polea', muscleGroup: 'Abdominales', type: 'Aislamiento' },
  { id: 'russian-twist', name: 'Rotación Rusa', muscleGroup: 'Abdominales', type: 'Aislamiento' },

  // CARDIO
  { id: 'treadmill', name: 'Cinta de Correr', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'cycling', name: 'Bicicleta Estática', muscleGroup: 'Cardio', type: 'Compuesto' },
  { id: 'rowing-machine', name: 'Máquina de Remo', muscleGroup: 'Espalda', type: 'Compuesto' },
];
