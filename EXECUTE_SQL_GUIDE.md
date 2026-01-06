# 📋 SQL Pronto para Execução - WEMembers

## ✅ Ajustes Realizados

O arquivo `wemembers_schema.sql` foi ajustado para **NÃO sobrepor** a tabela `offers` existente.

### Tabela `offers` - Estrutura Atual no Banco

```sql
-- Esta tabela JÁ EXISTE com a seguinte estrutura:
id                        → INTEGER (auto-increment)
product_id                → UUID
name                      → TEXT
slug                      → TEXT (nullable)
price_in_cents            → INTEGER
original_price_in_cents   → INTEGER
max_installments          → INTEGER (nullable)
discount_percent          → INTEGER
is_active                 → BOOLEAN
offer_type                → TEXT (nullable)
display_order             → INTEGER (nullable)
created_at                → TIMESTAMP
updated_at                → TIMESTAMP
payment_methods           → JSONB (array)
pix_key_id                → UUID (nullable)
payment_method            → TEXT
currency                  → TEXT

Total de registros: 340
```

---

## 🎯 O Que o SQL Vai Criar

### ✅ 7 Novas Tabelas:

1. **wemembers_products** - Produtos da área de membros
2. **wemembers_modules** - Módulos dos produtos
3. **wemembers_lessons** - Aulas dos módulos
4. **wemembers_enrollments** - Matrículas de usuários
5. **wemembers_lesson_progress** - Progresso nas aulas
6. **wemembers_purchases** - Histórico de compras

### ✅ Integrações com Tabelas Existentes:

- `users` (para autenticação compartilhada)
- `products` (produtos principais)
- `accounts` (contas do sistema)
- `offers` (controle de acesso por oferta) ← **NÃO SERÁ CRIADA**

### ✅ Recursos Adicionais:

- Triggers `updated_at` em todas as tabelas wemembers_*
- Function `wemembers_user_has_access()` para verificar permissões
- View `wemembers_user_progress_summary` para estatísticas
- Todos os índices para performance otimizada
- Comentários de documentação

---

## 🚀 Como Executar

### Passo 1: Abrir SQL Editor no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor** (`</>`)
4. Clique em **"New query"**

### Passo 2: Copiar e Executar o SQL

1. Abra o arquivo `wemembers_schema.sql`
2. Copie **TODO** o conteúdo (Cmd+A, Cmd+C)
3. Cole no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Cmd+Enter`)

### Passo 3: Verificar Execução

Aguarde a execução. Você deve ver:

```
Success. No rows returned.
```

Ou mensagens de criação de cada tabela.

---

## ⚠️ Possíveis Avisos (Podem ser Ignorados)

Você pode ver avisos como:

```
NOTICE: function "update_updated_at_column" already exists
NOTICE: index "..." already exists
```

**Isso é NORMAL e SEGURO**. O SQL usa `IF NOT EXISTS` e `CREATE OR REPLACE` para evitar erros.

---

## 🔍 Verificar se Funcionou

Após executar, rode este SQL para verificar:

```sql
-- Listar todas as tabelas wemembers
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'wemembers_%'
ORDER BY table_name;
```

**Resultado esperado:**
```
wemembers_enrollments
wemembers_lesson_progress
wemembers_lessons
wemembers_modules
wemembers_products
wemembers_purchases
```

**Total: 6 tabelas** ✅

---

## 📊 Exemplo: Criar Dados de Teste

Após executar o schema, você pode criar dados de exemplo:

```sql
-- 1. Criar um produto de teste na área de membros
INSERT INTO wemembers_products (title, description, is_published, offer_id)
VALUES (
    'Curso de Teste - Área de Membros',
    'Descrição do curso de teste',
    true,
    NULL  -- NULL = disponível para todas as ofertas
)
RETURNING id;

-- Guarde o ID retornado para usar nos próximos passos
-- Exemplo: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- 2. Criar um módulo
INSERT INTO wemembers_modules (wemembers_product_id, title, order_index, offer_id)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- ← Substituir pelo ID do produto
    'Módulo 1 - Introdução',
    1,
    NULL  -- NULL = disponível para todas as ofertas
)
RETURNING id;

-- 3. Criar uma aula
INSERT INTO wemembers_lessons (
    wemembers_module_id, 
    title, 
    type, 
    video_url, 
    order_index,
    offer_id
)
VALUES (
    '[ID_DO_MODULO]',  -- ← Substituir pelo ID do módulo
    'Aula 1 - Bem-vindo',
    'video',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    1,
    NULL  -- NULL = disponível para todas as ofertas
);
```

---

## 🔗 Próximos Passos

Após executar com sucesso:

1. ✅ Verificar se as 6 tabelas foram criadas
2. ✅ Criar dados de teste (opcional)
3. ✅ Ajustar o código da aplicação para usar as novas tabelas
4. ✅ Implementar dropdowns de ofertas no admin
5. ✅ Testar matrícula e progresso de usuários

---

## 🆘 Solução de Problemas

### Erro: "relation 'users' does not exist"

**Causa:** A tabela `users` não existe no banco.

**Solução:**
```sql
-- Criar tabela users básica (se não existir)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Erro: "column 'id' in offers is type integer but expression is type uuid"

**Causa:** A tabela offers usa INTEGER como ID, não UUID.

**Solução:** Isso foi resolvido no SQL. As foreign keys usam o tipo correto.

### Erro: "permission denied for table offers"

**Causa:** Permissões de RLS muito restritivas.

**Solução:**
```sql
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
```

---

**Pronto para Executar!** 🚀

Execute o `wemembers_schema.sql` com confiança. Ele **NÃO** vai sobrepor a tabela `offers` existente.
