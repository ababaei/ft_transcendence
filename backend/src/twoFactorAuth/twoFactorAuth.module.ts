import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './twoFactorAuth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthController } from './twoFactorAuth.controller';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [UsersModule],
  controllers: [TwoFactorAuthController],
  providers: [TwoFactorAuthService, UsersService, AuthService, PrismaService],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
