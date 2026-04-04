import { Module } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { FlashcardsController } from './flashcards.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayAiModule } from '../gateway-ai/gateway-ai.module';

@Module({
  imports: [
    PrismaModule,
    GatewayAiModule
  ],
  providers: [FlashcardsService],
  controllers: [FlashcardsController]
})
export class FlashcardsModule {}
