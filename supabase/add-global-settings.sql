-- ============================================
-- ADICIONAR TABELA DE CONFIGURAÇÕES GLOBAIS
-- Execute no SQL Editor do Supabase
-- ============================================

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração de banner global
INSERT INTO public.settings (key, value)
VALUES (
    'global_banner',
    '{
        "enabled": false,
        "image_url": "",
        "link_url": "",
        "alt_text": "Banner de Oferta"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- Trigger para updated_at
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
