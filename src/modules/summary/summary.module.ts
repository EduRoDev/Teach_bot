import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GatewayAiModule } from '../gateway-ai/gateway-ai.module';

@Module({
  imports: [
    PrismaModule,
    GatewayAiModule
  ],
  providers: [SummaryService],
  controllers: [SummaryController]
})
export class SummaryModule {}
