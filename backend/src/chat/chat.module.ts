import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MyGateway } from 'src/gateway/gateway';
import { GatewayModule } from 'src/gateway/gateway.module';

@Module({
  imports: [GatewayModule],
  controllers: [ChatController],
  providers: [ChatService, MyGateway]
})
export class ChatModule {}
