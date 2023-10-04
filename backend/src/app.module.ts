import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { PlayersModule } from './players/players.module';
import { GameModule } from './games/games.module';
import { WaitingModule } from './waiting/waiting.module';

@Module({
  imports: [
    GatewayModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({isGlobal: true}),
    ChatModule,
    PlayersModule,
    GameModule,
    WaitingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}