-- ============================================
-- WEMEMBERS - SCHEMA SQL COMPLETO
-- Integrado com: users, products, offers
-- ============================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- NOTA: Tabela 'offers' já existe no banco
-- Não será criada novamente
-- ============================================

-- ============================================
-- TABELA: wemembers_products
-- Produtos específicos da área de membros
-- ============================================
CREATE TABLE IF NOT EXISTS public.wemembers_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referências às tabelas principais
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
    
    -- Campos do produto
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    sales_video_url TEXT,
    
    -- Controle de liberação por oferta
    -- NULL = liberado para todas as ofertas
    -- INTEGER = liberado apenas para essa oferta específica
    offer_id INTEGER REFERENCES public.offers(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wemembers_products_product_id ON public.wemembers_products(product_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_products_account_id ON public.wemembers_products(account_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_products_offer_id ON public.wemembers_products(offer_id);

-- ============================================
-- TABELA: wemembers_modules
-- Módulos dos cursos
-- ============================================
CREATE TABLE IF NOT EXISTS public.wemembers_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referências
    wemembers_product_id UUID NOT NULL REFERENCES public.wemembers_products(id) ON DELETE CASCADE,
    
    -- Campos do módulo
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    days_to_unlock INTEGER NOT NULL DEFAULT 0,
    
    -- Controle de liberação por oferta
    offer_id INTEGER REFERENCES public.offers(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wemembers_modules_product_id ON public.wemembers_modules(wemembers_product_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_modules_offer_id ON public.wemembers_modules(offer_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_modules_order ON public.wemembers_modules(order_index);

-- ============================================
-- TABELA: wemembers_lessons
-- Aulas dos módulos
-- ============================================
CREATE TABLE IF NOT EXISTS public.wemembers_lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referências
    wemembers_module_id UUID NOT NULL REFERENCES public.wemembers_modules(id) ON DELETE CASCADE,
    
    -- Campos da aula
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'pdf')),
    video_url TEXT,
    pdf_path TEXT,
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    banner_img_url TEXT,
    banner_link TEXT,
    
    -- Controle de liberação por oferta
    offer_id INTEGER REFERENCES public.offers(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wemembers_lessons_module_id ON public.wemembers_lessons(wemembers_module_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_lessons_offer_id ON public.wemembers_lessons(offer_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_lessons_order ON public.wemembers_lessons(order_index);

-- ============================================
-- TABELA: wemembers_enrollments
-- Matrículas de usuários em produtos
-- ============================================
CREATE TABLE IF NOT EXISTS public.wemembers_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referências
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wemembers_product_id UUID NOT NULL REFERENCES public.wemembers_products(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES public.offers(id) ON DELETE SET NULL,
    
    -- Controle de matrícula
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = vitalício
    
    -- Evitar matrículas duplicadas
    UNIQUE(user_id, wemembers_product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wemembers_enrollments_user_id ON public.wemembers_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_enrollments_product_id ON public.wemembers_enrollments(wemembers_product_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_enrollments_offer_id ON public.wemembers_enrollments(offer_id);

-- ============================================
-- TABELA: wemembers_lesson_progress
-- Progresso do usuário nas aulas
-- ============================================
CREATE TABLE IF NOT EXISTS public.wemembers_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referências
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wemembers_lesson_id UUID NOT NULL REFERENCES public.wemembers_lessons(id) ON DELETE CASCADE,
    
    -- Dados de progresso
    completed BOOLEAN NOT NULL DEFAULT false,
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Evitar duplicatas
    UNIQUE(user_id, wemembers_lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wemembers_progress_user_id ON public.wemembers_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_progress_lesson_id ON public.wemembers_lesson_progress(wemembers_lesson_id);

-- ============================================
-- TABELA: wemembers_purchases
-- Registro de compras (histórico)
-- ============================================
CREATE TABLE IF NOT EXISTS public.wemembers_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Referências
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    wemembers_product_id UUID NOT NULL REFERENCES public.wemembers_products(id) ON DELETE CASCADE,
    offer_id INTEGER REFERENCES public.offers(id) ON DELETE SET NULL,
    
    -- Dados da compra
    amount_paid_cents INTEGER NOT NULL,
    payment_method TEXT,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded', 'canceled')),
    payment_id TEXT, -- ID externo (do gateway de pagamento)
    
    -- Timestamps
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wemembers_purchases_user_id ON public.wemembers_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_purchases_product_id ON public.wemembers_purchases(wemembers_product_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_purchases_offer_id ON public.wemembers_purchases(offer_id);
CREATE INDEX IF NOT EXISTS idx_wemembers_purchases_payment_id ON public.wemembers_purchases(payment_id);

-- ============================================
-- TRIGGERS: Atualizar updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
-- NOTA: Trigger para 'offers' não criado pois a tabela já existe

CREATE TRIGGER update_wemembers_products_updated_at
    BEFORE UPDATE ON public.wemembers_products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wemembers_modules_updated_at
    BEFORE UPDATE ON public.wemembers_modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wemembers_lessons_updated_at
    BEFORE UPDATE ON public.wemembers_lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wemembers_lesson_progress_updated_at
    BEFORE UPDATE ON public.wemembers_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wemembers_purchases_updated_at
    BEFORE UPDATE ON public.wemembers_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION: Verificar acesso a conteúdo
-- ============================================
CREATE OR REPLACE FUNCTION wemembers_user_has_access(
    p_user_id UUID,
    p_lesson_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN := false;
    v_lesson_offer_id UUID;
    v_module_offer_id UUID;
    v_product_offer_id UUID;
    v_product_id UUID;
BEGIN
    -- Buscar offer_id da aula, módulo e produto
    SELECT 
        l.offer_id,
        m.offer_id,
        p.offer_id,
        p.id
    INTO 
        v_lesson_offer_id,
        v_module_offer_id,
        v_product_offer_id,
        v_product_id
    FROM public.wemembers_lessons l
    JOIN public.wemembers_modules m ON m.id = l.wemembers_module_id
    JOIN public.wemembers_products p ON p.id = m.wemembers_product_id
    WHERE l.id = p_lesson_id;
    
    -- Verificar se o usuário tem matrícula no produto
    SELECT EXISTS (
        SELECT 1 
        FROM public.wemembers_enrollments e
        WHERE e.user_id = p_user_id
        AND e.wemembers_product_id = v_product_id
        AND e.active = true
        AND (e.expires_at IS NULL OR e.expires_at > NOW())
        AND (
            -- Se a aula tem offer_id, verificar se a matrícula é dessa oferta
            (v_lesson_offer_id IS NOT NULL AND e.offer_id = v_lesson_offer_id)
            -- Se o módulo tem offer_id, verificar se a matrícula é dessa oferta
            OR (v_lesson_offer_id IS NULL AND v_module_offer_id IS NOT NULL AND e.offer_id = v_module_offer_id)
            -- Se o produto tem offer_id, verificar se a matrícula é dessa oferta
            OR (v_lesson_offer_id IS NULL AND v_module_offer_id IS NULL AND v_product_offer_id IS NOT NULL AND e.offer_id = v_product_offer_id)
            -- Se nenhum tem offer_id, qualquer matrícula no produto é válida
            OR (v_lesson_offer_id IS NULL AND v_module_offer_id IS NULL AND v_product_offer_id IS NULL)
        )
    ) INTO v_has_access;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEW: Resumo de progresso do usuário
-- ============================================
CREATE OR REPLACE VIEW wemembers_user_progress_summary AS
SELECT 
    e.user_id,
    e.wemembers_product_id,
    p.title AS product_title,
    COUNT(DISTINCT l.id) AS total_lessons,
    COUNT(DISTINCT lp.wemembers_lesson_id) FILTER (WHERE lp.completed = true) AS completed_lessons,
    ROUND(
        (COUNT(DISTINCT lp.wemembers_lesson_id) FILTER (WHERE lp.completed = true)::DECIMAL / 
        NULLIF(COUNT(DISTINCT l.id), 0) * 100), 
        2
    ) AS progress_percentage
FROM public.wemembers_enrollments e
JOIN public.wemembers_products p ON p.id = e.wemembers_product_id
JOIN public.wemembers_modules m ON m.wemembers_product_id = p.id
JOIN public.wemembers_lessons l ON l.wemembers_module_id = m.id
LEFT JOIN public.wemembers_lesson_progress lp 
    ON lp.wemembers_lesson_id = l.id 
    AND lp.user_id = e.user_id
WHERE e.active = true
GROUP BY e.user_id, e.wemembers_product_id, p.title;

-- ============================================
-- RLS: Desabilitar para desenvolvimento
-- ============================================
-- NOTA: RLS para 'offers' não alterado pois a tabela já existe
ALTER TABLE public.wemembers_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wemembers_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wemembers_lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wemembers_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wemembers_lesson_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wemembers_purchases DISABLE ROW LEVEL SECURITY;

-- ============================================
-- COMENTÁRIOS NAS TABELAS (Documentação)
-- ============================================
-- NOTA: Comentário para 'offers' não criado pois a tabela já existe
COMMENT ON TABLE public.wemembers_products IS 'Produtos da área de membros. Vinculados a products do projeto principal.';
COMMENT ON TABLE public.wemembers_modules IS 'Módulos de um produto. offer_id NULL = todos, UUID = apenas essa oferta.';
COMMENT ON TABLE public.wemembers_lessons IS 'Aulas de um módulo. offer_id NULL = todos, UUID = apenas essa oferta.';
COMMENT ON TABLE public.wemembers_enrollments IS 'Matrículas de usuários em produtos.';
COMMENT ON TABLE public.wemembers_lesson_progress IS 'Progresso individual nas aulas.';
COMMENT ON TABLE public.wemembers_purchases IS 'Histórico de compras realizadas.';

COMMENT ON COLUMN public.wemembers_products.offer_id IS 'NULL = liberado para todas as ofertas | UUID = liberado apenas para essa oferta';
COMMENT ON COLUMN public.wemembers_modules.offer_id IS 'NULL = liberado para todas as ofertas | UUID = liberado apenas para essa oferta';
COMMENT ON COLUMN public.wemembers_lessons.offer_id IS 'NULL = liberado para todas as ofertas | UUID = liberado apenas para essa oferta';
