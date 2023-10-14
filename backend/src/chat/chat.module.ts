import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GameService } from 'src/games/games.service';
import { PlayersService } from 'src/players/players.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { GatewayModule } from 'src/gateway/gateway.module';
import { MyGateway } from 'src/gateway/gateway';

@Module({
  imports: [GatewayModule],
  controllers: [ChatController],
  providers: [ChatService, MyGateway, PrismaService]
})
export class ChatModule {}
