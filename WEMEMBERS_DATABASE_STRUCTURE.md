# 📚 Estrutura de Banco de Dados - WEMembers

## 🎯 Visão Geral

Este documento descreve a estrutura de banco de dados da área de membros (WEMembers), integrada ao projeto Previo.

---

## 📊 Diagrama de Relacionamentos

```
┌─────────────────┐
│    accounts     │ (Projeto Principal)
└────────┬────────┘
         │
         ├──────────────────────────┐
         │                          │
┌────────▼────────┐        ┌────────▼────────┐
│    products     │        │    payments     │
└────────┬────────┘        └─────────────────┘
         │
         │
┌────────▼────────┐
│     offers      │ ◄─── NOVA TABELA
└────────┬────────┘
         │
         │
┌────────▼─────────────────┐
│  wemembers_products      │
└────────┬─────────────────┘
         │
         ├──────────────────┬───────────────────┐
         │                  │                   │
┌────────▼────────┐  ┌──────▼──────────┐  ┌────▼───────────────┐
│ wemembers_      │  │  wemembers_     │  │  wemembers_        │
│ modules         │  │  enrollments    │  │  purchases         │
└────────┬────────┘  └─────────────────┘  └────────────────────┘
         │
         │
┌────────▼────────┐
│ wemembers_      │
│ lessons         │
└────────┬────────┘
         │
         │
┌────────▼────────────┐
│ wemembers_lesson_   │
│ progress            │
└─────────────────────┘
```

---

## 🗂️ Tabelas Criadas

### 1. **offers** (Nova Tabela Principal)
Gerencia as diferentes ofertas de um mesmo produto.

**Campos principais:**
- `id` - UUID único
- `product_id` - Referência ao produto principal
- `account_id` - Conta dona do produto
- `name` - Nome da oferta (ex: "Black Friday", "Oferta Padrão")
- `price_in_cents` - Preço em centavos
- `is_active` - Se a oferta está ativa
- `slug` - Slug único para URLs

**Relacionamentos:**
- ✅ `products` (muitos para um)
- ✅ `accounts` (muitos para um)

---

### 2. **wemembers_products**
Produtos específicos da área de membros (cursos/treinamentos).

**Campos principais:**
- `id` - UUID único
- `product_id` - Referência ao produto principal (opcional)
- `account_id` - Conta dona
- `title`, `description`, `cover_image` - Dados do produto
- `offer_id` - **Controle de liberação** (NULL = todas, UUID = específica)

**Relacionamentos:**
- ✅ `products` (opcional)
- ✅ `accounts`
- ✅ `offers` (controle de acesso)

---

### 3. **wemembers_modules**
Módulos que compõem um produto da área de membros.

**Campos principais:**
- `id` - UUID único
- `wemembers_product_id` - Produto pai
- `title`, `description` - Dados do módulo
- `order_index` - Ordem de exibição
- `days_to_unlock` - Dias até desbloquear (lançamento programado)
- `offer_id` - **Controle de liberação** (NULL = todas, UUID = específica)

**Relacionamentos:**
- ✅ `wemembers_products` (muitos para um)
- ✅ `offers` (controle de acesso)

---

### 4. **wemembers_lessons**
Aulas dentro de cada módulo.

**Campos principais:**
- `id` - UUID único
- `wemembers_module_id` - Módulo pai
- `title`, `description` - Dados da aula
- `type` - Tipo: 'video' ou 'pdf'
- `video_url` - URL do vídeo
- `pdf_path` - Caminho do PDF
- `duration_seconds` - Duração em segundos
- `order_index` - Ordem de exibição
- `offer_id` - **Controle de liberação** (NULL = todas, UUID = específica)

**Relacionamentos:**
- ✅ `wemembers_modules` (muitos para um)
- ✅ `offers` (controle de acesso)

---

### 5. **wemembers_enrollments**
Matrículas de usuários em produtos.

**Campos principais:**
- `id` - UUID único
- `user_id` - Usuário matriculado (tabela `users`)
- `wemembers_product_id` - Produto matriculado
- `offer_id` - Oferta pela qual foi matriculado
- `active` - Se a matrícula está ativa
- `expires_at` - Data de expiração (NULL = vitalício)

**Relacionamentos:**
- ✅ `users` (muitos para um)
- ✅ `wemembers_products` (muitos para um)
- ✅ `offers` (muitos para um)

**Constraint:**
- UNIQUE (`user_id`, `wemembers_product_id`) - Evita matrículas duplicadas

---

### 6. **wemembers_lesson_progress**
Progresso individual de cada usuário em cada aula.

**Campos principais:**
- `id` - UUID único
- `user_id` - Usuário
- `wemembers_lesson_id` - Aula
- `completed` - Se foi completada
- `last_position_seconds` - Última posição do vídeo
- `completed_at` - Data de conclusão

**Relacionamentos:**
- ✅ `users` (muitos para um)
- ✅ `wemembers_lessons` (muitos para um)

**Constraint:**
- UNIQUE (`user_id`, `wemembers_lesson_id`) - Evita duplicatas

---

### 7. **wemembers_purchases**
Histórico de compras realizadas.

**Campos principais:**
- `id` - UUID único
- `user_id` - Comprador
- `wemembers_product_id` - Produto comprado
- `offer_id` - Oferta pela qual comprou
- `amount_paid_cents` - Valor pago em centavos
- `payment_status` - Status: 'pending', 'paid', 'refunded', 'canceled'
- `payment_id` - ID externo do gateway

**Relacionamentos:**
- ✅ `users` (muitos para um)
- ✅ `wemembers_products` (muitos para um)
- ✅ `offers` (muitos para um)

---

## 🔐 Sistema de Controle de Acesso por Oferta

### Como Funciona

Cada nível (produto, módulo, aula) pode ter um `offer_id`:

1. **`offer_id = NULL`** → Liberado para **TODAS** as ofertas
2. **`offer_id = UUID`** → Liberado **APENAS** para essa oferta específica

### Exemplos de Uso

#### Exemplo 1: Curso Base + Bônus Premium
```sql
-- Curso completo disponível para todos
INSERT INTO wemembers_products (title, offer_id) 
VALUES ('Curso de Marketing', NULL);

-- Módulo bônus apenas para oferta "Black Friday"
INSERT INTO wemembers_modules (wemembers_product_id, title, offer_id)
VALUES ('[produto_id]', 'Módulo Bônus Exclusivo', '[offer_black_friday_id]');
```

#### Exemplo 2: Aulas Liberadas Gradualmente
```sql
-- Aulas 1-5: todas as ofertas
INSERT INTO wemembers_lessons (wemembers_module_id, title, offer_id)
VALUES ('[modulo_id]', 'Aula 1', NULL);

-- Aulas 6-10: apenas oferta premium
INSERT INTO wemembers_lessons (wemembers_module_id, title, offer_id)
VALUES ('[modulo_id]', 'Aula 6 - Avançado', '[offer_premium_id]');
```

---

## 🛠️ Funções Auxiliares

### `wemembers_user_has_access(user_id, lesson_id)`

Verifica se um usuário tem acesso a uma aula específica, considerando:
- Se tem matrícula ativa no produto
- Se a matrícula não expirou
- Se a oferta da matrícula permite acesso à aula

**Uso:**
```sql
SELECT wemembers_user_has_access(
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    '6ba7b810-9dad-11d1-80b4-00c04fd430c8'::UUID
);
-- Retorna: true ou false
```

---

## 📈 View: wemembers_user_progress_summary

Mostra resumo de progresso para cada matrícula.

**Campos:**
- `user_id` - ID do usuário
- `wemembers_product_id` - ID do produto
- `product_title` - Título do produto
- `total_lessons` - Total de aulas
- `completed_lessons` - Aulas completadas
- `progress_percentage` - % de conclusão

**Uso:**
```sql
SELECT * FROM wemembers_user_progress_summary
WHERE user_id = '[user_id]';
```

---

## 🎛️ Dropdown de Ofertas no Admin

Ao criar/editar Produto, Módulo ou Aula, haverá um dropdown:

```
Liberar para:
┌─────────────────────────────┐
│ ○ Todas as ofertas          │
│ ○ Oferta Padrão             │
│ ○ Black Friday 2026         │
│ ○ Membros VIP               │
└─────────────────────────────┘
```

- **"Todas as ofertas"** → Salva `offer_id = NULL`
- **Oferta específica** → Salva `offer_id = [uuid da oferta]`

---

## ✅ Checklist de Instalação

1. [ ] Executar `wemembers_schema.sql` no SQL Editor do Supabase
2. [ ] Verificar se não houve erros
3. [ ] Confirmar que 8 tabelas foram criadas (7 wemembers_ + 1 offers)
4. [ ] Criar oferta padrão para testes
5. [ ] Ajustar código do admin para usar novas tabelas

---

## 🔄 Migração de Dados Antigos

Se você já tinha dados nas tabelas antigas (`profiles`, `products`, `modules`, etc.), execute:

```sql
-- Migrar produtos antigos
INSERT INTO wemembers_products (title, description, cover_image, price, is_published, sales_video_url)
SELECT title, description, cover_image, price, is_published, sales_video_url
FROM public.products
WHERE [condição se necessário];

-- Migrar módulos antigos
INSERT INTO wemembers_modules (wemembers_product_id, title, description, order_index, days_to_unlock)
SELECT 
    new_product_mapping.new_id,
    m.title, 
    m.description, 
    m.order_index, 
    m.days_to_unlock
FROM public.modules m
JOIN [tabela de mapeamento] ON ...;
```

---

## 📝 Próximos Passos

Após executar o SQL:

1. **Criar oferta padrão:**
```sql
INSERT INTO public.offers (product_id, account_id, name, price_in_cents, is_active, slug)
VALUES 
('[product_id]', '[account_id]', 'Oferta Padrão', 19700, true, 'oferta-padrao');
```

2. **Ajustar código do admin** para usar:
   - `wemembers_products` ao invés de `products`
   - `wemembers_modules` ao invés de `modules`
   - `wemembers_lessons` ao invés de `lessons`

3. **Implementar dropdown de ofertas** nas telas de criação/edição

---

**Criado para WEMembers** 🎓 | Integrado com Projeto Previo 🚀
