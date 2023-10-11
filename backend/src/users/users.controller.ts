import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prismaService: PrismaService) {}

  @Get('/:id') // This should call a user provider functions inside of doing logic here.
  async getUser(@Param() params: { id: string }) {
    console.log('__________________GETTING USER_______________');
    const userID: number = Number(params.id);
    const user = await this.prismaService.user.findFirst({
      where: { id: userID },
    });
    console.log(user);
    return user;
  }
}
