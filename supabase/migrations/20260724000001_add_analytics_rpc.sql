-- ================================================================
-- AeroGym 2.0 — Migration: Analytics RPC Functions
-- ================================================================

-- RPC Function to compute aggregated workout stats directly in Postgres
CREATE OR REPLACE FUNCTION get_user_workout_stats(p_user_id UUID)
RETURNS TABLE (
  total_sessions BIGINT,
  total_volume_kg NUMERIC,
  avg_duration_minutes NUMERIC,
  completed_sets_count BIGINT,
  prs_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT ws.id)::BIGINT AS total_sessions,
    COALESCE(SUM(ws.total_volume_kg), 0)::NUMERIC AS total_volume_kg,
    COALESCE(AVG(ws.duration_minutes), 0)::NUMERIC AS avg_duration_minutes,
    COUNT(st.id)::BIGINT AS completed_sets_count,
    COUNT(CASE WHEN st.is_pr = TRUE THEN 1 END)::BIGINT AS prs_count
  FROM public.workout_sessions ws
  LEFT JOIN public.workout_sets st ON st.session_id = ws.id
  WHERE ws.user_id = p_user_id;
END;
$$;
