-- Migration: 20260905000000_habits_system.sql
-- Sistema de Hábitos y Checklist Diario Personalizable

-- 1. Tabla de Hábitos definidos por cada usuario
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'custom',
    icon TEXT NOT NULL DEFAULT 'CheckCircle2',
    color TEXT NOT NULL DEFAULT '#3b82f6',
    frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekdays', 'weekends', 'custom_days'
    target_days INTEGER[] DEFAULT '{1,2,3,4,5,6,0}', -- 0=Dom, 1=Lun, ..., 6=Sáb
    order_index INTEGER NOT NULL DEFAULT 0,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Registros / Checks diarios de cada hábito
CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT habit_logs_unique_habit_date UNIQUE (habit_id, date)
);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad RLS
CREATE POLICY "Users can manage their own habits"
    ON habits FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own habit logs"
    ON habit_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_habits_user_order ON habits(user_id, order_index) WHERE is_archived = false;
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id);
