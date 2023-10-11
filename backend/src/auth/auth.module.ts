import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
// import { SchoolStrategy } from './strategy/school.strategy';
import { FortyTwoStrategy } from './strategy/school.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionSerializer } from './utils/serializer';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PassportModule.register({
      session: true,
      defaultStrategy: '42',
    }),
    JwtModule.register({
      secret: process.env['COOKIE_KEY'],
      global: true,
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, PrismaService, SessionSerializer],
  exports: [PassportModule],
})
export class AuthModule {}
