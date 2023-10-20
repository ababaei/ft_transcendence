import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
  ) {}

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

  public async is2FAcodeValid(twoFaCode: string, user: User) {
    const db_user = await this.prismaService.user.findUnique({
      where: {
        id: user.id,
      },
    });
    const res = authenticator.verify({
      token: twoFaCode,
      secret: db_user.twoFaSecret,
    });
    return res;
  }
}
