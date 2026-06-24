-- ================================================================
-- AeroGym 2.0 — Supabase Schema
-- Ejecutar en el SQL Editor de Supabase Dashboard
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- PROFILES (extiende auth.users de Supabase)
-- ================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Usuario',
  age INTEGER CHECK (age > 0 AND age < 120),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  height_cm DECIMAL(5,2) CHECK (height_cm > 0),
  weight_kg DECIMAL(5,2) CHECK (weight_kg > 0),
  goal TEXT CHECK (goal IN ('hypertrophy', 'strength', 'fat_loss', 'maintenance', 'recomposition')) DEFAULT 'hypertrophy',
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) DEFAULT 'moderate',
  experience TEXT CHECK (experience IN ('ppl', 'upper_lower', 'full_body', 'weider', 'custom')) DEFAULT 'full_body',
  weekly_frequency INTEGER DEFAULT 3 CHECK (weekly_frequency BETWEEN 1 AND 7),
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- EXERCISES (catálogo global + ejercicios custom del usuario)
-- ================================================================
CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY, -- Usamos slugs legibles (ej: 'bench-press') para compatibilidad con datos locales
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  secondary_muscles TEXT[] DEFAULT '{}',
  type TEXT CHECK (type IN ('compound', 'isolation')) NOT NULL,
  equipment TEXT[] DEFAULT '{}',
  instructions TEXT,
  tips TEXT,
  common_mistakes TEXT,
  image_url TEXT,
  video_url TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROUTINES
-- ================================================================
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROUTINE_EXERCISES (ejercicios dentro de una rutina)
-- ================================================================
CREATE TABLE IF NOT EXISTS routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT REFERENCES exercises(id) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  default_sets INTEGER DEFAULT 3,
  default_reps TEXT DEFAULT '8-12',
  default_weight_kg DECIMAL(6,2) DEFAULT 0,
  rest_seconds INTEGER DEFAULT 90,
  notes TEXT
);

-- ================================================================
-- WORKOUT_SESSIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES routines(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  total_volume_kg DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  perceived_difficulty INTEGER CHECK (perceived_difficulty BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- WORKOUT_SETS (el core del tracking de series)
-- ================================================================
CREATE TABLE IF NOT EXISTS workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT REFERENCES exercises(id) NOT NULL,
  set_number INTEGER NOT NULL DEFAULT 1,
  reps INTEGER CHECK (reps >= 0),
  weight_kg DECIMAL(6,2) DEFAULT 0,
  rpe DECIMAL(3,1) CHECK (rpe BETWEEN 0 AND 10),
  rir INTEGER CHECK (rir BETWEEN 0 AND 10),
  duration_seconds INTEGER,
  distance_meters DECIMAL(10,2),
  is_completed BOOLEAN DEFAULT FALSE,
  is_warmup BOOLEAN DEFAULT FALSE,
  is_pr BOOLEAN DEFAULT FALSE,
  e1rm_kg DECIMAL(6,2),
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- BODY_MEASUREMENTS (peso + medidas corporales)
-- ================================================================
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  measured_at DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg DECIMAL(5,2),
  body_fat_pct DECIMAL(4,1) CHECK (body_fat_pct BETWEEN 0 AND 100),
  waist_cm DECIMAL(5,1),
  chest_cm DECIMAL(5,1),
  arm_cm DECIMAL(5,1),
  leg_cm DECIMAL(5,1),
  hip_cm DECIMAL(5,1),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, measured_at)
);

-- ================================================================
-- DAILY_HEALTH (pasos, sueño, energía, agua, etc.)
-- ================================================================
CREATE TABLE IF NOT EXISTS daily_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  water_ml INTEGER DEFAULT 0,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
  motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
  cardio_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ================================================================
-- GOALS (objetivos del usuario)
-- ================================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('weight_loss', 'weight_gain', 'steps', 'sleep', 'strength', 'volume', 'custom')) NOT NULL,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2) DEFAULT 0,
  unit TEXT,
  target_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ACHIEVEMENTS (logros y gamificación)
-- ================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- ================================================================
-- ÍNDICES DE RENDIMIENTO
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON workout_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sets_session ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_daily_health_user_date ON daily_health(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_routines_user ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_custom ON exercises(created_by) WHERE is_custom = TRUE;

-- ================================================================
-- ROW LEVEL SECURITY (RLS) — Cada usuario solo ve sus datos
-- ================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: solo el propio usuario
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Exercises: ver globales + los propios. Solo modificar los propios.
CREATE POLICY "exercises_read" ON exercises FOR SELECT USING (is_custom = FALSE OR auth.uid() = created_by);
CREATE POLICY "exercises_write" ON exercises FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = TRUE);
CREATE POLICY "exercises_update" ON exercises FOR UPDATE USING (auth.uid() = created_by AND is_custom = TRUE);
CREATE POLICY "exercises_delete" ON exercises FOR DELETE USING (auth.uid() = created_by AND is_custom = TRUE);

-- Routines: solo el propio usuario
CREATE POLICY "routines_own" ON routines FOR ALL USING (auth.uid() = user_id);

-- Routine exercises: a través de la rutina del usuario
CREATE POLICY "routine_exercises_own" ON routine_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM routines WHERE routines.id = routine_exercises.routine_id AND routines.user_id = auth.uid())
);

-- Workout sessions: solo el propio usuario
CREATE POLICY "sessions_own" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- Workout sets: a través de la sesión del usuario
CREATE POLICY "sets_own" ON workout_sets FOR ALL USING (
  EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_sets.session_id AND workout_sessions.user_id = auth.uid())
);

-- Resto de tablas: solo el propio usuario
CREATE POLICY "measurements_own" ON body_measurements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "health_own" ON daily_health FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "goals_own" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "achievements_own" ON achievements FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- TRIGGER: Auto-crear perfil al registrarse
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuario'));
  EXCEPTION WHEN OTHERS THEN
    -- Omitir fallos para asegurar el flujo de registro
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- CATÁLOGO BASE DE EJERCICIOS (migrado desde exercises.ts)
-- ================================================================
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, type) VALUES
-- PECHO
('bench-press', 'Press de Banca', 'Pecho', ARRAY['Tríceps', 'Hombros'], 'compound'),
('incline-bb-press', 'Press Inclinado con Barra', 'Pecho', ARRAY['Hombros', 'Tríceps'], 'compound'),
('incline-db-press', 'Press Superior con Mancuernas', 'Pecho', ARRAY['Hombros'], 'compound'),
('chest-machine-press', 'Máquina de Pecho', 'Pecho', ARRAY['Tríceps'], 'compound'),
('pec-dec', 'Pec Deck / Aperturas', 'Pecho', ARRAY[]::TEXT[], 'isolation'),
('dips', 'Fondos en Paralelas', 'Pecho', ARRAY['Tríceps', 'Hombros'], 'compound'),
('cable-flyes', 'Cruces en Polea', 'Pecho', ARRAY[]::TEXT[], 'isolation'),
-- ESPALDA
('lat-pulldown', 'Jalón al Pecho', 'Espalda', ARRAY['Bíceps'], 'compound'),
('hammer-row', 'Remo Hammer', 'Espalda', ARRAY['Bíceps'], 'compound'),
('chest-supported-row', 'Remo Soporte Pecho', 'Espalda', ARRAY['Bíceps'], 'compound'),
('seated-row', 'Remo en Polea Baja', 'Espalda', ARRAY['Bíceps'], 'compound'),
('db-rows', 'Remo con Mancuerna', 'Espalda', ARRAY['Bíceps'], 'compound'),
('pullups', 'Dominadas', 'Espalda', ARRAY['Bíceps'], 'compound'),
('deadlift', 'Peso Muerto Convencional', 'Espalda', ARRAY['Isquios', 'Glúteos', 'Core'], 'compound'),
('cable-pullover', 'Pullover en Polea', 'Espalda', ARRAY[]::TEXT[], 'isolation'),
-- PIERNAS
('squats', 'Sentadilla con Barra', 'Cuádriceps', ARRAY['Glúteos', 'Isquios'], 'compound'),
('leg-press-45', 'Prensa 45º', 'Cuádriceps', ARRAY['Glúteos'], 'compound'),
('leg-press-light', 'Prensa Ligera', 'Cuádriceps', ARRAY[]::TEXT[], 'compound'),
('leg-extensions', 'Extensiones de Cuádriceps', 'Cuádriceps', ARRAY[]::TEXT[], 'isolation'),
('romanian-deadlift', 'Peso Muerto Rumano', 'Isquios', ARRAY['Glúteos', 'Espalda Baja'], 'compound'),
('leg-curls', 'Curl Femoral', 'Isquios', ARRAY[]::TEXT[], 'isolation'),
('lunges', 'Zancadas', 'Cuádriceps', ARRAY['Glúteos', 'Isquios'], 'compound'),
('bulgarian-split-squat', 'Sentadilla Búlgara', 'Cuádriceps', ARRAY['Glúteos'], 'compound'),
('calf-raises-standing', 'Elevación de Talones de Pie', 'Gemelos', ARRAY[]::TEXT[], 'isolation'),
('calf-raises-seated', 'Elevación de Talones Sentado', 'Gemelos', ARRAY[]::TEXT[], 'isolation'),
('hip-thrust', 'Hip Thrust', 'Glúteos', ARRAY['Isquios'], 'compound'),
-- HOMBROS
('db-overhead-press', 'Press Militar con Mancuernas', 'Hombros', ARRAY['Tríceps'], 'compound'),
('bb-overhead-press', 'Press Militar con Barra', 'Hombros', ARRAY['Tríceps'], 'compound'),
('lateral-raises', 'Elevaciones Laterales', 'Hombros', ARRAY[]::TEXT[], 'isolation'),
('reverse-flys', 'Reverse Fly / Pájaros', 'Hombros', ARRAY[]::TEXT[], 'isolation'),
('face-pulls', 'Face Pulls', 'Hombros', ARRAY['Tríceps'], 'isolation'),
('arnold-press', 'Press Arnold', 'Hombros', ARRAY['Tríceps'], 'compound'),
-- BRAZOS
('tricep-extensions', 'Extensión de Tríceps en Polea', 'Tríceps', ARRAY[]::TEXT[], 'isolation'),
('tricep-overhead', 'Extensión Tríceps sobre Cabeza', 'Tríceps', ARRAY[]::TEXT[], 'isolation'),
('skull-crushers', 'Rompe Cráneos', 'Tríceps', ARRAY[]::TEXT[], 'isolation'),
('assisted-dips', 'Fondos Asistidos', 'Tríceps', ARRAY['Pecho'], 'compound'),
('bb-curls', 'Curl de Bíceps con Barra', 'Bíceps', ARRAY[]::TEXT[], 'isolation'),
('hammer-curls', 'Curl Martillo', 'Bíceps', ARRAY['Antebrazos'], 'isolation'),
('db-alt-curls', 'Curl Mancuernas Alterno', 'Bíceps', ARRAY[]::TEXT[], 'isolation'),
('concentration-curls', 'Curl Concentrado', 'Bíceps', ARRAY[]::TEXT[], 'isolation'),
('cable-curls', 'Curl en Polea', 'Bíceps', ARRAY[]::TEXT[], 'isolation'),
-- CORE
('plank', 'Plancha Abdominal', 'Abdominales', ARRAY['Core'], 'isolation'),
('hanging-leg-raises', 'Elevaciones de Piernas Colgado', 'Abdominales', ARRAY['Core'], 'isolation'),
('cable-crunch', 'Crunch en Polea', 'Abdominales', ARRAY[]::TEXT[], 'isolation'),
('russian-twist', 'Rotación Rusa', 'Abdominales', ARRAY['Core'], 'isolation'),
-- CARDIO
('treadmill', 'Cinta de Correr', 'Cardio', ARRAY[]::TEXT[], 'compound'),
('cycling', 'Bicicleta Estática', 'Cardio', ARRAY[]::TEXT[], 'compound'),
('rowing-machine', 'Máquina de Remo', 'Cardio', ARRAY['Espalda', 'Bíceps'], 'compound')
ON CONFLICT (id) DO NOTHING;
