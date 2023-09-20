import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { PlayersModule } from './players/players.module';
import { GameModule } from './games/games.module';

@Module({
  imports: [GatewayModule, PlayersModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
