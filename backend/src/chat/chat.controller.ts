import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { MyGateway } from 'src/gateway/gateway';


@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService : ChatService,
        private prismaService : PrismaService,
        private gateway: MyGateway,
    ) {}
    @WebSocketServer()
    server: Server;
    
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
        await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());

        return ;
    }
    @Post('channelRequest')
    async handleChannelRequest(@Body() data: {channel: string, userid: number}){
        console.log('handle channel request')
        const channelReq = await this.chatService.findChannelByName(data.channel)
        //console.log(channelReq);
        if (!channelReq) {
            console.log('create new channel');
            this.chatService.createNewChannel(data.channel);
        }
        const fromUser = await this.chatService.findUserById(data.userid);
        const channelRequested = await this.chatService.findChannelByName(data.channel);

        // await this.chatService.addUserInChannel(channelRequested, fromUser);
        // await console.log(await this.prismaService.channel.findMany());
        await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        return channelRequested;
    }
    @Post('messageRequest')
    async handleMessageRequest(@Body() data: {text: string, user: number, channel: number}) {
        console.log('Message request');
        const fromUser = await this.chatService.findUserById(data.user);
        const inChannel = await this.chatService.findChannelById(data.channel);
        const newMessage = await this.chatService.createMessage(inChannel, fromUser, data.text);

        await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        return newMessage;
    }
}
