import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';
import { UsersService } from 'src/users/users.service';
import { Profile } from 'passport-42';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(profile: any): Promise<any> {
    const user = await this.prisma.user.upsert({
      where: {
        email: profile.emails[0].value,
      },
      update: {},
      create: {
        name: profile.username,
        email: profile.emails[0].value,
        avatar: profile._json.image.link,
      },
    });
    if (user) {
      console.log('User validated: ', user.id);
      const token = await this.signToken({
        id: user.id,
        twoFaAuthenticated: false,
      });
      return { token, user };
    }
    // console.log('User not validated');
    return null;
  }

  async signToken(payload: any): Promise<any> {
    const secret = process.env.JWT_KEY;
    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: secret,
    });
    return token;
  }
}
