-- ============================================
-- SOLUÇÃO RÁPIDA: Recriar tabela lesson_progress
-- com TODAS as colunas necessárias
-- ============================================

-- OPÇÃO 1: Se você não tem dados importantes, DELETE e RECRIE a tabela
-- (ATENÇÃO: Isso vai apagar todos os dados de progresso!)

DROP TABLE IF EXISTS public.lesson_progress CASCADE;

CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Criar índices
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);

-- Habilitar RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own progress" ON public.lesson_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.lesson_progress
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all progress" ON public.lesson_progress
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'lesson_progress'
ORDER BY ordinal_position;
