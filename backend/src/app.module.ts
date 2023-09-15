import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [GatewayModule, PrismaModule,
     ConfigModule.forRoot({isGlobal: true}), ChatModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
