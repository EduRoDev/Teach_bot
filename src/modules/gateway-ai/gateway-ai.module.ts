import { Module } from '@nestjs/common';
import { GatewayAiService } from './gateway-ai.service';
import { GatewayAiController } from './gateway-ai.controller';


@Module({
  providers: [GatewayAiService],
  controllers: [GatewayAiController]
})
export class GatewayAiModule { }
