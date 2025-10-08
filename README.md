# 🚀 Como Usar o Sistema de Chat em Tempo Real

Este guia explica como executar e usar o sistema de chat que você criou com NestJS, WebSockets e Redis.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior)
2. **Redis** (versão 6 ou superior)
3. **npm** ou **yarn**

## 🔧 Instalação e Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Redis

**Opção A: Redis Local**

```bash
# macOS (com Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Baixe e instale do site oficial: https://redis.io/download
```

**Opção B: Redis com Docker**

```bash
docker run -d -p 6379:6379 redis:latest
```

### 3. Verificar se Redis está rodando

```bash
redis-cli ping
# Deve retornar: PONG
```

## 🚀 Executando o Sistema

### 1. Iniciar o Servidor NestJS

```bash
# Desenvolvimento (com hot reload)
npm run start:dev

# Ou produção
npm run build
npm run start:prod
```

O servidor estará disponível em: `http://localhost:3000`

### 2. Testar o Chat

**Opção A: Usar o arquivo HTML de teste**

1. Abra o arquivo `test-chat.html` no seu navegador
2. O chat se conectará automaticamente ao servidor

**Opção B: Usar um cliente WebSocket personalizado**

## 📡 Como o Sistema Funciona

### Arquitetura

```
Cliente WebSocket ←→ NestJS Gateway ←→ ChatService ←→ Redis
```

### Fluxo de Mensagens

1. **Cliente conecta** → Recebe histórico de mensagens
2. **Cliente envia mensagem** → Salva no Redis + Transmite para todos
3. **Outros clientes** → Recebem a mensagem em tempo real

### Estrutura das Mensagens

```typescript
interface IMessage {
  session: string; // ID da sessão WebSocket
  name: string; // Nome do cliente
  Text: string; // Conteúdo da mensagem
  Date: string; // Timestamp ISO 8601
}
```

### Eventos WebSocket

- **`sendMessage`** - Enviar nova mensagem
- **`receiveMessage`** - Receber mensagem de outro usuário
- **`saveName`** - Salva nome do cliente
- **`history`** - Receber histórico ao conectar

## 🛠️ Endpoints e Funcionalidades

### WebSocket Gateway

- **URL**: `ws://localhost:3000`
- **CORS**: Habilitado para todos os origins
- **Eventos suportados**: `sendMessage`, `receiveMessage`, `history`

### API REST (Swagger)

- **URL**: `http://localhost:3000/api`
- **Documentação**: Interface Swagger para explorar a API

## 💾 Armazenamento no Redis

### Chave utilizada

```
chat:geral
chat:name
```

### Estrutura dos dados

- **Tipo**: Lista (List)
- **Formato**: JSON string
- **Limite**: 50 mensagens (mais recentes)
- **Ordenação**: Mais recente primeiro

### Exemplo de dados no Redis

```json
{
  "Message": {
    "session": "socket_id_123",
    "name": "John Doe"
    "Text": "Olá, pessoal!",
    "Date": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🧪 Testando o Sistema

### 1. Teste Básico

1. Abra o `test-chat.html` em duas abas diferentes
2. Envie mensagens de uma aba
3. Veja as mensagens aparecerem na outra aba em tempo real

### 2. Teste com Múltiplos Clientes

```javascript
// Conectar múltiplos clientes
const socket1 = io('http://localhost:3000');
const socket2 = io('http://localhost:3000');

socket1.emit('sendMessage', { text: 'Mensagem do cliente 1' });
socket2.emit('sendMessage', { text: 'Mensagem do cliente 2' });
```

### 3. Verificar Dados no Redis

```bash
# Conectar ao Redis CLI
redis-cli

# Ver todas as chaves
KEYS *

# Ver mensagens do chat
LRANGE chat:geral 0 -1

# Ver quantidade de mensagens
LLEN chat:geral
```

## 🔍 Monitoramento e Debug

### Logs do Servidor

O servidor NestJS mostra logs detalhados:

- Conexões/desconexões de clientes
- Mensagens recebidas
- Erros de conexão com Redis

### Logs do Cliente

Abra o console do navegador (F12) para ver:

- Status da conexão WebSocket
- Mensagens enviadas/recebidas
- Erros de conexão

## 🚨 Solução de Problemas

### Redis não conecta

```bash
# Verificar se Redis está rodando
redis-cli ping

# Verificar porta
netstat -an | grep 6379
```

### WebSocket não conecta

1. Verificar se o servidor NestJS está rodando
2. Verificar se não há firewall bloqueando a porta 3000
3. Verificar CORS no navegador

### Mensagens não aparecem

1. Verificar console do navegador para erros
2. Verificar logs do servidor NestJS
3. Verificar conexão com Redis

## 📈 Próximos Passos

Para expandir o sistema, você pode:

1. **Autenticação**: Adicionar login/logout
2. **Salas de Chat**: Criar diferentes canais
3. **Persistência**: Salvar em banco de dados
4. **Notificações**: Push notifications
5. **Upload de Arquivos**: Envio de imagens/arquivos
6. **Moderação**: Filtros de conteúdo
7. **Histórico Avançado**: Paginação e busca

## 📚 Recursos Úteis

- [Documentação NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [Documentação Socket.IO](https://socket.io/docs/v4/)
- [Documentação Redis](https://redis.io/documentation)
- [Redis Commands](https://redis.io/commands)

---

**🎉 Pronto! Seu sistema de chat em tempo real está funcionando!**
