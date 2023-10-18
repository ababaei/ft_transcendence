import { Injectable } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import * as speakeasy from 'speakeasy';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
  ) {}

  generateSecretKey(): string {
    const buffer = speakeasy.generateSecret({ length: 20 });
    const secretKey = buffer.base32;
    return secretKey;
  }

  saveSecretKey(userID: string, key: string) {
    
  }

  async addGame(game: Game, user: User): Promise<User>{
    return this.prisma.user.update({
        where: {id: user.id},
        data: {
            games: {
                connect: {
                    id: game.id
                }
            }
        }
    });
}
}