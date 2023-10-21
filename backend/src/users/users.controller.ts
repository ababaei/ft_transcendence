import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from './users.service';
import { Jwt2faGuard } from 'src/auth/guards/jwt2fa.guard';
import photoUrlDto from './dto/photoUrl.dto';
// import { User } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(
    private prismaService: PrismaService,
    private userService: UsersService,
  ) {}

  @Get()
  async getInfos() {
    return await this.prismaService.user.findMany({});
  }

  // @UseGuards(JwtGuard)
  @Get('/:id') // This should call a user provider functions inside of doing logic here.
  async getUser(@Param() params: { id: string }) {
    // console.log('__________________GETTING USER_______________');
    const userID: number = Number(params.id);
    const user = await this.prismaService.user.findUnique({
      where: { id: userID },
      include: { games: true },
    });
    // console.log(user);
    return user;
  }

  @Put('/:id')
  async updateFA(
    @Param() params: { id: string },
    @Body() body: { active: boolean },
  ) {
    await this.prismaService.user.update({
      where: { id: parseInt(params.id) },
      data: { twoFaActivated: body.active },
    });
  }

  @UseGuards(JwtGuard)
  @Post('enable2FA')
  enable2FA(@Body('userID') userID: string) {
    const secretKey = this.userService.generateSecretKey();
    this.userService.saveSecretKey(secretKey, parseInt(userID));
  }

  @UseGuards(Jwt2faGuard)
  @Put('/:id/update-photo')
  async updatePhoto(
    @Param() params: { id: string },
    @Body() { avatar }: photoUrlDto,
  ) {
    console.log(avatar);
    const url: any = avatar;
    await this.prismaService.user.update({
      where: { id: parseInt(params.id) },
      data: { avatar: url },
    });
  }

  @UseGuards(Jwt2faGuard)
  @Put('/:id/update-pseudo')
  async updatePseudo(
    @Param() params: { id: string },
    @Body() body: { pseudo: string },
  ) {
    // console.log('MAJPSEUDO', body.pseudo)
    try {
      await this.prismaService.user.update({
        where: { id: parseInt(params.id) },
        data: { displayName: body.pseudo },
      });
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(Jwt2faGuard)
  @Get('/:id/update')
  async update(@Param() params: { id: string }) {
    await this.prismaService.user.update({
      where: { id: parseInt(params.id) },
      data: { newUser: false },
    });
  }

  // @UseGuards(JwtGuard)
  // @Post('verify2FA')
  // verify2FA(@Body('userID') userID: string, @Body('otp') otp: string) {
  //   const secretKey = this.userService.getSecretKey();
  //   const isValid = this.userService.verifyOTP(otp, secretKey);
  //   return { isValid };
  // }
}
