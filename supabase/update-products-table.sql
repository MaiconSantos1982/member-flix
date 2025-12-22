-- ============================================
-- ATUALIZAR TABELA PRODUCTS
-- Execute no SQL Editor do Supabase
-- ============================================

-- Adicionar colunas que podem estar faltando
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sales_video_url TEXT;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
