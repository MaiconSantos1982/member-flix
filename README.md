# 🎓 WeMembers

Uma plataforma completa de área de membros para cursos online, construída com Next.js e Supabase.

## 🚀 Funcionalidades

### Para Alunos
- ✅ **Autenticação segura** com Supabase Auth
- 🎥 **Player de vídeos** integrado (YouTube, Vimeo, etc)
- 📄 **Visualizador de PDFs** com progresso
- 📊 **Acompanhamento de progresso** com streak de dias consecutivos
- 🔒 **Liberação progressiva** de módulos por dias
- 🎯 **Sistema de conquistas** e gamificação
- 📱 **Design responsivo** mobile-first

### Para Administradores
- 👥 **Gestão de alunos** e matrículas
- 📚 **Criação de cursos** e módulos
- 🎬 **Upload de aulas** (vídeo e PDF)
- 🎨 **Banners dinâmicos** e popups
- 📈 **Dashboard administrativo**
- ⚙️ **Configurações globais**

## 🛠️ Tecnologias

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Backend**: [Supabase](https://supabase.com/)
  - PostgreSQL Database
  - Authentication
  - Storage
  - Row Level Security (RLS)
- **Player**: React Player
- **PDF Viewer**: React PDF
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/SEU_USUARIO/member-flix.git
cd member-flix
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. **Configure o banco de dados**

Execute os scripts SQL na seguinte ordem no Supabase SQL Editor:

```bash
1. supabase/schema.sql
2. supabase/fix-lesson-progress-complete.sql (ou recreate-lesson-progress.sql)
3. supabase/add-benefits-column.sql
4. supabase/add-global-settings.sql
```

5. **Crie os buckets no Supabase Storage**

- `public_assets` (público) - para capas e banners
- `secure_content` (privado) - para PDFs protegidos

6. **Execute o projeto**
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📁 Estrutura do Projeto

```
member-flix/
├── app/                    # App Router do Next.js
│   ├── admin/             # Páginas administrativas
│   ├── watch/             # Player de aulas
│   ├── progresso/         # Página de progresso
│   └── ...
├── components/            # Componentes React
│   ├── admin/            # Componentes admin
│   ├── layout/           # Layout e navegação
│   ├── player/           # Players de vídeo/PDF
│   └── ui/               # Componentes de UI
├── contexts/             # React Contexts
├── lib/                  # Utilitários e configurações
├── supabase/            # Scripts SQL
└── public/              # Arquivos estáticos
```

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Proteção de rotas administrativas
- ✅ Storage com políticas de acesso
- ✅ Variáveis de ambiente para credenciais

## 📚 Documentação Adicional

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Guia completo de configuração do Supabase
- [README.md](./README.md) - Este arquivo

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📝 Licença

Este projeto é privado e proprietário.

## 👨‍💻 Autor

Desenvolvido por Maicon Santos

---

**⚠️ IMPORTANTE**: Não commite o arquivo `.env.local` com suas credenciais do Supabase!
