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

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private prismaService: PrismaService,
    private gateway: MyGateway,
  ) {}
  @WebSocketServer()
  server: Server;

  @Post('setUsername')
  async handleUsername(@Body() data: { username: string }) {
    console.log('requete: setUsernameRequest', data.username);

    console.log('socket.io: emit updateChanList');
    this.gateway.server.emit(
      'updateChannelList',
      await this.chatService.getChannelsList(),
    );
    this.gateway.server.emit(
      'updateUsersList',
      await this.chatService.getUsersList(),
    );

    const foundedUser = await this.prismaService.user.findFirst({
      where: {
        name: data.username,
      },
    });
    if (foundedUser) {
      setTimeout(async () => {
        this.gateway.server.emit(
          'updateChannelList',
          await this.chatService.getChannelsList(),
        );
        this.gateway.server.emit(
          'updateUsersList',
          await this.chatService.getUsersList(),
        );
      }, 100); // Délai de 100 millisecondes
      return { userid: foundedUser.id, username: foundedUser.name };
    } else {
      console.log('create new user', data.username);
      try {
        const newUser = await this.prismaService.user.create({
          data: {
            email: data.username,
            name: data.username,
            avatar: '',
          },
        });
        setTimeout(async () => {
          this.gateway.server.emit(
            'updateUsersList',
            await this.chatService.getUsersList(),
          );
          this.gateway.server.emit(
            'updateChannelList',
            await this.chatService.getChannelsList(),
          );
          this.gateway.server.emit('logUser', newUser);
        }, 100); // Délai de 100 millisecondes
        return { userid: newUser.id, username: newUser.name };
      } catch {
        console.log('error while creating new user');
      }
    }
    return;
  }
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
    console.log('requete: createChannelRequest: ', data.channelName);
    try {
      if (!data.channelName || !data.mode) {
        return 1;
      }
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      console.log('req.user: ', req.user);
      const newChannel = await this.chatService.createNewChannel(
        data.channelName,
        data.mode,
        data.password,
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
      console.log('error: create channel');
      return 'backend: error creating channel';
    }
  }

  @Post('joinChannelRequest')
  @UseGuards(JwtGuard)
  async handleJoinChannelRequest(
    @Req() req: Request,
    @Body() data: { channelID: number; userID: number; password: string },
  ) {
    console.log('Join channel Request');
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const joinedChannel = await this.chatService.findChannelById(
        data.channelID,
      );

      if (
        (await this.chatService.isBan(fromUser.id, joinedChannel)) ||
        (await this.chatService.isUserInChannel(fromUser.id, joinedChannel))
      ) {
        return 'backend: you cant join this channel';
      }
      if (
        joinedChannel.mode === 'protected' &&
        data.password != joinedChannel.password
      ) {
        return 'backend: wrong password';
      } else {
        await this.chatService.addUserInChannel(joinedChannel, fromUser);
        this.sendUploadedData();
        return 'backend: channel joined';
      }
    } catch {
      console.log('error: join channel');
      return 'backend: failed to join channel';
    }
  }

  @Post('messageRequest')
  @UseGuards(JwtGuard)
  async handleMessageRequest(
    @Req() req: Request,
    @Body() data: { text: string; channel: number },
  ) {
    console.log('Message request');
    try {
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const inChannel = await this.chatService.findChannelById(data.channel);
      const newMessage = await this.chatService.createMessage(
        inChannel,
        fromUser,
        data.text,
      );

      if (
        (await !this.chatService.isUserInChannel(fromUser.id, inChannel)) ||
        (await this.chatService.isMute(fromUser.id, inChannel))
      ) {
        return 'backend: you are not allowed to speak in this channel';
      }
      this.sendUploadedData();
      return 'backend: new message uploaded';
    } catch {
      console.log('Error handling new message');
      return 'backend: error with new message';
    }
  }

  @Post('destroyChannelRequest')
  @UseGuards(JwtGuard)
  async destroyChannel( @Req() req: Request, @Body() data: { channelID: number }) {
    console.log('requete: destroy channel');
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
      console.log('destroy channel : error');
      return 'backend: error while destroying channel';
    }
  }

  @Post('leaveChannelRequest')
  @UseGuards(JwtGuard)
  async leaveChannel(@Req() req: Request, @Body() data: { channelID: number }) {
    try {
      console.log('requete: leave channel');
      const channelToLeave = await this.chatService.findChannelById(
        data.channelID,
      );
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      this.chatService.removeUserFromChannel(fromUser, channelToLeave);
      this.chatService.removeUserAdmin(channelToLeave, fromUser.id);
      if (!channelToLeave.users) {
        this.chatService.destroyChannel(channelToLeave);
      }
      this.sendUploadedData();
      return 'backend: channel leaved';
    } catch {
      console.log('error: leave channel');
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
      console.log('requete: edit channel request');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channelToEdit = await this.chatService.findChannelById(
        data.channelID,
      );

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
      console.log('error: edit channel');
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
      console.log('requete: set user admin');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channel = await this.chatService.findChannelById(data.channelID);

      if (fromUser.id !== channel.ownerID) {
        return 'backend: you must be channel owner to make a user admin';
      }
      this.chatService.setUserAdmin(channel, data.newAdminID);
      this.sendUploadedData();
      return 'backend: user mode set to admin';
    } catch {
      console.log('error: make user admin');
      return 'backend: error while making user administrator';
    }
  }
  @Post('removeUserAdminRequest')
  @UseGuards(JwtGuard)
  async removeUserAdmin(@Req() req: Request, @Body() data: { channelID: number; removedAdminID: number }) {
    try {
      console.log('requete: remove user admin');
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const channel = await this.chatService.findChannelById(data.channelID);

      if (fromUser.id !== channel.ownerID) {
        return 'backend: you must be channel owner to remove a user admin';
      }
      this.chatService.removeUserAdmin(channel, data.removedAdminID);
      this.sendUploadedData();
      return 'backend: user removed from administrators';
    } catch {
      console.log('error: removing administartor');
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
      console.log('requete: kick User');
      const channel = await this.chatService.findChannelById(data.channelID);
      const fromUser = await this.chatService.findUserById((req.user as User).id);
      const userKicked = await this.chatService.findUserById(data.userID);

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
      console.log('error: kick user');
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
    console.log('requete: mute User');
    const channel = await this.chatService.findChannelById(data.channelID);
    const fromUser = await this.chatService.findUserById((req.user as User).id);

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
      console.log('requete: set user admin');
      const channel = await this.chatService.findChannelById(data.channelID);
      const fromUser = await this.chatService.findUserById((req.user as User).id);

      if (await !this.chatService.isAdmin(fromUser.id, channel)) {
        return 'backend: cant unmute user';
      }
      this.chatService.removeUserMute(channel, data.userID);
      this.sendUploadedData();
      return 'backend: user unmuted';
    } catch {
      console.log('error: unmuting user');
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
    console.log('requete: ban User');
    const channel = await this.chatService.findChannelById(data.channelID);
    const fromUser = await this.chatService.findUserById((req.user as User).id);

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
      console.log('requete: unban user');
      const channel = await this.chatService.findChannelById(data.channelID);
      const fromUser = await this.chatService.findUserById((req.user as User).id);

      if (await !this.chatService.isAdmin(fromUser.id, channel)) {
        return 'backend: cant unmute user';
      }
      this.chatService.removeUserBan(channel, data.userID);
      this.sendUploadedData();
      return 'backend: user unbaned';
    } catch {
      console.log('error: unbaning user');
      return 'backend: error while unbaning user';
    }
  }

  @Post('addFriendRequest')
  @UseGuards(JwtGuard)
  async addFriend(@Req() req: Request, @Body() data: { friendName: string }) {
      try {
          console.log('Request: Add friend');
          const fromUser = await this.chatService.findUserById((req.user as User).id);
          const user2 = await this.chatService.findUserByName(data.friendName);
          if (!user2) {
            return 'backend: user not found'
          }
          const newChannel = await this.chatService.createNewChannel('', 'direct', '', 0, true);
          await this.chatService.addUserInChannel(newChannel, fromUser);
          await this.chatService.addUserInChannel(newChannel, user2);
          await this.chatService.addUserInFriends(fromUser, user2, newChannel.id);
  
          this.sendUploadedData();
          return 'Backend: Friend added';
      } catch (error) {
          console.log('Error: Adding friend', error);
          return 'Backend: Error while adding friend';
      }
  }

  // @Post('blockUserRequest')
  // async blockUser(@Body() data: { userID: number; blockedID: number }) {
  //   try {
  //     console.log('requete: block ');
  //     const userBlocking = await this.chatService.findUserById(data.userID);
  //     const userBlocked = await this.chatService.findUserById(data.blockedID);
  //     this.chatService.setBlockedRelation(userBlocking, userBlocked);

  //     this.sendUploadedData();
  //     return 'backend: user blocked';
  //   } catch {
  //     console.log('error: blocking user');
  //     return 'backend: error while blocking user';
  //   }
  // }
  // @Post('unblockUserRequest')
  // async unblockUser(@Body() data: { userID: number; blockedID: number }) {
  //   try {
  //     console.log('requete: unblock');
  //     const userBlocking = await this.chatService.findUserById(data.userID);
  //     const userBlocked = await this.chatService.findUserById(data.blockedID);
  //     this.chatService.removeBlockedRelation(userBlocking, userBlocked);

  //     this.sendUploadedData();
  //     return 'backend: user unblocked';
  //   } catch {
  //     console.log('error: unblocking user');
  //     return 'backend: error while unblocking user';
  //   }
  // }

  @Post('getMessageList')
  @UseGuards(JwtGuard)
  async getListMessage(@Req() req: Request, @Body() data: { channelID: number }) {
    const fromUser = await this.chatService.findUserById((req.user as User).id);
    const channel = await this.chatService.findChannelById(data.channelID);

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

  sendUploadedData() {
    console.log('socket.io: emit updateChanList');

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
