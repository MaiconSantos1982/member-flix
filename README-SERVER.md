# 🚀 Guia de Gerenciamento do Servidor

## Início Rápido

### Iniciar o servidor em background
```bash
./start-server.sh start
```

### Parar o servidor
```bash
./start-server.sh stop
```

### Reiniciar o servidor
```bash
./start-server.sh restart
```

### Verificar status
```bash
./start-server.sh status
```

---

## 📋 Detalhes

Quando você executa `./start-server.sh start`, o servidor Next.js será iniciado em **background** (segundo plano). Isso significa que:

✅ Você pode fechar o terminal sem parar o servidor  
✅ O servidor continuará rodando até você executar `stop`  
✅ Você pode acessar http://localhost:3000 normalmente  
✅ Os logs ficam salvos em `.server.log`  

---

## 🔧 Alternativa: Usar diretamente no terminal

Se preferir ver os logs em tempo real:
```bash
npm run dev
```

---

## 📝 Arquivos Gerados

- `.server.pid` - Armazena o ID do processo do servidor
- `.server.log` - Logs de execução do servidor

**Nota:** Estes arquivos são temporários e podem ser deletados quando o servidor não estiver rodando.

---

## ⚠️ Solução de Problemas

### Servidor não inicia
```bash
# Verifique os logs
cat .server.log

# Tente parar e iniciar novamente
./start-server.sh stop
./start-server.sh start
```

### Porta 3000 já está em uso
```bash
# Encontre o processo usando a porta 3000
lsof -ti:3000

# Mate o processo (substitua PID pelo número retornado)
kill -9 PID
```

### Limpar tudo e recomeçar
```bash
./start-server.sh stop
rm -f .server.pid .server.log
npm run dev
```
