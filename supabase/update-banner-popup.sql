-- ============================================
-- ATUALIZAR CONFIGURAÇÃO DE BANNER
-- Execute no SQL Editor do Supabase
-- ============================================

-- Atualizar estrutura do banner para incluir modo popup
UPDATE public.settings
SET value = jsonb_set(
    value,
    '{show_as_popup}',
    'false'::jsonb
)
WHERE key = 'global_banner';

-- Verificar estrutura atualizada
SELECT key, value FROM public.settings WHERE key = 'global_banner';

-- Estrutura esperada:
-- {
--   "enabled": false,
--   "image_url": "",
--   "link_url": "",
--   "alt_text": "Banner de Oferta",
--   "show_as_popup": false
-- }
