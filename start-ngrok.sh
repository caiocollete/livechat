#!/bin/bash

# Script para iniciar NestJS + ngrok
# Uso: ./start-ngrok.sh

echo "🚀 Iniciando NestJS + Ngrok..."
echo "================================"

# Verifica se Redis está rodando
echo "📡 Verificando Redis..."
if ! redis-cli ping > /dev/null 2>&1; then
    echo "❌ Redis não está rodando!"
    echo "💡 Inicie o Redis primeiro:"
    echo "   - macOS: brew services start redis"
    echo "   - Docker: docker run -d -p 6379:6379 redis:latest"
    exit 1
fi
echo "✅ Redis está rodando!"

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📥 Instalando dependências..."
    npm install
fi

# Inicia o servidor NestJS
echo "🔧 Iniciando servidor NestJS..."
npm run start:dev &
SERVER_PID=$!

# Aguarda o servidor inicializar
echo "⏳ Aguardando servidor inicializar..."
sleep 5

# Verifica se o servidor está rodando
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "❌ Servidor não iniciou corretamente!"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi
echo "✅ Servidor NestJS rodando na porta 3000!"

# Inicia ngrok em background para capturar a URL
echo "🌐 Iniciando ngrok..."
ngrok http 3000 &
NGROK_PID=$!

# Aguarda ngrok inicializar
sleep 3

# Obtém a URL pública do ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)

echo ""
echo "🎉 Sistema iniciado com sucesso!"
echo "================================"
echo ""
echo "📋 URLs para usar no HTML:"
echo "================================"
echo "🔗 Redis: redis://localhost:6379"
echo "🔗 NestJS Local: http://localhost:3000"
if [ ! -z "$NGROK_URL" ]; then
    echo "🌍 NestJS Público: $NGROK_URL"
    echo ""
    echo "📝 Para usar no HTML, substitua:"
    echo "   const socket = io('http://localhost:3000');"
    echo "   por:"
    echo "   const socket = io('$NGROK_URL');"
else
    echo "🌍 NestJS Público: Aguardando ngrok..."
fi
echo ""
echo "🛑 Para parar: pressione Ctrl+C"
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $SERVER_PID $NGROK_PID 2>/dev/null
    echo "✅ Serviços parados!"
    exit 0
}

# Captura Ctrl+C
trap cleanup SIGINT

# Mantém o script rodando e mostra logs do ngrok
echo "📊 Monitoramento ngrok (Ctrl+C para parar):"
echo "================================"
wait
