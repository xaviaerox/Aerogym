-- ================================================================
-- AeroGym 2.0 — Performance Database Migration
-- Index optimization for workout_sets, workout_sessions, and daily_health
-- ================================================================

-- Composite index for fast set lookup by session and exercise
CREATE INDEX IF NOT EXISTS idx_workout_sets_session_exercise 
ON workout_sets (session_id, exercise_id);

-- Index for workout history user filtering and ordering
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_started 
ON workout_sessions (user_id, started_at DESC);

-- Index for daily health range queries by user and date
CREATE INDEX IF NOT EXISTS idx_daily_health_user_date 
ON daily_health (user_id, date DESC);

-- Index for body measurements by user and date
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date 
ON body_measurements (user_id, measured_at DESC);
