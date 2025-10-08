// src/chat/chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  /**
   * Lida com um novo cliente se conectando.
   * Envia o histórico de mensagens para o cliente que acabou de conectar.
   */
  async handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado anonimamente: ${client.id}`);
    const history = await this.chatService.getHistory();
    // Envia o histórico apenas para o cliente que conectou
    client.emit('history', history);
  }

  /**
   * Lida com um cliente se desconectando.
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Ouve por eventos de salvamento de nome.
   * Salva o nome do usuário associado à sessão.
   */
  @SubscribeMessage('saveName')
  async handleSaveName(
    @ConnectedSocket() client: Socket,
    @MessageBody() name: string,
  ): Promise<void> {
    const sessionId = client.id;

    await this.chatService.saveName(sessionId, name);
  }

  /**
   * Ouve por novas mensagens do evento 'sendMessage'.
   * Salva a mensagem e a transmite para todos os clientes.
   */
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe()) payload: CreateMessageDto,
  ): Promise<void> {
    const sessionId = client.id;
    const { text } = payload;

    // 1. Salva a mensagem no Redis e obtém o objeto completo
    const newMessage = await this.chatService.saveMessage(sessionId, text);

    // 2. Transmite a nova mensagem para TODOS os clientes conectados
    this.server.emit('receiveMessage', { Message: newMessage });
  }
}
