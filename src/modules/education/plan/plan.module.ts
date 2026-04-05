import { Module } from '@nestjs/common';
import { PlanController } from './plan.controller';
import { PlanService } from './plan.service';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { GatewayAiModule } from 'src/modules/gateway-ai/gateway-ai.module';

@Module({
  imports:[
    PrismaModule,
    GatewayAiModule
  ],
  controllers: [PlanController],
  providers: [PlanService]
})
export class PlanModule {}
