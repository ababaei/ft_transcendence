import { Body, Injectable } from '@nestjs/common';
import { Channel, Message, User } from '@prisma/client';
import { error } from 'console';
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
        try {
            const updateChanUser = await this.prismaService.channel.update({
                where: { id: selectedChannel.id },
                data: {
                    users: {
                        connect: {
                            id: userToAdd.id
                        },
                    },
                },
            });

        } catch { console.log('failed to add user in channel') }
    }

    async getChannelsList(): Promise<Channel[]> {
        console.log('chatService: getChannelsList');
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
        return channelList;
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
    }

    async getMessageInChannel(channel: Channel): Promise<Message[]> {
        return ;
    }
    
}
