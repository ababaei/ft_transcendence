import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { FortyTwoStrategy } from './auth/strategy/school.strategy';

@Module({
  imports: [
    GatewayModule,
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({isGlobal: true}),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}