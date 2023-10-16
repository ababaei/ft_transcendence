import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toDataURL, toFileStream } from 'qrcode';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(private readonly usersService: UsersService) {}

  public async generate2FAsecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.email,
      process.env['TWO_FACTOR_APP_NAME'],
      secret,
    );

    await this.usersService.saveSecretKey(secret, user.id);

    return {
      secret,
      otpauthUrl,
    };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public is2FAcodeValid(twoFaCode: string, user: User) {
    return authenticator.verify({
      token: twoFaCode,
      secret: user.twoFaSecret,
    });
  }
}
