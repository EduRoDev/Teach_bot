import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { GatewayAiModule } from '../../gateway-ai/gateway-ai.module';

@Module({
  imports: [
    PrismaModule,
    GatewayAiModule    
  ],
  providers: [QuizService],
  controllers: [QuizController]
})
export class QuizModule {}
