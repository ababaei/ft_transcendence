import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { MyGateway } from 'src/gateway/gateway';
import { error } from 'console';

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
        this.gateway.server.emit('updateUsersList', await this.chatService.getUsersList());

        const foundedUser = await this.prismaService.user.findFirst({
            where: {
                name: data.username,
            },
        });
        if (foundedUser) {
            setTimeout(async () => {
                this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
                this.gateway.server.emit('updateUsersList', await this.chatService.getUsersList());
            }, 100); // Délai de 100 millisecondes
            return { userid: foundedUser.id, username: foundedUser.name };
        }
        else {
            console.log('create new user', data.username)
            try {
            const newUser = await this.prismaService.user.create({
                data: {
                    email: data.username,
                    name: data.username,
                },
            });
            setTimeout(async () => {
                this.gateway.server.emit('updateUsersList', await this.chatService.getUsersList());
                this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
                this.gateway.server.emit('logUser', newUser)
            }, 100); // Délai de 100 millisecondes
            return {userid: newUser.id, username: newUser.name }
        } catch { console.log('error while creating new user')}
        }
        return ;
    }
    @Post('createChannelRequest')
    async handleChannelRequest(@Body() data: {channelName: string, userid: number, mode: string, password: string }){
        console.log('requete: createChannelRequest: ', data.channelName);
        try {
            if (!data.channelName || !data.userid || !data.mode ) { return 1 }

            const newChannel = await this.chatService.createNewChannel(data.channelName, data.mode, data.password, data.userid, false);
            const fromUser = await this.chatService.findUserById(data.userid);
            if (!newChannel || !fromUser) { throw error } 

            const ret = await this.chatService.addUserInChannel(newChannel, fromUser);

            this.sendUploadedData();

            return ('backend: channel created');
        }
        catch {
            console.log('error: create channel')
            return ('backend: error creating channel')
        }
    }

    @Post('joinChannelRequest')
    async handleJoinChannelRequest(@Body() data: {channelID: number, userID: number, password: string}) {
        console.log('Join channel Request');
        try {
            const fromUser = await this.chatService.findUserById(data.userID);
            const joinedChannel = await this.chatService.findChannelById(data.channelID);

            if (joinedChannel.mode === 'protected' && data.password != joinedChannel.password) {
                    return 'backend: wrong password';
            }
            else {
                await this.chatService.addUserInChannel(joinedChannel, fromUser);
                this.sendUploadedData();
                return 'backend: channel joined'
            }
        } 
        catch {
            console.log('error: join channel')
            return 'backend: failed to join channel'
        }
    }
    
    @Post('messageRequest')
    async handleMessageRequest(@Body() data: {text: string, user: number, channel: number}) {
        console.log('Message request');
        try {
            const fromUser = await this.chatService.findUserById(data.user);
            const inChannel = await this.chatService.findChannelById(data.channel);
            const newMessage = await this.chatService.createMessage(inChannel, fromUser, data.text);

            const newMessageReply = await this.chatService.findMessageById(newMessage.id);
            this.sendUploadedData()
            return 'backend: new message uploaded';
        }
        catch {
            console.log('Error handling new message')
            return ('backend: error with new message');
        }
    }

    @Post('destroyChannelRequest')
    async destroyChannel(@Body() data: { channelID: number }) {
        console.log('requete: destroy channel');
        try {
            const channelToDestroy = await this.chatService.findChannelById(data.channelID);
            const tmp = channelToDestroy.id;
            this.chatService.destroyChannel(channelToDestroy);
            this.sendUploadedData();
            return 'backend: channel destroyed';
        }
        catch {
            console.log('destroy channel : error')
            return ('backend: error while destroying channel');
        }
    }

    @Post('leaveChannelRequest')
    async leaveChannel(@Body() data: { userID: number, channelID: number }) {
        try {
            console.log('requete: leave channel');
            const channelToLeave = await this.chatService.findChannelById(data.channelID);
            const userLeaving = await this.chatService.findUserById(data.userID);
            this.chatService.removeUserFromChannel(userLeaving, channelToLeave);
            this.chatService.removeUserAdmin(channelToLeave, userLeaving.id);
            this.sendUploadedData();
            return 'backend: channel leaved';
        }
        catch {
            console.log('error: leave channel');
            return 'backend: error while leaving channel';
        }
    }
    @Post('editChannelRequest')
    async editChannel(@Body() data: {channelID: number, newChannelName: string, newChannelType: string, newChannelPassword: string}) {
        try {
            console.log('requete: change channel name');
            const channelToEdit = await this.chatService.findChannelById(data.channelID);
            this.chatService.editChannel(channelToEdit, data.newChannelName, data.newChannelType, data.newChannelPassword);
            this.sendUploadedData();
            return 'backend: channel edited';
        }
        catch {
            console.log('error: edit channel')
            return 'backend: error while editing channel';
        }
    }

    @Post('makeUserAdminRequest')
    async makeUserAdmin(@Body() data: {channelID: number, newAdminID: number}) {
        try {
            console.log('requete: set user admin');
            const channel = await this.chatService.findChannelById(data.channelID);
            this.chatService.setUserAdmin(channel, data.newAdminID);
            this.sendUploadedData();
            return 'backend: user mode set to admin'
        }
        catch {
            console.log('error: make user admin');
            return 'backend: error while making user administrator';
        }
    }
    @Post('removeUserAdminRequest')
    async removeUserAdmin(@Body() data: {channelID: number, removedAdminID: number}) {
        try {
            console.log('requete: remove user admin');
            const channel = await this.chatService.findChannelById(data.channelID);
            this.chatService.removeUserAdmin(channel, data.removedAdminID);
            this.sendUploadedData();
            return 'backend: user removed from administartors';
        }
        catch {
            console.log('error: removing administartor');
            return 'backend: error removing user administartor';
        }
    }
    @Post('muteUserRequest')
    async muteUser(@Body() data: {channelID: number, userID: number, timer: number}) {
        console.log('requete: mute User');
        const channel = await this.chatService.findChannelById(data.channelID);
        this.chatService.setUserMute(channel, data.userID);
        this.sendUploadedData();
        setTimeout(async () => {
            this.chatService.removeUserMute(channel, data.userID);
        }, (data.timer * 60000))
        setTimeout(async () => {
            this.gateway.server.emit('updateUsersList', await this.chatService.getUsersList());
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
        }, (data.timer * 60000) + 100); // Délai de 100 millisecondes
    }
    @Post('unmuteUserRequest')
    async unmuteUser(@Body() data: {channelID: number, userID: number, timer: number}) {
        try {
            console.log('requete: set user admin');
            const channel = await this.chatService.findChannelById(data.channelID);
            this.chatService.removeUserMute(channel, data.userID);
            this.sendUploadedData();
            return 'backend: user unmuted';
        }
        catch {
            console.log('error: unmuting user');
            return 'backend: error while unmuting user'
        }
    }

    @Post('banUserRequest')
    async banUser(@Body() data: {channelID: number, userID: number, timer: number}) {
        console.log('requete: ban User');
        const channel = await this.chatService.findChannelById(data.channelID);
        this.chatService.setUserBan(channel, data.userID);
        this.sendUploadedData();

        setTimeout(async () => {
            this.chatService.removeUserBan(channel, data.userID);
        }, (data.timer * 60000))
        setTimeout(async () => {
            this.gateway.server.emit('updateChannelList', await this.chatService.getChannelsList());
            this.gateway.server.emit('updateUsersList', await this.chatService.getUsersList());
        }, (data.timer * 60000) + 100); // Délai de 100 millisecondes
    }
    @Post('unbanUserRequest')
    async unbanUser(@Body() data: {channelID: number, userID: number, timer: number}) {
        try {
            console.log('requete: unban user');
            const channel = await this.chatService.findChannelById(data.channelID);
            this.chatService.removeUserBan(channel, data.userID);
            this.sendUploadedData();
            return 'backend: user unbaned';
        }
        catch {
            console.log('error: unbaning user');
            return 'backend: error while unbaning user'
        }
    }

    @Post('addFriendRequest')
    async addFriend(@Body() data: {userID: number, friendID: number}) {
        try {
            console.log('requete: set user admin');
            const user1 = await this.chatService.findUserById(data.userID);
            const user2 = await this.chatService.findUserById(data.friendID);
            const newChannel = await this.chatService.createNewChannel("", "direct", "", 0, true);
            await this.chatService.addUserInChannel(newChannel, user1);
            await this.chatService.addUserInChannel(newChannel, user2);
            this.chatService.addUserInFriends(user1, user2, newChannel.id);

            this.sendUploadedData();
            return 'backend: friend added';
        }
        catch {
            console.log('error: adding friend');
            return 'backend: error while adding friend'
        }
    }
    
    @Post('blockUserRequest')
    async blockUser(@Body() data: {userID: number, blockedID: number}) {
        try {
            console.log('requete: block ');
            const userBlocking = await this.chatService.findUserById(data.userID);
            const userBlocked = await this.chatService.findUserById(data.blockedID);
            this.chatService.setBlockedRelation(userBlocking, userBlocked);

            this.sendUploadedData();
            return 'backend: user blocked';
        }
        catch {
            console.log('error: blocking user');
            return 'backend: error while blocking user'
        }
    }
    @Post('unblockUserRequest')
    async unblockUser(@Body() data: {userID: number, blockedID: number}) {
        try {
            console.log('requete: unblock');
            const userBlocking = await this.chatService.findUserById(data.userID);
            const userBlocked = await this.chatService.findUserById(data.blockedID);
            this.chatService.removeBlockedRelation(userBlocking, userBlocked);

            this.sendUploadedData();
            return 'backend: user unblocked';
        }
        catch {
            console.log('error: unblocking user');
            return 'backend: error while unblocking user'
        }
    }

    sendUploadedData() {
        console.log('socket.io: emit updateChanList')

        setTimeout(async () => {
            try {
                const userList = await this.chatService.getUsersList();
                const channelList = await this.chatService.getChannelsList();
                this.gateway.server.emit('updateUsersList', userList);
                this.gateway.server.emit('updateChannelList', channelList); 
            } catch {
                throw error;
            }
    }, 100); // Délai de 100 millisecondes
    }
}
