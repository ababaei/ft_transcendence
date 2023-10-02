import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('users')
export class UsersController {
    constructor(
        private prismaService: PrismaService
    ) {}

    @Get('users/:id')
    async getUser(@Param() params: {id: number}) {
        const user = await this.prismaService.user.findFirst({
            where: {id: params.id}
        })
        return user;
    }
}