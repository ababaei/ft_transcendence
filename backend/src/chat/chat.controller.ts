import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';
import { MyGateway } from 'src/gateway/gateway';
import { error } from 'console';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from '@prisma/client';
import { Request } from 'express';
import { from } from 'rxjs';
import { channel } from 'diagnostics_channel';

const argon2 = require('argon2');

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private prismaService: PrismaService,
    private gateway: MyGateway,
  ) {}
  @WebSocketServer()
  server: Server;

  @Post('createChannelRequest')
  @UseGuards(JwtGuard)
  async handleChannelRequest(
    @Req() req: Request,
    @Body()
    data: {
      channelName: string;
      mode: string;
      password: string;
    },
  ) {
    // console.log('requete: createChannelRequest: ', data.channelName);
    try {
      if (!data.channelName || !data.mode) {
        return 1;
      }
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const hashedPassword = await argon2.hash(data.password);
      const newChannel = await this.chatService.createNewChannel(
        data.channelName,
        data.mode,
        hashedPassword,
        fromUser.id,
        false,
      );
      // const fromUser = await this.chatService.findUserById(cpy.id);
      if (!newChannel || !fromUser) {
        throw error;
      }

      const ret = await this.chatService.addUserInChannel(newChannel, fromUser);
      this.chatService.setUserAdmin(newChannel, fromUser.id);

      this.sendUploadedData();

      return 'backend: channel created';
    } catch {
      // console.log('error: create channel');
      return 'backend: error creating channel';
    }
  }

  @Post('joinChannelRequest')
  @UseGuards(JwtGuard)
  async handleJoinChannelRequest(
    @Req() req: Request,
    @Body() data: { channelID: number; userID: number; password: string },
  ) {
    // console.log('Join channel Request');
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const joinedChannel = await this.chatService.findChannelById(
        data.channelID,
      );

      if (
        (await this.chatService.isBan(fromUser.id, joinedChannel)) ||
        (await this.chatService.isUserInChannel(fromUser.id, joinedChannel) ||
        joinedChannel.mode == 'private' ||
        joinedChannel.isDirect)
      ) {
        return 'backend: you cant join this channel';
      }
      const isPasswordCorrect = await argon2.verify(joinedChannel.password, data.password);
      if (
        joinedChannel.mode === 'protected' &&
        !isPasswordCorrect
      ) {
        return 'backend: wrong password';
      } else {
        await this.chatService.addUserInChannel(joinedChannel, fromUser);
        this.sendUploadedData();
        return 'backend: channel joined';
      }
    } catch {
      // console.log('error: join channel');
      return 'backend: failed to join channel';
    }
  }

  @Post('messageRequest')
  @UseGuards(JwtGuard)
  async handleMessageRequest(
    @Req() req: Request,
    @Body() data: { text: string; channel: number },
  ) {
    // console.log('Message request');
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const inChannel = await this.chatService.findChannelById(data.channel);

      if (
        (await !this.chatService.isUserInChannel(fromUser.id, inChannel)) ||
        (await this.chatService.isMute(fromUser.id, inChannel))
      ) {
        return 'backend: you are not allowed to speak in this channel';
      }
      const newMessage = await this.chatService.createMessage(
        inChannel,
        fromUser,
        data.text,
      );
      let notifContent: string;
      if (!inChannel.isDirect) {
        notifContent = 'message from ' + fromUser.name + ' to ' + inChannel.name
      }
      else {
        notifContent = 'new message from ' + fromUser.name;
      }

      const notif = await this.chatService.createNotification(
        inChannel.users,
        'message',
        notifContent,
        fromUser.id,
        inChannel.id
      );

      this.sendUploadedData();
      return 'backend: new message uploaded';
    } catch {
      // console.log('Error handling new message');
      return 'backend: error with new message';
    }
  }

  @Post('directMessageRequest')
  @UseGuards(JwtGuard)
  async handleDirectMessageRequest(
    @Req() req: Request,
    @Body() data: { target: string; text: string },
  ) {
    // console.log('Direct Message request');
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const toUser = await this.chatService.findUserByName(data.target);

      if (!fromUser || !toUser) {
        return 'backend: User not found';
      }
      if (fromUser.id === toUser.id) {
        return 'backend: cant send a direct message to yourself';
      }
      let newChannel = await this.chatService.findDirectChannelByUserIds(fromUser.id, toUser.id);
      // console.log(newChannel);
      if (!newChannel) {
        newChannel = await this.chatService.createNewChannel('', 'direct', '', 0, true);
        await this.chatService.addUserInChannel(newChannel, fromUser);
        await this.chatService.addUserInChannel(newChannel, toUser);
        // console.log(newChannel);
      }
      // console.log(newChannel);
      const newMessage = await this.chatService.createMessage(
        newChannel,
        fromUser,
        data.text,
      );

      let notifContent = fromUser.name + ' sent you a message !'
      const notif = await this.chatService.createNotification(
        [toUser],
        'message',
        notifContent,
        fromUser.id,
        newChannel.id
      );

      this.sendUploadedData();
      return (newChannel);
    } catch {
      // console.log('Error handling new message');
      return 'backend: error with new message';
    }
  }

  @Post('destroyChannelRequest')
  @UseGuards(JwtGuard)
  async destroyChannel( @Req() req: Request, @Body() data: { channelID: number }) {
    // console.log('requete: destroy channel');
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channelToDestroy = await this.chatService.findChannelById(
        data.channelID,
      );

      if (fromUser.id !== channelToDestroy.ownerID) {
        return 'backend: you must be channel owner to destroy this channel';
      }
      this.chatService.destroyChannel(channelToDestroy);
      this.sendUploadedData();
      return 'backend: channel destroyed';
    } catch {
      // console.log('destroy channel : error');
      return 'backend: error while destroying channel';
    }
  }

  @Post('leaveChannelRequest')
  @UseGuards(JwtGuard)
  async leaveChannel(@Req() req: Request, @Body() data: { channelID: number }) {
    try {
      // console.log('requete: leave channel');
      const channelToLeave = await this.chatService.findChannelById(
        data.channelID,
      );
      // if (channelToLeave.isDirect) {
      //   return 'cant leave a direct conversation';
      // }
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      this.chatService.removeUserFromChannel(fromUser, channelToLeave);
      this.chatService.removeUserAdmin(channelToLeave, fromUser.id);
      if (!channelToLeave.users || channelToLeave.isDirect) {
        this.chatService.destroyChannel(channelToLeave);
      }
      this.sendUploadedData();
      return 'backend: channel leaved';
    } catch {
      // console.log('error: leave channel');
      return 'backend: error while leaving channel';
    }
  }
  @Post('editChannelRequest')
  @UseGuards(JwtGuard)
  async editChannel(
    @Req() req: Request, 
    @Body()
    data: {
      channelID: number;
      newChannelName: string;
      newChannelType: string;
      newChannelPassword: string;
    },
  ) {
    try {
      // console.log('requete: edit channel request');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channelToEdit = await this.chatService.findChannelById(
        data.channelID,
      );
      if (channelToEdit.isDirect) {
        return 'backend: cant do whatever youre trying to do in a direct conversion';
      }
      if (fromUser.id !== channelToEdit.ownerID) {
        return 'backend: you must be channel owner to edit this channel';
      }
      this.chatService.editChannel(
        channelToEdit,
        data.newChannelName,
        data.newChannelType,
        data.newChannelPassword,
      );
      this.sendUploadedData();
      return 'backend: channel edited';
    } catch {
      // console.log('error: edit channel');
      return 'backend: error while editing channel';
    }
  }

  @Post('makeUserAdminRequest')
  @UseGuards(JwtGuard)
  async makeUserAdmin(
    @Req() req: Request, 
    @Body() data: { channelID: number; newAdminID: number },
  ) {
    try {
      // console.log('requete: set user admin');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channel = await this.chatService.findChannelById(data.channelID);

      if (channel.isDirect) {
        return 'backend: cant do whatever youre trying to do in a direct conversion';
      }
      if (fromUser.id !== channel.ownerID) {
        return 'backend: you must be channel owner to make a user admin';
      }
      this.chatService.setUserAdmin(channel, data.newAdminID);
      this.sendUploadedData();
      return 'backend: user mode set to admin';
    } catch {
      // console.log('error: make user admin');
      return 'backend: error while making user administrator';
    }
  }
  @Post('removeUserAdminRequest')
  @UseGuards(JwtGuard)
  async removeUserAdmin(@Req() req: Request, @Body() data: { channelID: number; removedAdminID: number }) {
    try {
      // console.log('requete: remove user admin');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channel = await this.chatService.findChannelById(data.channelID);

      if (channel.isDirect) {
        return 'backend: cant do whatever youre trying to do in a direct conversion';
      }
      if (fromUser.id !== channel.ownerID) {
        return 'backend: you must be channel owner to remove a user admin';
      }
      this.chatService.removeUserAdmin(channel, data.removedAdminID);
      this.sendUploadedData();
      return 'backend: user removed from administrators';
    } catch {
      // console.log('error: removing administartor');
      return 'backend: error removing user administrator';
    }
  }

  @Post('kickUserRequest')
  @UseGuards(JwtGuard)
  async kickUser(
    @Req() req: Request, 
    @Body()
    data: {
      channelID: number;
      userID: number;
    },
  ) {
    try {
      // console.log('requete: kick User');
      const channel = await this.chatService.findChannelById(data.channelID);
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const userKicked = await this.chatService.findUserById(data.userID);

      if (channel.isDirect) {
        return 'backend: cant do whatever youre trying to do in a direct conversion';
      }
      if (
        (await !this.chatService.isAdmin(fromUser.id, channel)) ||
        (await this.chatService.isAdmin(data.userID, channel)) ||
        data.userID === channel.ownerID) {
        return 'backend: cant kick user';
      }
      this.chatService.removeUserFromChannel(userKicked, channel);
      this.sendUploadedData();
      return 'backend: user kicked';
    } catch {
      // console.log('error: kick user');
      return 'backend: failed to kick user';
    }
  }

  @Post('muteUserRequest')
  @UseGuards(JwtGuard)
  async muteUser(
    @Req() req: Request, 
    @Body()
    data: {
      channelID: number;
      userID: number;
      timer: number;
    },
  ) {
    // console.log('requete: mute User');
    const channel = await this.chatService.findChannelById(data.channelID);
    const fromUser = await this.chatService.findUserById((req.user as User).id);

    if (channel.isDirect) {
      return 'backend: cant do whatever youre trying to do in a direct conversion';
    }
    if (
      (await !this.chatService.isAdmin(fromUser.id, channel)) ||
      (await this.chatService.isAdmin(data.userID, channel)) ||
      data.userID === channel.ownerID
    ) {
      return 'backend: cant mute user';
    }
    this.chatService.setUserMute(channel, data.userID);
    this.sendUploadedData();
    setTimeout(async () => {
      this.chatService.removeUserMute(channel, data.userID);
    }, data.timer * 60000);
    setTimeout(
      async () => {
        this.gateway.server.emit(
          'updateUsersList',
          await this.chatService.getUsersList(),
        );
        this.gateway.server.emit(
          'updateChannelList',
          await this.chatService.getChannelsList(),
        );
      },
      data.timer * 60000 + 100,
    ); // Délai de 100 millisecondes
  }
  @Post('unmuteUserRequest')
  @UseGuards(JwtGuard)
  async unmuteUser(
    @Req() req: Request, 
    @Body()
    data: {
      channelID: number;
      userID: number;
      timer: number;
    },
  ) {
    try {
      // console.log('requete: set user admin');
      const channel = await this.chatService.findChannelById(data.channelID);
      const fromUser = await this.chatService.findUserById((req.user as User).id);

      if (channel.isDirect) {
        return 'backend: cant do whatever youre trying to do in a direct conversion';
      }
      if (await !this.chatService.isAdmin(fromUser.id, channel)) {
        return 'backend: cant unmute user';
      }
      this.chatService.removeUserMute(channel, data.userID);
      this.sendUploadedData();
      return 'backend: user unmuted';
    } catch {
      // console.log('error: unmuting user');
      return 'backend: error while unmuting user';
    }
  }

  @Post('banUserRequest')
  @UseGuards(JwtGuard)
  async banUser(
    @Req() req: Request, 
    @Body()
    data: {
      channelID: number;
      userID: number;
      timer: number;
    },
  ) {
    // console.log('requete: ban User');
    const channel = await this.chatService.findChannelById(data.channelID);
    const fromUser = await this.chatService.findUserById((req.user as User).id);

    if (channel.isDirect) {
      return 'backend: cant do whatever youre trying to do in a direct conversion';
    }
    if (
      (await !this.chatService.isAdmin(fromUser.id, channel)) ||
      (await this.chatService.isAdmin(data.userID, channel)) ||
      data.userID === channel.ownerID
    ) {
      return 'backend: cant ban user';
    }
    this.chatService.setUserBan(channel, data.userID);
    this.sendUploadedData();

    setTimeout(async () => {
      this.chatService.removeUserBan(channel, data.userID);
    }, data.timer * 60000);
    setTimeout(
      async () => {
        this.gateway.server.emit(
          'updateChannelList',
          await this.chatService.getChannelsList(),
        );
        this.gateway.server.emit(
          'updateUsersList',
          await this.chatService.getUsersList(),
        );
      },
      data.timer * 60000 + 100,
    ); // Délai de 100 millisecondes
  }
  @Post('unbanUserRequest')
  @UseGuards(JwtGuard)
  async unbanUser(
    @Req() req: Request, 
    @Body()
    data: {
      channelID: number;
      userID: number;
      timer: number;
    },
  ) {
    try {
      // console.log('requete: unban user');
      const channel = await this.chatService.findChannelById(data.channelID);
      const fromUser = await this.chatService.findUserById((req.user as User).id);

      if (channel.isDirect) {
        return 'backend: cant do whatever youre trying to do in a direct conversion';
      }
      if (await !this.chatService.isAdmin(fromUser.id, channel)) {
        return 'backend: cant unmute user';
      }
      this.chatService.removeUserBan(channel, data.userID);
      this.sendUploadedData();
      return 'backend: user unbaned';
    } catch {
      // console.log('error: unbaning user');
      return 'backend: error while unbaning user';
    }
  }

  @Post('addFriendRequest')
  @UseGuards(JwtGuard)
  async addFriend(@Req() req: Request, @Body() data: { friendName: string }) {
      try {
          // console.log('Request: Add friend');
          const fromUser = await this.chatService.findUserById((req.user as User).id);
          const user2 = await this.chatService.findUserByName(data.friendName);
          if (!user2) {
            return 'backend: user not found'
          }
          if (fromUser.id === user2.id) {
            return 'backend: user is you'
          }
          if (await this.chatService.isBlocked(user2, fromUser)) {
            return 'backend: this user dont want to be your friend'
          }
          if (await this.chatService.isFriend(fromUser, user2)) {
            return 'backend: users already friends'
          }
          await this.chatService.removeUserFromBlocked(fromUser, user2);
          const newChannel = await this.chatService.createNewChannel('', 'direct', '', 0, true);
          await this.chatService.addUserInChannel(newChannel, fromUser);
          await this.chatService.addUserInChannel(newChannel, user2);
          await this.chatService.addUserInFriends(fromUser, user2, newChannel.id);
  
          this.sendUploadedData();
          return 'Backend: Friend added';
      } catch (error) {
          // console.log('Error: Adding friend', error);
          return 'Backend: Error while adding friend';
      }
  }

  @Post('blockUserRequest')
  @UseGuards(JwtGuard)
  async blockUser(@Req() req: Request, @Body() data: { blockedName: string}) {
    try {
      // console.log('Method: blockUser');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const userBlocked = await this.chatService.findUserByName(data.blockedName);
      const channelToDestroy = await this.chatService.findDirectChannelByUserIds(fromUser.id, userBlocked.id);
  
      if (!userBlocked) {
        return 'backend: user not found';
      }
      if (userBlocked.id === fromUser.id) {
        return 'backend: cant block yourself';
      }
      if (await this.chatService.isBlocked(fromUser, userBlocked)) {
        return 'backend: user already blocked';
      }
      if (channelToDestroy) {
        await this.chatService.destroyChannel(channelToDestroy);
      }
      await this.chatService.removeUserFromFriends(fromUser, userBlocked);
      await this.chatService.addUserInBlockedList(userBlocked, fromUser);
  
      this.sendUploadedData(); // Mettez à jour les données pour les clients.
  
      return 'backend: user blocked';
    } catch (error) {
      // console.log('Error: blocking user', error);
      return 'backend: error while blocking user';
    }
  }

  @Post('unblockUserRequest')
  @UseGuards(JwtGuard)
  async unblockUser(@Req() req: Request, @Body() data: { unblockedId: number }) {
    try {
      // console.log('Method: unblockUser');
      // console.log(data.unblockedId)
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const userUnblocked = await this.chatService.findUserById(data.unblockedId);
  
      if (!userUnblocked) {
        return 'backend: user not found';
      }
      if (userUnblocked.id === fromUser.id) {
        return 'backend: you cannot unblock yourself';
      }
      if (!await this.chatService.isBlocked(fromUser, userUnblocked)) {
        return 'backend: user is not blocked';
      }
  
      await this.chatService.removeUserFromBlocked(fromUser, userUnblocked);
  
      this.sendUploadedData(); // Mettez à jour les données pour les clients.
  
      return 'backend: user unblocked';
    } catch (error) {
      // console.log('Error: unblocking user', error);
      return 'backend: error while unblocking user';
    }
  }

  @Post('removeFriendRequest')
  @UseGuards(JwtGuard)
  async rmoveFriendUser(@Req() req: Request, @Body() data: { removedFriendId: number }) {
    try {
      // console.log('Method: remove Friend');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const removedFriend = await this.chatService.findUserById(data.removedFriendId);
      const channelToDestroy = await this.chatService.findDirectChannelByUserIds(fromUser.id, removedFriend.id);
  
      if (!removedFriend) {
        return 'backend: user not found';
      }
      if (removedFriend.id === fromUser.id) {
        return 'backend: you cannot do what ever you try to do to yourself';
      }
      if (!await this.chatService.isFriend(fromUser, removedFriend)) {
        return 'backend: user is not your friend :\'(';
      }
      if (channelToDestroy) {
        await this.chatService.destroyChannel(channelToDestroy);
      }
      await this.chatService.removeUserFromFriends(fromUser, removedFriend);
  
      this.sendUploadedData(); // Mettez à jour les données pour les clients.
  
      return 'backend: user unfriended';
    } catch (error) {
      // console.log('Error: unblocking user', error);
      return 'backend: error while unfriending user';
    }
  }

  @Post('getMessageList')
  @UseGuards(JwtGuard)
  async getListMessage(@Req() req: Request, @Body() data: { channelID: number }) {
    const fromUser = await this.chatService.findUserById((req.user as User).id);
    const channel = await this.chatService.findChannelById(data.channelID);

    if (! await this.chatService.isUserInChannel(fromUser.id, channel)) {
      return 'backend: youre not in the channel'
    }
    // console.log(this.chatService.getMessagesInChannel(channel))
    if (!channel) return null;
    return (await this.chatService.getMessagesInChannel(channel));
  }

  @Post('getFriendsList')
  @UseGuards(JwtGuard)
  async getFriendsList(@Req() req: Request) {
    const fromUser = await this.chatService.findUserById((req.user as User).id);
    if (fromUser) {
      const friendsList = await this.chatService.getFriendsList(fromUser);
      return friendsList;
    } else {
      return [];
    }
  }
  @Post('getBlockedList')
  @UseGuards(JwtGuard)
  async getBlockedList(@Req() req: Request) {
    const fromUser = await this.chatService.findUserById((req.user as User).id);
    if (fromUser) {
      const blockedlist = await this.chatService.getBlockedList(fromUser);
      return blockedlist;
    } else {
      return [];
    }
  }
  @Post('getNotifList')
  @UseGuards(JwtGuard)
  async getNotifList(@Req() req: Request) {
    const fromUser = await this.chatService.findUserById((req.user as User).id);
    if (fromUser) {
      const notiflist = await this.chatService.getNotifList(fromUser.id);
      return notiflist;
    } else {
      return [];
    }
  }
  @Post('addFriendInChannelRequest')
  @UseGuards(JwtGuard)
  async addFriendInChannel(
    @Req() req: Request,
    @Body() data: { channelID: number, friendId: number }
  ) {
    try {
      // console.log('requete: add friend in channel')
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channel = await this.chatService.findChannelById(data.channelID);
      const friend = await this.chatService.findUserById(data.friendId);
  
      if (!channel || !friend) {
        return 'backend: Channel or friend not found';
      }
      if (!this.chatService.isFriend(fromUser, friend)) {
        return 'backend: not your friend';
      }
      if (await this.chatService.isUserInChannel(friend.id, channel)) {
        return 'backend: user already in channel';
      }
      if (await this.chatService.isBan(data.friendId, channel)) {
        return 'backend: Friend is banned from the channel';
      }  
      await this.chatService.addUserInChannel(channel, friend);
  
      this.sendUploadedData();
      return 'backend: Friend added to the channel';
    } catch {
      // console.log('Error: Adding friend to channel');
      return 'backend: Error while adding friend to channel';
    }
  }
  @Post('resolveNotifRequest')
  @UseGuards(JwtGuard)
  async resolveNotif(
    @Req() req: Request,
    @Body() data: { notifID: number}
  ) {
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);

      await this.chatService.deleteNotificationForUser(fromUser.id, data.notifID);

      this.sendUploadedData(); 
    } catch {
      // console.log('Error: Adding friend to channel');
      return 'backend: Error while resolving notif';
    }
  }
  @Post('challengeRequest')
  @UseGuards(JwtGuard)
  async sendChallengeRequest(
    @Req() req: Request,
    @Body() data: { challengedId}
  ) {
    try {
      console.log('requete: challenge User')
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const toUser = await this.chatService.findUserById(data.challengedId);
  
      if (!fromUser || !toUser) {
        return 'backend:  user not found';
      }
      if (await this.chatService.isBlocked(toUser, fromUser)) {
        return 'backend: this user blocked you';
      }

      const notif = await this.chatService.createNotification(
        [toUser],
        'challenge',
        fromUser.name + ' challenge you to pong !',
        fromUser.id,
        toUser.id
      );

      // setTimeout(async () => {
      //   this.gateway.server.emit('challengeRequest', {fromUser: fromUser, toID: toUser.id});
      // }, 100);

      return 'backend: challenge sended';
    } catch {
      // console.log('Error: Adding friend to channel');
      return 'backend: Error while adding friend to channel';
    }
  }

  sendUploadedData() {
    // console.log('socket.io: emit updateChanList');

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
