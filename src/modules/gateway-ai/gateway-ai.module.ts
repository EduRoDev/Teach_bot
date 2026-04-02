import { Module } from '@nestjs/common';
import { GatewayAiService } from './gateway-ai.service';
import { GatewayAiController } from './gateway-ai.controller';


@Module({
  imports: [
  ],
  providers: [GatewayAiService],
  controllers: [GatewayAiController],
  exports: [GatewayAiService]
})
export class GatewayAiModule { }
