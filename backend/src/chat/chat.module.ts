import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MyGateway } from 'src/gateway/gateway';
import { GatewayModule } from 'src/gateway/gateway.module';
import { GameService } from 'src/games/games.service';
import { PlayersService } from 'src/players/players.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [GatewayModule],
  controllers: [ChatController],
  providers: [ChatService, MyGateway, GameService, PlayersService, PrismaService]
})
export class ChatModule {}
