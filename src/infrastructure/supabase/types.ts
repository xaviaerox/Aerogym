// Supabase Database Types — Auto-generated shapes for type safety
// En producción esto se generaría con: npx supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, 'created_at'>;
        Update: Partial<Omit<Exercise, 'id' | 'created_at'>>;
      };
      routines: {
        Row: Routine;
        Insert: Omit<Routine, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Routine, 'id' | 'user_id' | 'created_at'>>;
      };
      routine_exercises: {
        Row: RoutineExercise;
        Insert: Omit<RoutineExercise, 'id'>;
        Update: Partial<Omit<RoutineExercise, 'id' | 'routine_id'>>;
      };
      workout_sessions: {
        Row: WorkoutSession;
        Insert: Omit<WorkoutSession, 'id' | 'created_at'>;
        Update: Partial<Omit<WorkoutSession, 'id' | 'user_id' | 'created_at'>>;
      };
      workout_sets: {
        Row: WorkoutSet;
        Insert: Omit<WorkoutSet, 'id' | 'logged_at'>;
        Update: Partial<Omit<WorkoutSet, 'id' | 'session_id' | 'logged_at'>>;
      };
      body_measurements: {
        Row: BodyMeasurement;
        Insert: Omit<BodyMeasurement, 'id' | 'created_at'>;
        Update: Partial<Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at'>>;
      };
      daily_health: {
        Row: DailyHealth;
        Insert: Omit<DailyHealth, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DailyHealth, 'id' | 'user_id' | 'created_at'>>;
      };
      goals: {
        Row: Goal;
        Insert: Omit<Goal, 'id' | 'created_at'>;
        Update: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'earned_at'>;
        Update: Partial<Achievement>;
      };
    };
  };
}

export interface Profile {
  id: string;
  name: string;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: 'hypertrophy' | 'strength' | 'fat_loss' | 'maintenance' | 'recomposition';
  level: 'beginner' | 'intermediate' | 'advanced';
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  experience: 'ppl' | 'upper_lower' | 'full_body' | 'weider' | 'custom';
  weekly_frequency: number;
  avatar_url: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  secondary_muscles: string[];
  type: 'compound' | 'isolation';
  equipment: string[];
  instructions: string | null;
  tips: string | null;
  common_mistakes: string | null;
  image_url: string | null;
  video_url: string | null;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_template: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  order_index: number;
  default_sets: number;
  default_reps: string;
  default_weight_kg: number;
  rest_seconds: number;
  notes: string | null;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  duration_minutes: number | null;
  total_volume_kg: number;
  notes: string | null;
  perceived_difficulty: number | null;
  created_at: string;
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number;
  rpe: number | null;
  rir: number | null;
  duration_seconds: number | null;
  distance_meters: number | null;
  is_completed: boolean;
  is_warmup: boolean;
  is_pr: boolean;
  e1rm_kg: number | null;
  logged_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_pct: number | null;
  waist_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  leg_cm: number | null;
  hip_cm: number | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface DailyHealth {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  sleep_hours: number | null;
  sleep_quality: number | null;
  water_ml: number;
  energy_level: number | null;
  stress_level: number | null;
  motivation_level: number | null;
  cardio_minutes: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  type: 'weight_loss' | 'weight_gain' | 'steps' | 'sleep' | 'strength' | 'volume' | 'custom';
  target_value: number | null;
  current_value: number;
  unit: string | null;
  target_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  earned_at: string;
  metadata: Record<string, unknown>;
}
