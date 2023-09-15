import { Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService : ChatService,
        private readonly prismaService : PrismaService
    ) {}
    

    @Post('buttonTest') // /chat/test
    getButtonTest(): string {
        console.log('je recois une requete');
        return this.chatService.buttonTestReq();
    }
    @Post('setUsername')
    handleUsername() {

    }
}
