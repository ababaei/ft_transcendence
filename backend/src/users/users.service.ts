import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async turnOn2FA(userID: number) {
    return this.prismaService.user.update({
      where: {
        id: userID,
      },
      data: {
        twoFaActivated: true,
      },
    });
  }

  async saveSecretKey(key: string, userID: number) {
    return this.prismaService.user.update({
      where: {
        id: userID,
      },
      data: {
        twoFaSecret: key,
      },
    });
  }
}
