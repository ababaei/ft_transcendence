import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { TwoFactorAuthService } from './twoFactorAuth.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import TwoFaCodeDto from './dto/twoFaCode.dto';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorService: TwoFactorAuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('generate')
  @UseGuards(JwtGuard)
  async register(@Res() res: Response, @Req() req: Request) {
    const { otpauthUrl } = await this.twoFactorService.generate2FAsecret(
      req.user as User,
    );

    return this.twoFactorService.pipeQrCodeStream(res, otpauthUrl);
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async turnOn2FA(@Req() req: Request, @Body() { twoFaCode }: TwoFaCodeDto) {
    const isCodeValid = this.twoFactorService.is2FAcodeValid(
      twoFaCode,
      req.user as User,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('wrong authentication code');
    }
    await this.usersService.turnOn2FA(req.user['id']);
  }
}
