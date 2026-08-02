-- ================================================================
-- AeroGym 3.0 — Additive Migration: Ultimate Enterprise (100/100)
-- ================================================================

-- 1. TELEMETRY AUDIT LOGS TABLE FOR PROD OBSERVABILITY
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  level TEXT CHECK (level IN ('info', 'warn', 'error', 'fatal')) NOT NULL DEFAULT 'info',
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_logs_level_date ON public.telemetry_logs(level, created_at DESC);

-- RLS FOR TELEMETRY
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'telemetry_insert_own') THEN
    CREATE POLICY "telemetry_insert_own" ON public.telemetry_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- 2. SECURE STORAGE SYSTEM PERSISTENCE STATUS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'is_storage_persisted'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_storage_persisted BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
