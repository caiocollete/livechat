#!/bin/bash

# Script para mostrar as URLs atuais
# Uso: ./show-urls.sh

echo "📋 URLs do Sistema"
echo "================================"

# Verifica Redis
echo "🔗 Redis:"
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Local: redis://localhost:6379"
else
    echo "   ❌ Não está rodando"
fi

# Verifica NestJS
echo ""
echo "🔗 NestJS:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Local: http://localhost:3000"
else
    echo "   ❌ Não está rodando"
fi

# Verifica ngrok
echo ""
echo "🌍 Ngrok:"
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        echo "   ✅ Público: $NGROK_URL"
        echo ""
        echo "📝 Para usar no HTML:"
        echo "   const socket = io('$NGROK_URL');"
    else
        echo "   ⚠️ Rodando mas URL não encontrada"
    fi
else
    echo "   ❌ Não está rodando"
fi

echo ""
echo "💡 Para iniciar tudo: ./start-ngrok.sh"
