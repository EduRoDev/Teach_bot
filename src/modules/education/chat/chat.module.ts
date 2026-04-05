import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { GatewayAiModule } from 'src/modules/gateway-ai/gateway-ai.module';

@Module({
  imports: [
    PrismaModule,
    GatewayAiModule
  ],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
