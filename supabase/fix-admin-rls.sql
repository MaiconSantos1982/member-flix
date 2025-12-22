-- ============================================
-- CORRIGIR RLS PARA ADMIN
-- Execute no SQL Editor do Supabase
-- ============================================

-- OPÇÃO 1: Desabilitar RLS temporariamente (mais fácil para desenvolvimento)
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Manter RLS mas criar policies para admin (mais seguro)
-- Descomente as linhas abaixo se preferir usar RLS:

/*
-- Remover policies antigas que podem estar causando problemas
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Admins can manage lessons" ON public.lessons;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.enrollments;

-- Criar policies simples: admin pode fazer tudo
-- Usando uma função auxiliar para verificar se é admin

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Products: Admin pode fazer tudo
CREATE POLICY "Admin full access to products" ON public.products
    FOR ALL USING (public.is_admin());

-- Modules: Admin pode fazer tudo
CREATE POLICY "Admin full access to modules" ON public.modules
    FOR ALL USING (public.is_admin());

-- Lessons: Admin pode fazer tudo
CREATE POLICY "Admin full access to lessons" ON public.lessons
    FOR ALL USING (public.is_admin());

-- Enrollments: Admin pode fazer tudo
CREATE POLICY "Admin full access to enrollments" ON public.enrollments
    FOR ALL USING (public.is_admin());
*/
