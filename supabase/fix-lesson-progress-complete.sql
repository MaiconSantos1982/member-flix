-- ============================================
-- FIX COMPLETO: Tabela lesson_progress
-- Adiciona TODAS as colunas necessárias
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'lesson_progress'
ORDER BY ordinal_position;

-- 2. Adicionar coluna 'completed' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'lesson_progress' 
        AND column_name = 'completed'
    ) THEN
        ALTER TABLE public.lesson_progress 
        ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE '✅ Coluna "completed" adicionada!';
    ELSE
        RAISE NOTICE '⚠️  Coluna "completed" já existe.';
    END IF;
END $$;

-- 3. Adicionar coluna 'progress_percent' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'lesson_progress' 
        AND column_name = 'progress_percent'
    ) THEN
        ALTER TABLE public.lesson_progress 
        ADD COLUMN progress_percent INTEGER NOT NULL DEFAULT 0 
        CHECK (progress_percent >= 0 AND progress_percent <= 100);
        RAISE NOTICE '✅ Coluna "progress_percent" adicionada!';
    ELSE
        RAISE NOTICE '⚠️  Coluna "progress_percent" já existe.';
    END IF;
END $$;

-- 4. Adicionar coluna 'last_watched_at' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'lesson_progress' 
        AND column_name = 'last_watched_at'
    ) THEN
        ALTER TABLE public.lesson_progress 
        ADD COLUMN last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Coluna "last_watched_at" adicionada!';
    ELSE
        RAISE NOTICE '⚠️  Coluna "last_watched_at" já existe.';
    END IF;
END $$;

-- 5. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'lesson_progress'
ORDER BY ordinal_position;

-- 6. Mostrar dados da tabela (se houver)
SELECT * FROM public.lesson_progress LIMIT 5;

-- ============================================
-- RESULTADO ESPERADO:
-- A tabela deve ter as seguintes colunas:
-- - id (uuid)
-- - user_id (uuid)
-- - lesson_id (uuid)
-- - completed (boolean)
-- - progress_percent (integer)
-- - last_watched_at (timestamp with time zone)
-- ============================================
