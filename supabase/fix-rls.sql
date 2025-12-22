-- ============================================
-- CORREÇÃO DE RLS - Execute no SQL Editor do Supabase
-- ============================================

-- Remover a policy problemática que causa recursão
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar policy simples: cada usuário pode ver seu próprio perfil
-- (já existe, mas vamos garantir)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Garantir que usuários podem criar seu próprio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Garantir que usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Para ADMIN ver TODOS os perfis, usar uma abordagem diferente (sem recursão)
-- Vamos usar o JWT claims ao invés de consultar a tabela
-- Por enquanto, admin verá apenas atravás do service_role key no backend

-- Verificar que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
