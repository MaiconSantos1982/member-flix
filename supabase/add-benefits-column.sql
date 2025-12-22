-- ============================================
-- ADICIONAR CAMPO DE BENEFÍCIOS NO PRODUTO
-- Execute no SQL Editor do Supabase
-- ============================================

-- Adicionar coluna para benefícios (JSON array)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS benefits JSONB DEFAULT '[]'::jsonb;

-- Exemplo de como seria o JSON:
-- [
--   "Acesso vitalício ao conteúdo",
--   "Atualizações gratuitas",
--   "Suporte da comunidade",
--   "Certificado de conclusão",
--   "Material complementar em PDF"
-- ]

-- Atualizar produtos existentes com benefícios padrão
UPDATE public.products
SET benefits = '[
  "Acesso vitalício ao conteúdo",
  "Atualizações gratuitas",
  "Suporte da comunidade",
  "Certificado de conclusão"
]'::jsonb
WHERE benefits = '[]'::jsonb OR benefits IS NULL;
