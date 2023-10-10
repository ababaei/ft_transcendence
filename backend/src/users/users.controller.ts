import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('users')
export class UsersController {
    constructor(
        private prismaService: PrismaService
    ) {}

    @Get('test')
    test() {
        console.log('THIS IS A TEST0');
    }

    @Get('/:id')
    async getUser(@Param() params: {id: string}) {
        console.log("__________________GETTING USER_______________")
        const userID: number = Number(params.id)
        const user = await this.prismaService.user.findFirst({
            where: {id: userID}
        })
        console.log(user);
        return user;
    }
}