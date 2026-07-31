-- ================================================================
-- AeroGym 2.1 — Additive Migration: Enterprise Hardening & Performance
-- ================================================================

-- 1. FIX SECURITY DEFINER search_path ON RAG FUNCTION
CREATE OR REPLACE FUNCTION match_rag_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_user_id uuid
)
RETURNS TABLE (
  id uuid,
  content text,
  category text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_documents.id,
    rag_documents.content,
    rag_documents.category,
    1 - (rag_documents.embedding <=> query_embedding) AS similarity
  FROM public.rag_documents
  WHERE rag_documents.user_id = p_user_id
    AND 1 - (rag_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY rag_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. ADD PERFORMANCE INDEXES FOR PAGINATED HISTORIES
CREATE INDEX IF NOT EXISTS idx_workout_sets_logged_at ON public.workout_sets(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_order ON public.routine_exercises(routine_id, order_index);

-- 3. ADD SALT FIELD TO PROFILES FOR PBKDF2 DYNAMIC SALTS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'profiles' 
      AND column_name = 'crypto_salt'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN crypto_salt TEXT;
  END IF;
END $$;
