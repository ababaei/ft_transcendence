import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService : ChatService,
        private prismaService : PrismaService
    ) {}
    
    @Post('setUsername')
    async handleUsername(@Body() data: { username: string }) {
        console.log('setUsernameRequest');
        console.log(data.username);
        const foundedUser = await this.prismaService.user.findFirst({
            where: {
                name: data.username,
            },
        });
        if (foundedUser) {
            return { userid: foundedUser.id, username: foundedUser.name };
        }
        else {
            console.log('create new user', data.username)
            try {
            const newUser = await this.prismaService.user.create({
                data: {
                    name: data.username,
                },
            });
            return {userid: newUser.id, username: newUser.name } 
        } catch { console.log('error while creating new user')}
        }
        return ;
    }
}
