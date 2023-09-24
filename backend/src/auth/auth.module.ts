import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
// import { SchoolStrategy } from './strategy/school.strategy';
import { FortyTwoStrategy } from './strategy/school.strategy'
import passport from 'passport';
import { PrismaService } from 'src/prisma/prisma.service';
import { SessionSerializer } from './utils/serializer';

@Module({
  imports: [PassportModule.register({
    session: true,
    defaultStrategy: '42'
  }),
  UsersModule],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, PrismaService, SessionSerializer],
  exports: [PassportModule]
})
export class AuthModule {}
