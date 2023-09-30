import { Body, Injectable } from '@nestjs/common';
import { Channel, Message, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor (private readonly prismaService: PrismaService) {}

    async createMessage(inChannel: Channel, fromUser: User, text: string){
        return await this.prismaService.message.create({
            data: {
                text: text,
                channelID: inChannel.id,
                userID: fromUser.id
            },
        })
    }

    async createNewChannel(channelName: string, mode: string, password: string, ownerId: number) {
        const newChannel = await this.prismaService.channel.create({
            data: {
                name: channelName,
                mode: mode,
                password: password,
                ownerID: ownerId,   
            },
        });
        console.log('create channel ', this.findChannelByName(channelName))
        return newChannel;
    }

    async findChannelByName(channelName: string) {
        const channel = await this.prismaService.channel.findFirst({
            where: {
                name: channelName,
            },
            include: {
                messages: true,
            }
        });
        return channel;
    }
    async findChannelById(channelId: number) {
        console.log('chatService: findChannelByID')
        const channel = await this.prismaService.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: true,
                users: true,
            }
        });
        return channel;
    }   

    async findUserById(userId: number) {
        console.log('chatService: findUserByID')
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        return user;
    }

    async findMessageById(messageId: number) {
        console.log('chatService: findMessageByID')
        const message = await this.prismaService.message.findUnique({
            where: {
                id: messageId,
            },
            include: {
                user: true,
                channel: true,
            },
        });
        return message;
    }

    async addUserInChannel(selectedChannel: Channel, userToAdd: User) {
        console.log('chatService: adding ', userToAdd.name, ' in ', selectedChannel.name);
        let newChannelOwner;
        if (selectedChannel.ownerID == 0)
            newChannelOwner = userToAdd.id;
        else
            newChannelOwner = selectedChannel.ownerID
        try {
            const updateChanUser = await this.prismaService.channel.update({
                where: { id: selectedChannel.id },
                data: {
                    users: {
                        connect: {
                            id: userToAdd.id
                        },
                    },
                    ownerID: newChannelOwner,
                },
            });

        } catch { console.log('failed to add user in channel') }
    }

    async getChannelsList(): Promise<Channel[]> {
        // console.log('chatService: getChannelsList');
        const channelList = await this.prismaService.channel.findMany({
            include: {
                messages: {
                    include: {
                        user: true,
                    },
                },
                users: true,
                
            },
        });
        const channelsWithAdminID: Channel[] = [];
        for (const channel of channelList) {
          const adminChannel = await this.prismaService.channel.findUnique({
            where: {
              id: channel.id,
            },
            select: {
              adminID: true,
              banID: true,
              muteID: true,
            },
          });
          channelsWithAdminID.push({
            ...channel,
            adminID: adminChannel.adminID,
            muteID: adminChannel.muteID,
            banID: adminChannel.banID,
          });
        }
        console.log(channelsWithAdminID);
        return channelsWithAdminID;
    }

    async getUsersList(): Promise<User[]> {
        const userList = await this.prismaService.user.findMany( {
        });
        const userListWithFriends: User[] = [];
        for (const user of userList) {
          const friends = await this.prismaService.user.findUnique({
            where: {
              id: user.id,
            },
            select: {
              friendsID: true,
            },
          });
          userListWithFriends.push({
            ...user,
            friendsID: friends.friendsID,
          });
        }
        return userListWithFriends;
    }

    async destroyChannel(channel: Channel)
    {
        await this.prismaService.message.deleteMany({
            where: {
                channelID: channel.id,
            }    
        });
        await this.prismaService.channel.delete({
            where: {
              id: channel.id,
            },
        });
    }

    async removeUserFromChannel(user: User, channel: Channel) {
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                users: {
                    disconnect: {
                        id: user.id,
                    },
                },
            },
        })
        const updatedChannel = this.findChannelById(channel.id);
        if (channel.ownerID == user.id) {
            let channelOwner = 0;
            if (await this.prismaService.channel.count() != 0) {
                channelOwner = (await updatedChannel).users[0].id;
            }
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    ownerID: channelOwner,
                },
            })
        }
    }

    async editChannel(channel: Channel, newName: string, newType: string, newPassword: string) {
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                name: newName,
                mode: newType,
                password: newPassword,
            },
        })
    }

    async setUserAdmin(channel: Channel, userID: number) {
        console.log('chatService: set User admin');
        if (channel.adminID.includes(userID))
            return;
        const updatedAdminArray = [...channel.adminID, userID];
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                adminID: updatedAdminArray,
            },
        });
    }
    async removeUserAdmin(channel: Channel, userID: number) {
        console.log('chatService: remove User admin');
        const updatedAdminArray = channel.adminID.filter(id => id !== userID);
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                adminID: updatedAdminArray,
            },
        });
    }

    async setUserMute(channel: Channel, userID: number) {
        console.log('chatService: set User mute');
        const updatedMuteArray = [...channel.muteID, userID];
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                muteID: updatedMuteArray,
            },
        });
    }
    async removeUserMute(channel: Channel, userID: number) {
        console.log('chatService: remove User mute');
        const updatedMuteArray = channel.muteID.filter(id => id !== userID);
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                muteID: updatedMuteArray,
            },
        });
    }
    async setUserBan(channel: Channel, userID: number) {
        console.log('chatService: set User ban');
        const updatedBanArray = [...channel.banID, userID];
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                banID: updatedBanArray,
            },
        });
    }
    async removeUserBan(channel: Channel, userID: number) {
        console.log('chatService: remove User ban');
        const updatedBanArray = channel.banID.filter(id => id !== userID);
        await this.prismaService.channel.update({
            where: { id: channel.id },
            data: {
                banID: updatedBanArray,
            },
        });
    }

    async addUserInFriends(user1: User, user2: User) {
        console.log('chatService: make friends');
        if (user1.friendsID.includes(user2.id))
            return;
        const updatedFriendArray = [...user1.friendsID, user2.id];
        await this.prismaService.user.update({
            where: { id: user1.id },
            data: {
                friendsID: updatedFriendArray,
            },
        });
    }

    async getMessageInChannel(channel: Channel): Promise<Message[]> {
        return ;
    }
    
}
