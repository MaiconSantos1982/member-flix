-- ============================================
-- MEMBERFLIX - SCHEMA SQL PARA SUPABASE
-- Área de Membros estilo Netflix
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- IMPORTANTE: STORAGE BUCKETS
-- Crie os seguintes buckets MANUALMENTE no Supabase Dashboard:
-- 1. Storage → New Bucket → "public_assets" (Public: ON)
--    Para: capas de cursos, banners (acesso público)
-- 2. Storage → New Bucket → "secure_content" (Public: OFF)
--    Para: PDFs protegidos (acesso via RLS)
-- ============================================

-- ============================================
-- TABELA: profiles (Perfis de Usuário)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
    cpf TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: products (Produtos/Cursos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    sales_video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: modules (Módulos dos Cursos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    days_to_unlock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_modules_product_id ON public.modules(product_id);

-- ============================================
-- TABELA: lessons (Aulas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('video', 'pdf')),
    video_url TEXT,
    pdf_path TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    banner_img_url TEXT,
    banner_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_id ON public.lessons(module_id);

-- ============================================
-- TABELA: enrollments (Matrículas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT true,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_product_id ON public.enrollments(product_id);

-- ============================================
-- TABELA: lesson_progress (Progresso das Aulas)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- PROFILES: Usuários podem ver e editar apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin pode ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- PRODUCTS: Todos podem ver produtos publicados
CREATE POLICY "Anyone can view published products" ON public.products
    FOR SELECT USING (is_published = true);

-- Admin pode fazer tudo com produtos
CREATE POLICY "Admins can manage products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- MODULES: Usuários matriculados podem ver módulos
CREATE POLICY "Enrolled users can view modules" ON public.modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE user_id = auth.uid() 
            AND product_id = modules.product_id 
            AND active = true
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin pode gerenciar módulos
CREATE POLICY "Admins can manage modules" ON public.modules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- LESSONS: Usuários matriculados podem ver aulas
CREATE POLICY "Enrolled users can view lessons" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.modules m ON m.product_id = e.product_id
            WHERE e.user_id = auth.uid() 
            AND m.id = lessons.module_id 
            AND e.active = true
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admin pode gerenciar aulas
CREATE POLICY "Admins can manage lessons" ON public.lessons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ENROLLMENTS: Usuários podem ver suas próprias matrículas
CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT USING (user_id = auth.uid());

-- Admin pode gerenciar matrículas
CREATE POLICY "Admins can manage enrollments" ON public.enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- LESSON_PROGRESS: Usuários podem ver e editar seu próprio progresso
CREATE POLICY "Users can view own progress" ON public.lesson_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.lesson_progress
    FOR UPDATE USING (user_id = auth.uid());

-- Admin pode ver todo o progresso
CREATE POLICY "Admins can view all progress" ON public.lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- FUNÇÃO: Criar perfil automaticamente após signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil após signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DADOS DE EXEMPLO (3 produtos para teste)
-- ============================================

-- Produto 1: Curso Liberado para Demo
INSERT INTO public.products (id, title, description, cover_image, price, is_published, sales_video_url)
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'Masterclass de Marketing Digital',
    'Domine as principais estratégias de marketing digital e alavanque seus resultados. Aprenda com especialistas do mercado sobre SEO, Ads, Redes Sociais e muito mais.',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    497.00,
    true,
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
);

-- Módulos do Produto 1
INSERT INTO public.modules (id, product_id, title, description, order_index, days_to_unlock)
VALUES 
    ('m1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Fundamentos do Marketing Digital', 'Introdução aos conceitos básicos', 1, 0),
    ('m1111111-1111-1111-1111-222222222222', 'a1111111-1111-1111-1111-111111111111', 'SEO e Otimização', 'Aprenda a ranquear no Google', 2, 7),
    ('m1111111-1111-1111-1111-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Tráfego Pago', 'Facebook Ads e Google Ads', 3, 14);

-- Aulas do Módulo 1
INSERT INTO public.lessons (module_id, title, description, type, video_url, duration_seconds, order_index, banner_img_url, banner_link)
VALUES 
    ('m1111111-1111-1111-1111-111111111111', 'Boas-vindas ao Curso', 'Apresentação do curso e do instrutor', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 600, 1, 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=200&fit=crop', 'https://exemplo.com/mentoria'),
    ('m1111111-1111-1111-1111-111111111111', 'O que é Marketing Digital?', 'Conceitos fundamentais explicados', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 900, 2, NULL, NULL),
    ('m1111111-1111-1111-1111-111111111111', 'Material de Apoio', 'PDF com resumo do módulo', 'pdf', NULL, NULL, 3, NULL, NULL);

-- Aulas do Módulo 2
INSERT INTO public.lessons (module_id, title, description, type, video_url, duration_seconds, order_index)
VALUES 
    ('m1111111-1111-1111-1111-222222222222', 'Introdução ao SEO', 'O que é e como funciona', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1200, 1),
    ('m1111111-1111-1111-1111-222222222222', 'Pesquisa de Palavras-chave', 'Ferramentas e técnicas', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1500, 2);

-- Produto 2: Curso Bloqueado (Premium)
INSERT INTO public.products (id, title, description, cover_image, price, is_published)
VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'Formação Completa em Data Science',
    'Torne-se um cientista de dados completo. Python, Machine Learning, Deep Learning, SQL e muito mais em um único programa.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    1997.00,
    true
);

-- Módulos do Produto 2
INSERT INTO public.modules (id, product_id, title, description, order_index, days_to_unlock)
VALUES 
    ('m2222222-2222-2222-2222-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Python para Data Science', 'Fundamentos da linguagem', 1, 0),
    ('m2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Machine Learning', 'Algoritmos e modelos', 2, 0);

-- Aulas do Produto 2
INSERT INTO public.lessons (module_id, title, type, video_url, duration_seconds, order_index)
VALUES 
    ('m2222222-2222-2222-2222-111111111111', 'Instalando Python', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 800, 1),
    ('m2222222-2222-2222-2222-111111111111', 'Variáveis e Tipos', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1100, 2),
    ('m2222222-2222-2222-2222-222222222222', 'Introdução ao ML', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1400, 1);

-- Produto 3: Curso Bloqueado (Novo)
INSERT INTO public.products (id, title, description, cover_image, price, is_published)
VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'Desenvolvimento Web Full Stack',
    'Do zero ao deploy. HTML, CSS, JavaScript, React, Node.js, banco de dados e DevOps em um curso completo.',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    997.00,
    true
);

-- Módulos do Produto 3
INSERT INTO public.modules (id, product_id, title, description, order_index, days_to_unlock)
VALUES 
    ('m3333333-3333-3333-3333-111111111111', 'a3333333-3333-3333-3333-333333333333', 'HTML e CSS', 'Base do desenvolvimento web', 1, 0),
    ('m3333333-3333-3333-3333-222222222222', 'a3333333-3333-3333-3333-333333333333', 'JavaScript Moderno', 'ES6+ e mais', 2, 0);

-- Aulas do Produto 3
INSERT INTO public.lessons (module_id, title, type, video_url, duration_seconds, order_index)
VALUES 
    ('m3333333-3333-3333-3333-111111111111', 'Estrutura HTML', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 700, 1),
    ('m3333333-3333-3333-3333-111111111111', 'CSS Flexbox', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 950, 2),
    ('m3333333-3333-3333-3333-222222222222', 'Variáveis e Funções', 'video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 1300, 1);

-- ============================================
-- CRIAR USUÁRIO DEMO E MATRÍCULA
-- ============================================

-- Nota: O usuário demo precisa ser criado via Supabase Auth primeiro
-- Execute isso após criar o usuário demo@memberflix.com com senha demo123

-- Após criar o usuário via auth, execute:
-- INSERT INTO public.enrollments (user_id, product_id, active)
-- SELECT p.id, 'a1111111-1111-1111-1111-111111111111', true
-- FROM public.profiles p WHERE p.email = 'demo@memberflix.com';
