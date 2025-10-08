import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      // Coloque a URL do seu Redis aqui. Se estiver rodando localmente,
      // o padrão geralmente funciona.
      // Ex: url: 'redis://user:password@host:port'
      url: 'redis://localhost:6379',
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    await this.client.connect();
    console.log('Conectado ao Redis com sucesso!');
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  // Método para obter o cliente e usá-lo em outros serviços
  getClient(): RedisClientType {
    return this.client;
  }
}
