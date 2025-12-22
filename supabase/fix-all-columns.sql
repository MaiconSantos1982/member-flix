-- ============================================
-- SCRIPT COMPLETO - ADICIONAR TODAS AS COLUNAS
-- Execute TUDO de uma vez no SQL Editor
-- ============================================

-- TABELA: modules - adicionar colunas
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- TABELA: lessons - adicionar TODAS as colunas
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS banner_img_url TEXT;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS banner_link TEXT;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Verificar se deu certo
SELECT 'modules columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'modules' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'lessons columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'lessons' AND table_schema = 'public'
ORDER BY ordinal_position;
