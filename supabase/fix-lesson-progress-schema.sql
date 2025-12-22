-- ============================================
-- FIX: Adicionar coluna 'completed' na tabela lesson_progress
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. Adicionar a coluna 'completed' se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'lesson_progress' 
        AND column_name = 'completed'
    ) THEN
        ALTER TABLE public.lesson_progress 
        ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Coluna "completed" adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna "completed" já existe.';
    END IF;
END $$;

-- 2. Verificar se a coluna foi criada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'lesson_progress'
ORDER BY ordinal_position;

-- 3. Atualizar registros existentes (se houver) para marcar como completos
-- se progress_percent >= 90
UPDATE public.lesson_progress
SET completed = true
WHERE progress_percent >= 90 AND completed = false;

-- 4. Verificar dados
SELECT 
    id,
    user_id,
    lesson_id,
    completed,
    progress_percent,
    last_watched_at
FROM public.lesson_progress
ORDER BY last_watched_at DESC
LIMIT 10;
