-- ================================================================
-- AeroGym 2.0 — Migration: pgvector & RAG Document Store
-- ================================================================

-- Enable the pgvector extension for semantic RAG memory
CREATE EXTENSION IF NOT EXISTS vector;

-- RAG DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.rag_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('workout_summary', 'health_note', 'injury_report', 'user_preference', 'coach_tip')) DEFAULT 'workout_summary',
  embedding vector(1536), -- Vector size matching OpenAI/Groq embedding models
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX FOR FAST COSINE SIMILARITY SEARCH
CREATE INDEX IF NOT EXISTS idx_rag_documents_user ON public.rag_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_rag_documents_embedding ON public.rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ROW LEVEL SECURITY
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'rag_documents_own') THEN
    CREATE POLICY "rag_documents_own" ON public.rag_documents FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- RPC FUNCTION TO MATCH RAG MEMORIES
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
