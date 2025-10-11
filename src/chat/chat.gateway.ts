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
import { ChatService, IWhisper } from './chat.service';
import {
  CreateMessageDto,
  CreateWhisperDto,
  CreateWhisperResponseDto,
} from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://*.ngrok-free.app',
      'https://*.ngrok.io',
      'http://localhost:*',
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
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
    const users = await this.chatService.getUsers();
    client.emit('users', users);
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
    this.logger.log(`Nome salvo: ${name} para sessão: ${sessionId}`);
    const users = await this.chatService.getUsers();
    client.emit('users', users);
    this.logger.log(`Usuários atualizados: ${JSON.stringify(users)}`);
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
    const payloadResponse = { Message: newMessage };
    this.server.emit('receiveMessage', payloadResponse);
  }

  @SubscribeMessage('sendWhisper')
  async handleWhisper(
    @ConnectedSocket() client: Socket,
    @MessageBody(new ValidationPipe()) payload: CreateWhisperDto,
  ): Promise<void> {
    const sessionId = client.id;
    const newWhisper: IWhisper = await this.chatService.sendWhisper(
      sessionId,
      payload.destinationSessionId,
      payload.text,
    );
    this.logger.log(`Sussurro enviado: ${JSON.stringify(newWhisper)}`);
    const newWhisperResponse: CreateWhisperResponseDto = {
      fromName: newWhisper.Message.name,
      text: newWhisper.Message.Text,
      date: newWhisper.Message.Date,
    };

    this.logger.log(
      `Sussurro respondido: ${JSON.stringify(newWhisperResponse)}`,
    );
    // enviar apenas para o destinatário
    const payloadResponse = { Whisper: newWhisperResponse };
    this.server
      .to(newWhisper.destinationSessionId.session)
      .emit('receiveWhisper', payloadResponse);
  }
}
