# 🔄 Plano de Migração: Member Flix → WeMembers

## 📋 Mudanças Necessárias

### 1. 🏷️ Renomeação do Sistema

Substituir "MemberFlix" ou "Member Flix" por "WeMembers" em:

#### Arquivos de Configuração:
- ✅ `README.md` - Título principal
- ✅ `package.json` - Nome e descrição
- ✅ `public/manifest.json` - Nome da PWA
- ✅ `app/layout.tsx` - Metadados e títulos
- ✅ `public/sw.js` - Service Worker

#### Componentes de Interface:
- ✅ `components/layout/Sidebar.tsx` - Logo/título
- ✅ `components/admin/AdminSidebar.tsx` - Logo/título  
- ✅ `app/login/page.tsx` - Título na tela
- ✅ `app/registro/page.tsx` - Título na tela
- ✅ `app/admin/configuracoes/page.tsx` - Configurações do site

#### Documentação:
- ✅ `GITHUB_SETUP.md`
- ✅ `SUPABASE_SETUP.md`
- ✅ Outros arquivos .md

---

### 2. 🗄️ Migração de Tabelas do Supabase

**TABELAS ANTIGAS → NOVAS:**

| Antiga | Nova | Usado Em |
|--------|------|----------|
| `profiles` | ❌ **NÃO MIGRAR** | Auth (mantém como está) |  
| `products` | `wemembers_products` | Todos os arquivos |
| `modules` | `wemembers_modules` | Todos os arquivos |
| `lessons` | `wemembers_lessons` | Todos os arquivos |
| `enrollments` | `wemembers_enrollments` | Todos os arquivos |
| `lesson_progress` | `wemembers_lesson_progress` | Todos os arquivos |

**IMPORTANTE:** `profiles` NÃO será migrada pois é usada para autenticação compartilhada!

---

### 3. 📂 Arquivos que Precisam de Atualização

#### **Contextos:**
- `contexts/AuthContext.tsx` - Mantém `profiles` (auth compartilhada)

#### **Componentes Admin:**
- `components/admin/AdminGuard.tsx` - Mantém `profiles`

#### **Páginas Principais:**
- `app/page.tsx` - Migrar 5 tabelas
- `app/progresso/page.tsx` - Migrar 4 tabelas
- `app/meus-cursos/page.tsx` - Migrar 4 tabelas
- `app/catalogo/page.tsx` - Migrar 2 tabelas
- `app/watch/[productId]/page.tsx` - Migrar 4 tabelas

#### **Páginas Admin:**
- `app/admin/page.tsx` - Migrar 3 tabelas (mantém profiles)
- `app/admin/produtos/page.tsx` - Migrar 2 tabelas
- `app/admin/alunos/page.tsx` - Migrar 2 tabelas
- `app/admin/construtor/page.tsx` - Migrar 3 tabelas

#### **Scripts de Debug:**
- `debug-progress.js` - Migrar todas

---

### 4. 🔍 Padrão de Busca e Substituição

```javascript
// ANTES:
.from('products')
.from('modules')  
.from('lessons')
.from('enrollments')
.from('lesson_progress')

// DEPOIS:
.from('wemembers_products')
.from('wemembers_modules')
.from('wemembers_lessons')
.from('wemembers_enrollments')
.from('wemembers_lesson_progress')
```

**⚠️ ATENÇÃO:** NÃO substituir `profiles` - manter como está!

---

## ✅ Checklist de Execução

### Fase 1: Renomeação Visual
- [ ] README.md
- [ ] package.json
- [ ] public/manifest.json
- [ ] public/sw.js
- [ ] app/layout.tsx
- [ ] app/login/page.tsx
- [ ] app/registro/page.tsx
- [ ] components/layout/Sidebar.tsx
- [ ] components/admin/AdminSidebar.tsx
- [ ] app/admin/configuracoes/page.tsx
- [ ] Arquivos de documentação (.md)

### Fase 2: Migração de Queries - Páginas de Usuário
- [ ] app/page.tsx
- [ ] app/progresso/page.tsx
- [ ] app/meus-cursos/page.tsx
- [ ] app/catalogo/page.tsx
- [ ] app/watch/[productId]/page.tsx

### Fase 3: Migração de Queries - Admin
- [ ] app/admin/page.tsx
- [ ] app/admin/produtos/page.tsx
- [ ] app/admin/alunos/page.tsx
- [ ] app/admin/construtor/page.tsx

### Fase 4: Testes
- [ ] Login funciona
- [ ] Listagem de cursos funciona
- [ ] Player de vídeo funciona
- [ ] Progresso salva corretamente
- [ ] Admin consegue criar produtos
- [ ] Admin consegue matricular alunos

---

## 🚀 Execução Automatizada

Vou criar scripts para fazer essas mudanças automaticamente.

**Prioridade:**
1. ✅ Renomear sistema (baixo risco)
2. ✅ Migrar tabelas (alto impacto, testar bem)

**Total de arquivos a modificar:** ~30 arquivos
