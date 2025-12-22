#!/bin/bash

# Script para iniciar o servidor Next.js em background
# Uso: ./start-server.sh [start|stop|restart|status]

PROJECT_DIR="/Users/maiconsilvasantos/Downloads/Projetos/member-flix"
PID_FILE="$PROJECT_DIR/.server.pid"
LOG_FILE="$PROJECT_DIR/.server.log"

start_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Servidor já está rodando (PID: $PID)"
            echo "Acesse: http://localhost:3000"
            return 0
        else
            rm "$PID_FILE"
        fi
    fi
    
    echo "🚀 Iniciando servidor Next.js..."
    cd "$PROJECT_DIR"
    
    # Inicia o servidor em background e salva o PID
    nohup npm run dev > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    echo "⏳ Aguardando servidor inicializar..."
    sleep 5
    
    if ps -p $(cat "$PID_FILE") > /dev/null 2>&1; then
        echo "✅ Servidor iniciado com sucesso!"
        echo "📍 URL: http://localhost:3000"
        echo "📝 Logs: $LOG_FILE"
        echo "🔢 PID: $(cat $PID_FILE)"
    else
        echo "❌ Erro ao iniciar servidor. Verifique os logs em: $LOG_FILE"
        rm "$PID_FILE"
        return 1
    fi
}

stop_server() {
    if [ ! -f "$PID_FILE" ]; then
        echo "⚠️  Servidor não está rodando"
        return 0
    fi
    
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "🛑 Parando servidor (PID: $PID)..."
        kill $PID
        rm "$PID_FILE"
        echo "✅ Servidor parado com sucesso"
    else
        echo "⚠️  Processo não encontrado, limpando PID file..."
        rm "$PID_FILE"
    fi
}

status_server() {
    if [ ! -f "$PID_FILE" ]; then
        echo "❌ Servidor não está rodando"
        return 1
    fi
    
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Servidor está rodando (PID: $PID)"
        echo "📍 URL: http://localhost:3000"
        echo "📝 Logs: $LOG_FILE"
    else
        echo "❌ Servidor não está rodando (PID file órfão)"
        rm "$PID_FILE"
        return 1
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 2
        start_server
        ;;
    status)
        status_server
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status}"
        echo ""
        echo "Comandos:"
        echo "  start   - Inicia o servidor em background"
        echo "  stop    - Para o servidor"
        echo "  restart - Reinicia o servidor"
        echo "  status  - Verifica status do servidor"
        exit 1
        ;;
esac
