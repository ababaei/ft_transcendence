import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { MyGateway } from 'src/gateway/gateway';
import { Socket } from 'socket.io-client';
import { join } from 'path';

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
        console.log('requete: setUsernameRequest', data.username);

        console.log('socket.io: emit updateChanList')
        this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());


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
    @Post('createChannelRequest')
    async handleChannelRequest(@Body() data: {channelName: string, userid: number, mode: string, password: string }){
        console.log('requete: createChannelRequest: ', data.channelName);

        const newChannel = await this.chatService.createNewChannel(data.channelName, data.mode, data.password, data.userid);
        const fromUser = await this.chatService.findUserById(data.userid);

        await this.chatService.addUserInChannel(newChannel, fromUser);

        console.log('socket.io: emit updateChanList')
        await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());

        return newChannel;
    }

    @Post('joinChannelRequest')
    async handleJoinChannelRequest(@Body() data: {channelID: number, userID: number, password: string}) {
        console.log('Join channel Request');
        const fromUser = await this.chatService.findUserById(data.userID);
        const joinedChannel = await this.chatService.findChannelById(data.channelID);

        if (joinedChannel.mode === 'protected' && data.password != joinedChannel.password) {
                return null;
        }
        else {
            await this.chatService.addUserInChannel(joinedChannel, fromUser);
            await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
            // await this.gateway.server.emit('updateChannelUserList', joinedChannel, fromUser);
            return fromUser;
        }
    }
    
    @Post('messageRequest')
    async handleMessageRequest(@Body() data: {text: string, user: number, channel: number}) {
        console.log('Message request');
        const fromUser = await this.chatService.findUserById(data.user);
        const inChannel = await this.chatService.findChannelById(data.channel);
        const newMessage = await this.chatService.createMessage(inChannel, fromUser, data.text);

        const newMessageReply = await this.chatService.findMessageById(newMessage.id);
        await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        // await this.gateway.server.emit('newMessage', newMessageReply);
        return newMessageReply;
    }

    @Post('destroyChannelRequest')
    async destroyChannel(@Body() data: { channelID: number }) {
        console.log('requete: destroy channel');
        const channelToDestroy = await this.chatService.findChannelById(data.channelID);
        const tmp = channelToDestroy.id;
        this.chatService.destroyChannel(channelToDestroy);
        await this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        this.gateway.server.emit('channelHasBeenDestroyed', tmp);
        return 1;
    }

    @Post('leaveChannelRequest')
    async leaveChannel(@Body() data: { userID: number, channelID: number }) {
        console.log('requete: leave channel');
        const channelToLeave = await this.chatService.findChannelById(data.channelID);
        const userLeaving = await this.chatService.findUserById(data.userID);
        this.chatService.removeUserFromChannel(userLeaving, channelToLeave);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
            this.gateway.server.emit('userLeavedChannel', data.userID, data.channelID);
        }, 100); // Délai de 100 millisecondes
        return 1;
    }
    @Post('changeChannelNameRequest')
    async changeChannelName(@Body() data: {channelID: number, newChannelName: string, newChannelType: string, newChannelPassword: string}) {
        console.log('requete: change channel name');
        const channelToEdit = await this.chatService.findChannelById(data.channelID);
        this.chatService.editChannel(channelToEdit, data.newChannelName, data.newChannelType, data.newChannelPassword);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
    }

    @SubscribeMessage('chatbox')
    async chatboxMessage(chatboxId: number) {
        console.log('chatchat');
        await this.gateway.server.emit('updateChatbox', await this.chatService.findChannelById(chatboxId));
    }
}
