-- ============================================
-- ADICIONAR COLUNAS FALTANTES
-- Execute no SQL Editor do Supabase
-- ============================================

-- Adicionar order_index nas tabelas modules e lessons
ALTER TABLE public.modules 
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS order_index INTEGER NOT NULL DEFAULT 0;

-- Adicionar outras colunas que podem estar faltando
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS banner_img_url TEXT,
ADD COLUMN IF NOT EXISTS banner_link TEXT;

-- Verificar estrutura da tabela modules
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'modules' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar estrutura da tabela lessons
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'lessons' 
AND table_schema = 'public'
ORDER BY ordinal_position;
