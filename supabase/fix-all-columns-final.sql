-- ============================================
-- SQL DEFINITIVO - TODAS AS COLUNAS
-- Execute TUDO de uma vez
-- ============================================

-- LESSONS: Adicionar TODAS as colunas que podem estar faltando
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('video', 'pdf'));

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS pdf_path TEXT;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS banner_img_url TEXT;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS banner_link TEXT;

-- MODULES: Adicionar coluna que pode estar faltando
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- PRODUCTS: Adicionar colunas que podem estar faltando
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sales_video_url TEXT;

-- Renomear pdf_file_path para pdf_path (se existir)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        AND column_name = 'pdf_file_path'
    ) THEN
        ALTER TABLE public.lessons RENAME COLUMN pdf_file_path TO pdf_path;
    END IF;
END $$;

-- Verificar estrutura final
SELECT 'LESSONS COLUMNS:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lessons' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'MODULES COLUMNS:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'modules' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'PRODUCTS COLUMNS:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND table_schema = 'public'
ORDER BY ordinal_position;
