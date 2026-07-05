export type { DailyHealthMetric } from './health';

export type MuscleGroup = 
  | 'Pecho' | 'Espalda' | 'Hombros' | 'Cuádriceps' | 'Isquios' | 'Glúteos' | 'Gemelos' 
  | 'Bíceps' | 'Tríceps' | 'Antebrazos' | 'Abdominales' | 'Cardio' | 'Cuerpo Completo';

export type Goal = 'Hipertrofia' | 'Fuerza' | 'Definición' | 'Mantenimiento';
export type Level = 'Principiante' | 'Intermedio' | 'Avanzado';
export type Experience = 'PPL' | 'Torso Pierna' | 'Cuerpo Completo' | 'Weider' | 'Personalizado';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  type: 'Compuesto' | 'Aislamiento';
  notes?: string;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  completed: boolean;
  duration_seconds?: number | null;
  distance_meters?: number | null;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: Set[];
}

export interface Session {
  id: string;
  name: string;
  date: string; // ISO string
  exercises: WorkoutExercise[];
  notes?: string;
  duration?: number; // in minutes
  totalVolume: number;
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    defaultSets: number;
    defaultReps: string; // e.g. "8-12"
    defaultWeight?: number;
  }[];
}

export type ActivityLevel = 'Sedentario' | 'Ligero' | 'Moderado' | 'Activo' | 'Muy Activo';
export type Gender = 'Hombre' | 'Mujer';

export interface UserProfile {
  name: string;
  weight: number; // in kg
  height: number; // in cm
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
  level: Level;
  experience: Experience;
  weeklyFrequency: number;
}

export interface AppState {
  profile: UserProfile;
  sessions: Session[];
  routines: Routine[];
  customExercises: Exercise[];
  onboardingComplete: boolean;
  healthMetrics: import('./health').DailyHealthMetric[];
  version: string;
}
