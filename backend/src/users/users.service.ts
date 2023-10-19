import { Injectable } from '@nestjs/common';
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

  async turnOff2FA(userID: number) {
    return this.prismaService.user.update({
      where: {
        id: userID,
      },
      data: {
        twoFaActivated: false,
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
