import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { PlayersModule } from './players/players.module';
import { GameModule } from './games/games.module';
import { WaitingModule } from './waiting/waiting.module';
import { GatewayModule } from './gateway/gateway.module';
import { GatewayPongModule } from './gatewayPong/Pongateway.module';
import { TwoFactorAuthModule } from './twoFactorAuth/twoFactorAuth.module';

@Module({
  imports: [
    GatewayModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ChatModule,
    UsersModule,
    PlayersModule,
    GameModule,
    WaitingModule,
    GatewayPongModule,
    TwoFactorAuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
