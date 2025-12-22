-- ============================================
-- SOLUÇÃO RÁPIDA: Desabilitar RLS temporariamente
-- Execute no SQL Editor do Supabase
-- ============================================

-- Desabilitar RLS na tabela profiles (temporário para teste)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Depois que funcionar, você pode reabilitar com:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
