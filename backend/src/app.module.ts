import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    GatewayModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({isGlobal: true}),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}