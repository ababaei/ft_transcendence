import { Injectable } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  generateSecretKey(): string {
    const buffer = speakeasy.generateSecret({ length: 20 });
    const secretKey = buffer.base32;
    return secretKey;
  }

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
        twoFaSecret: '',
      },
    });
  }

  async addGame(game: Game, id: number): Promise<User> {
    return this.prismaService.user.update({
      where: { id: id },
      data: {
        games: {
          connect: {
            id: game.id,
          },
        },
      },
    });
  }

  async findGames(id: number): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id: id },
      include: { games: true },
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
