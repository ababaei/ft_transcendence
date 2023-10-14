import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './twoFactorAuth.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { TwoFactorAuthController } from './twoFactorAuth.controller';

@Module({
  imports: [UsersModule],
  controllers: [TwoFactorAuthController],
  providers: [TwoFactorAuthService, UsersService],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
