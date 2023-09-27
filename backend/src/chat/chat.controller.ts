import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { MyGateway } from 'src/gateway/gateway';
import { Socket } from 'socket.io-client';
import { join } from 'path';
import { timer } from 'rxjs';

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

        // console.log('socket.io: emit updateChanList')
        // this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());

        const foundedUser = await this.prismaService.user.findFirst({
            where: {
                name: data.username,
            },
        });
        if (foundedUser) {
            setTimeout(async () => {
                this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
            }, 100); // Délai de 100 millisecondes
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
            setTimeout(async () => {
                this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
            }, 100); // Délai de 100 millisecondes
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
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
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
            setTimeout(async () => {
                this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
            }, 100); // Délai de 100 millisecondes
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
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
        return newMessageReply;
    }

    @Post('destroyChannelRequest')
    async destroyChannel(@Body() data: { channelID: number }) {
        console.log('requete: destroy channel');
        const channelToDestroy = await this.chatService.findChannelById(data.channelID);
        const tmp = channelToDestroy.id;
        this.chatService.destroyChannel(channelToDestroy);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
        return 1;
    }

    @Post('leaveChannelRequest')
    async leaveChannel(@Body() data: { userID: number, channelID: number }) {
        console.log('requete: leave channel');
        const channelToLeave = await this.chatService.findChannelById(data.channelID);
        const userLeaving = await this.chatService.findUserById(data.userID);
        this.chatService.removeUserFromChannel(userLeaving, channelToLeave);
        this.chatService.removeUserAdmin(channelToLeave, userLeaving.id);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
        return 1;
    }
    @Post('editChannelRequest')
    async editChannel(@Body() data: {channelID: number, newChannelName: string, newChannelType: string, newChannelPassword: string}) {
        console.log('requete: change channel name');
        const channelToEdit = await this.chatService.findChannelById(data.channelID);
        this.chatService.editChannel(channelToEdit, data.newChannelName, data.newChannelType, data.newChannelPassword);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
    }

    @Post('makeUserAdminRequest')
    async makeUserAdmin(@Body() data: {channelID: number, newAdminID: number}) {
        console.log('requete: set user admin');
        const channel = await this.chatService.findChannelById(data.channelID);
        this.chatService.setUserAdmin(channel, data.newAdminID);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
    }
    @Post('removeUserAdminRequest')
    async removeUserAdmin(@Body() data: {channelID: number, removedAdminID: number}) {
        console.log('requete: remove user admin');
        const channel = await this.chatService.findChannelById(data.channelID);
        this.chatService.removeUserAdmin(channel, data.removedAdminID);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
    }
    @Post('muteUserRequest')
    async muteUser(@Body() data: {channelID: number, userID: number, timer: number}) {
        console.log('requete: mute User');
        const channel = await this.chatService.findChannelById(data.channelID);
        this.chatService.setUserMute(channel, data.userID);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
        setTimeout(async () => {
            this.chatService.removeUserMute(channel, data.userID);
        }, (data.timer * 60000))
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, (data.timer * 60000) + 100); // Délai de 100 millisecondes
    }
    @Post('unmuteUserRequest')
    async unmuteUser(@Body() data: {channelID: number, userID: number, timer: number}) {
        console.log('requete: set user admin');
        const channel = await this.chatService.findChannelById(data.channelID);
        this.chatService.removeUserMute(channel, data.userID);
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, 100); // Délai de 100 millisecondes
    }
}
