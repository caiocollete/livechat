import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [RedisModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
