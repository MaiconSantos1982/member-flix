# 🚀 Guia: Subir Projeto para o GitHub

## ✅ Passo 1: Criar Repositório no GitHub (CONCLUÍDO LOCALMENTE)

O repositório Git local já foi inicializado e o primeiro commit foi feito! ✅

```
✅ git init
✅ git add .
✅ git commit -m "Initial commit: MemberFlix - Plataforma de área de membros estilo Netflix"
```

**66 arquivos** foram adicionados ao commit inicial.

---

## 📝 Passo 2: Criar Repositório no GitHub.com

1. **Acesse**: https://github.com/new

2. **Preencha os dados:**
   - **Repository name**: `member-flix` (ou outro nome de sua preferência)
   - **Description**: `Plataforma de área de membros estilo Netflix com Next.js e Supabase`
   - **Visibility**: 
     - ✅ **Private** (recomendado - projeto privado)
     - ⚪ Public (se quiser tornar público)
   - **NÃO marque** "Initialize this repository with:"
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license

3. **Clique em "Create repository"**

---

## 🔗 Passo 3: Conectar e Fazer Push

Depois de criar o repositório no GitHub, você verá uma página com instruções. 

**Execute estes comandos no terminal:**

### Opção A: Se você criou o repositório como `member-flix`:

```bash
git remote add origin https://github.com/SEU_USUARIO/member-flix.git
git branch -M main
git push -u origin main
```

### Opção B: Comandos prontos para copiar e colar:

Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub:

```bash
# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/member-flix.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push
git push -u origin main
```

---

## 🔐 Autenticação

Quando você executar `git push`, o GitHub pode pedir autenticação:

### Opção 1: Personal Access Token (Recomendado)

1. Vá em: https://github.com/settings/tokens
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Dê um nome: `MemberFlix Deploy`
4. Marque o escopo: `repo` (Full control of private repositories)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (você não verá ele novamente!)
7. Use o token como senha quando o git pedir

### Opção 2: GitHub CLI

```bash
# Instalar GitHub CLI (se não tiver)
brew install gh

# Fazer login
gh auth login

# Fazer push
git push -u origin main
```

---

## ✅ Verificar se Funcionou

Depois do push, acesse:
```
https://github.com/SEU_USUARIO/member-flix
```

Você deve ver todos os arquivos do projeto!

---

## 📦 Próximos Commits

Sempre que fizer alterações no projeto:

```bash
# Ver o que mudou
git status

# Adicionar arquivos modificados
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para o GitHub
git push
```

---

## ⚠️ IMPORTANTE: Segurança

O arquivo `.env.local` **NÃO** será enviado para o GitHub (está no .gitignore).

Suas credenciais do Supabase estão **seguras** e **não** serão expostas! ✅

---

## 🎯 Resumo dos Comandos

Execute estes 3 comandos (substitua SEU_USUARIO):

```bash
git remote add origin https://github.com/SEU_USUARIO/member-flix.git
git branch -M main
git push -u origin main
```

**Pronto!** Seu projeto estará salvo no GitHub! 🎉
