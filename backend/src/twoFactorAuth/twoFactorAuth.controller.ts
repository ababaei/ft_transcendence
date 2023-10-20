import {
  Body,
  Controller,
  Get,
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
import { AuthService } from 'src/auth/auth.service';
import { Jwt2faGuard } from 'src/auth/guards/jwt2fa.guard';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorService: TwoFactorAuthService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('generate')
  @UseGuards(JwtGuard)
  async register(@Res() res: Response, @Req() req: Request) {
    const { otpauthUrl } = await this.twoFactorService.generate2FAsecret(
      req.user as User,
    );
    console.log('OTPURL', otpauthUrl);
    res.setHeader('content-type', 'image/png');
    return this.twoFactorService.pipeQrCodeStream(res, otpauthUrl);
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async turnOn2FA(
    @Req() req: Request,
    @Res() res: Response,
    @Body() { twoFaCode }: TwoFaCodeDto,
  ) {
    console.log('TURNON', twoFaCode);
    const isCodeValid = await this.twoFactorService.is2FAcodeValid(
      twoFaCode,
      req.user as User,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('wrong authentication code');
    }
    console.log(req.cookies.userData);
    const { token, user } = JSON.parse(req.cookies.userData);
    console.log('TOKEN', token);
    console.log('USER', user);
    user.twoFaActivated = true;
    console.log('USER2', user);
    await this.usersService.turnOn2FA(req.user['id']);
    res.cookie('userData', JSON.stringify({ token, user }), { secure: false });
    return res.status(200).json({ message: '2 fa turned on' });
  }

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtGuard)
  async authenticate(
    @Req() req: Request,
    @Res() res: Response,
    @Body() { twoFaCode }: TwoFaCodeDto,
  ) {
    console.log('AUTHBACKUSER', req.user);
    const isCodeValid = await this.twoFactorService.is2FAcodeValid(
      twoFaCode,
      req.user as User,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('wrong authentication code');
    }
    console.log('VALID', isCodeValid, twoFaCode);
    const token = await this.authService.signToken({
      id: req.user['id'],
      twoFaAuthenticated: true,
    });
    const user = req.user as User;
    res.cookie('userData', JSON.stringify({ token, user }), { secure: false });
    return res
      .status(200)
      .json({ message: 'successfully 2 factor authenticated' });
  }

  @Get('disable')
  @HttpCode(200)
  @UseGuards(Jwt2faGuard)
  async disable(@Req() req: Request, @Res() res: Response) {
    console.log('----DISABLING 2FA----');
    await this.usersService.turnOff2FA(req.user['id']);
    const user = req.user as User;
    user.twoFaActivated = false;
    user.twoFaSecret = '';
    const token = await this.authService.signToken({
      id: user.id,
      twoFaAuthenticated: false,
    });
    res.cookie('userData', JSON.stringify({ token, user }), {
      secure: false,
    });
    return res.status(200).json({ message: '2FA has been deactivated' });
  }
}
