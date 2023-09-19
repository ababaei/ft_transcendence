import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
// import { SchoolStrategy } from './strategy/school.strategy';
import { FortyTwoStrategy } from './strategy/school.strategy'
import passport from 'passport';

@Module({
  imports: [PassportModule.register({
    session: true,
    defaultStrategy: '42'
  }),
  UsersModule],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy],
  exports: [PassportModule]
})
export class AuthModule {}
