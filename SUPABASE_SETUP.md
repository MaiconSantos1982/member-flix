# 🚀 Guia Completo de Setup do Supabase - MemberFlix

Este guia contém **todos os passos necessários** para configurar o Supabase do zero para o projeto MemberFlix.

---

## 📋 Índice

1. [Criar Projeto no Supabase](#1-criar-projeto-no-supabase)
2. [Executar Schema SQL](#2-executar-schema-sql)
3. [Adicionar Colunas Faltantes](#3-adicionar-colunas-faltantes)
4. [Configurar RLS (Row Level Security)](#4-configurar-rls)
5. [Criar Buckets de Storage](#5-criar-buckets-de-storage)
6. [Criar Usuário Admin](#6-criar-usuário-admin)
7. [Configurar Variáveis de Ambiente](#7-configurar-variáveis-de-ambiente)
8. [Testar a Aplicação](#8-testar-a-aplicação)

---

## 1. Criar Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `MemberFlix` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte e **salve em local seguro**
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde ~2 minutos até o projeto estar pronto

---

## 2. Executar Schema SQL

### 2.1. Abrir SQL Editor

1. No menu lateral, clique em **SQL Editor** (ícone `</>`)
2. Clique em **"New query"**

### 2.2. Executar o Schema Principal

Cole o conteúdo do arquivo `supabase/schema.sql` e clique em **RUN** (ou Ctrl+Enter).

**OU** execute este SQL completo:

```sql
-- ============================================
-- MEMBERFLIX - SCHEMA SQL COMPLETO
-- ============================================

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: profiles
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
-- TABELA: products
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
-- TABELA: modules
-- ============================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    days_to_unlock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON public.modules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: lessons
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('video', 'pdf')),
    video_url TEXT,
    pdf_path TEXT,
    duration_seconds INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    banner_img_url TEXT,
    banner_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA: enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE(user_id, product_id)
);

-- ============================================
-- TABELA: lesson_progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    last_position_seconds INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON public.lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER: Criar perfil automaticamente
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

✅ **Aguarde a mensagem "Success. No rows returned"**

---

## 3. Adicionar Colunas Faltantes

Se você já tinha criado as tabelas antes, execute este SQL para garantir que todas as colunas existem:

```sql
-- Adicionar colunas que podem estar faltando
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cover_image TEXT;

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sales_video_url TEXT;

-- Verificar colunas da tabela products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

---

## 4. Configurar RLS (Row Level Security)

### Opção A: Desabilitar RLS (Recomendado para Desenvolvimento)

```sql
-- Desabilitar RLS em todas as tabelas (mais fácil para desenvolvimento)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
```

### Opção B: Habilitar RLS com Policies (Recomendado para Produção)

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Criar função auxiliar para verificar admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES: Usuários veem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- PRODUCTS: Todos veem publicados, admin gerencia tudo
CREATE POLICY "Anyone can view published products" ON public.products
    FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Admin can manage products" ON public.products
    FOR ALL USING (public.is_admin());

-- MODULES: Todos veem de produtos matriculados, admin gerencia
CREATE POLICY "Users can view enrolled modules" ON public.modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.product_id = modules.product_id
            AND enrollments.user_id = auth.uid()
            AND enrollments.active = true
        ) OR public.is_admin()
    );

CREATE POLICY "Admin can manage modules" ON public.modules
    FOR ALL USING (public.is_admin());

-- LESSONS: Mesma lógica dos módulos
CREATE POLICY "Users can view enrolled lessons" ON public.lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.modules
            JOIN public.enrollments ON enrollments.product_id = modules.product_id
            WHERE modules.id = lessons.module_id
            AND enrollments.user_id = auth.uid()
            AND enrollments.active = true
        ) OR public.is_admin()
    );

CREATE POLICY "Admin can manage lessons" ON public.lessons
    FOR ALL USING (public.is_admin());

-- ENROLLMENTS: Usuários veem suas próprias matrículas
CREATE POLICY "Users can view own enrollments" ON public.enrollments
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admin can manage enrollments" ON public.enrollments
    FOR ALL USING (public.is_admin());

-- LESSON_PROGRESS: Usuários gerenciam seu próprio progresso
CREATE POLICY "Users can manage own progress" ON public.lesson_progress
    FOR ALL USING (auth.uid() = user_id OR public.is_admin());
```

---

## 5. Criar Buckets de Storage

### 5.1. Bucket Público (para capas e banners)

1. No menu lateral, clique em **Storage**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name**: `public_assets`
   - **Public bucket**: ✅ **ATIVADO** (toggle ON)
4. Clique em **"Create bucket"**

### 5.2. Bucket Privado (para PDFs protegidos)

1. Clique em **"New bucket"** novamente
2. Preencha:
   - **Name**: `secure_content`
   - **Public bucket**: ❌ **DESATIVADO** (toggle OFF)
3. Clique em **"Create bucket"**

### 5.3. Configurar Policies de Storage

Execute no **SQL Editor**:

```sql
-- Policy para public_assets: qualquer um autenticado pode fazer upload
CREATE POLICY "Authenticated users can upload to public_assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public_assets');

CREATE POLICY "Anyone can view public_assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public_assets');

-- Policy para secure_content: apenas admin pode fazer upload
CREATE POLICY "Admin can upload to secure_content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'secure_content' 
    AND public.is_admin()
);

-- Usuários matriculados podem baixar PDFs
CREATE POLICY "Enrolled users can download secure_content"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'secure_content'
    AND (
        public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.lesson_progress
            WHERE lesson_progress.user_id = auth.uid()
        )
    )
);
```

---

## 6. Criar Usuário Admin

### 6.1. Criar Usuário via Dashboard

1. No menu lateral, clique em **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   - **Email**: `admin@memberflix.com` (ou seu email)
   - **Password**: Crie uma senha forte
   - **Auto Confirm User**: ✅ **ATIVADO**
4. Clique em **"Create user"**

### 6.2. Promover para Admin

Execute no **SQL Editor** (substitua o email):

```sql
-- Promover usuário para admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@memberflix.com';

-- Verificar
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'admin@memberflix.com';
```

✅ **Deve retornar o usuário com `role = 'admin'`**

---

## 7. Configurar Variáveis de Ambiente

### 7.1. Obter Credenciais do Supabase

1. No menu lateral, clique em **Settings** (engrenagem) → **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (chave longa)

### 7.2. Atualizar `.env.local`

No arquivo `.env.local` do projeto, cole:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI
```

### 7.3. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 8. Testar a Aplicação

### 8.1. Fazer Login

1. Acesse `http://localhost:3000/login`
2. Entre com as credenciais do admin criado
3. Deve redirecionar para a Home

### 8.2. Acessar Painel Admin

1. Acesse `http://localhost:3000/admin`
2. Deve carregar o dashboard com métricas
3. Se aparecer "Acesso Restrito", verifique se o role está como 'admin'

### 8.3. Criar um Produto

1. Vá em **Gerenciar Produtos**
2. Clique em **"Novo Produto"**
3. Preencha:
   - **Título**: `Curso de Teste`
   - **Descrição**: `Descrição do curso`
   - **Preço**: `197.00`
   - **Publicar**: ✅ Ativado
4. Clique em **"Criar Produto"**

✅ **Deve aparecer a mensagem "Produto criado!"**

### 8.4. Testar Upload de Capa

1. Edite o produto criado
2. Clique em **"Escolher arquivo"** na seção de Capa
3. Selecione uma imagem
4. Aguarde o upload (barra de progresso)
5. Clique em **"Salvar Alterações"**

✅ **A capa deve aparecer na listagem**

---

## 🎯 Checklist Final

Marque conforme for completando:

- [ ] Projeto Supabase criado
- [ ] Schema SQL executado (tabelas criadas)
- [ ] Colunas adicionais verificadas
- [ ] RLS configurado (desabilitado ou com policies)
- [ ] Bucket `public_assets` criado (público)
- [ ] Bucket `secure_content` criado (privado)
- [ ] Policies de storage configuradas
- [ ] Usuário admin criado
- [ ] Role do usuário setada como 'admin'
- [ ] `.env.local` configurado
- [ ] Servidor reiniciado
- [ ] Login funcionando
- [ ] Painel admin acessível
- [ ] Criação de produto funcionando
- [ ] Upload de capa funcionando

---

## 🆘 Troubleshooting

### Problema: "Auth still loading..."

**Solução:**
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Problema: "new row violates row-level security policy"

**Solução:**
```sql
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;
```

### Problema: "Could not find column 'cover_image'"

**Solução:**
```sql
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cover_image TEXT;
```

### Problema: Upload falha com erro 404

**Solução:** Verifique se os buckets foram criados corretamente em **Storage**.

### Problema: Timeout ao fazer login

**Solução:** Verifique se o projeto Supabase está ativo (não pausado) em [app.supabase.com](https://app.supabase.com).

---

## 📚 Próximos Passos

Depois que tudo estiver funcionando:

1. **Criar módulos e aulas** no Course Builder
2. **Testar upload de PDFs** (bucket privado)
3. **Criar matrículas de teste** na página de Alunos
4. **Testar a área do aluno** (vitrine, player, progresso)
5. **Configurar email** no Supabase (Authentication → Email Templates)
6. **Deploy** (Vercel + Supabase em produção)

---

## 🔗 Links Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

**Criado para MemberFlix** 🎬
