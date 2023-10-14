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
    private jwtService: JwtService, // private config: ConfigService
  ) {}

  async validateUser(profile: any): Promise<any> {
    console.log('______________________validate_USER_____________________');
    // console.log("login: ", profile)
    console.log('VALID_PROFIL: ', profile._json.image.link);
    const user = await this.prisma.user.upsert({
      where: {
        name: profile.username,
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
      const token = await this.signToken({ id: user.id });
      return { token, user };
    }
    console.log('User not validated');
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

  /**********************************************************************************************/
  /*                                    LOGIN FUNCTIONS                                         */
  /**********************************************************************************************/

  // async login()

  // async signup(dto: AuthDto) {
  //     const hash = await argon.hash(dto.password);

  //     try {
  //         const user = await this.prisma.user.create({
  //             data: {
  //                 email: dto.email,
  //                 hash,
  //             },
  //         });
  //         return console.log("SIGNED UP");
  //     } catch (error) {
  //         if (error instanceof PrismaClientKnownRequestError) {
  //             if (error.code === 'P2002') {
  //                 throw new ForbiddenException('Credentials taken');
  //             }
  //         }
  //         throw error;
  //     }
  // }

  // async signin(dto: AuthDto) {
  //     //find the user by email
  //     const user = await this.prisma.user.findUnique({
  //         where: {
  //             email: dto.email,
  //         },
  //     });
  //     //if user doesn't exist throw exception
  //     if (!user) throw new ForbiddenException('Credentials incorrect');

  //     //compare password
  //     const pwMatches = await argon.verify(user.hash, dto.password);
  //     //if password doesn't match throw exception
  //     if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

  //     return console.log("SIGNED IN");
  // }
}
