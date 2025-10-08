// src/chat/chat.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RedisClientType } from 'redis';

// Interface para definir a estrutura da mensagem
export interface IMessage {
  session: string;
  Text: string;
  Date: string;
}

const CHAT_HISTORY_KEY = 'chat:geral';
const MAX_HISTORY_LENGTH = 50; // Manter apenas as últimas 50 mensagens

@Injectable()
export class ChatService implements OnModuleInit {
  private redisClient: RedisClientType;

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    this.redisClient = this.redisService.getClient();
  }

  /**
   * Salva uma nova mensagem anônima no histórico do Redis.
   * @param sessionId - O ID da conexão do cliente.
   * @param text - O conteúdo da mensagem.
   * @returns O objeto da mensagem que foi salvo.
   */
  async saveMessage(sessionId: string, text: string): Promise<IMessage> {
    const message: IMessage = {
      session: sessionId,
      Text: text,
      Date: new Date().toISOString(), // Usar o padrão ISO 8601 é uma boa prática
    };

    const messageString = JSON.stringify({ Message: message });

    // Adiciona a mensagem no topo da lista
    await this.redisClient.lPush(CHAT_HISTORY_KEY, messageString);

    // Mantém a lista com no máximo 50 mensagens para não consumir muita memória
    await this.redisClient.lTrim(CHAT_HISTORY_KEY, 0, MAX_HISTORY_LENGTH - 1);

    return message;
  }

  /**
   * Recupera o histórico de mensagens do Redis.
   * @returns Uma lista com as últimas mensagens.
   */
  async getHistory(): Promise<IMessage[]> {
    const historyStrings = await this.redisClient.lRange(
      CHAT_HISTORY_KEY,
      0,
      MAX_HISTORY_LENGTH - 1,
    );

    const messages: IMessage[] = historyStrings
      .map((msgStr) => {
        try {
          // Extrai o objeto Message de dentro do JSON
          const parsed = JSON.parse(msgStr) as { Message: IMessage };
          return parsed.Message;
        } catch (e) {
          console.error('Erro ao parsear mensagem do histórico:', msgStr, e);
          return null;
        }
      })
      .filter((msg): msg is IMessage => msg !== null); // Remove qualquer item que falhou no parse

    // A lista do Redis vem da mais nova para a mais antiga, então invertemos
    // para exibir na ordem cronológica correta no frontend.
    return messages.reverse();
  }
}
