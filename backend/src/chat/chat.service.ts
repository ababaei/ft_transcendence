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

    async createNewChannel(channelName: string) {
        await this.prismaService.channel.create({
            data: {
                name: channelName,
            },
        });
        console.log('create channel ', this.findChannelByName(channelName))
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
        const channel = await this.prismaService.channel.findUnique({
            where: {
                id: channelId,
            },
            include: {
                messages: true,
            }
        });
        return channel;
    }   

    async findUserById(userId: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        return user;
    }

    async addUserInChannel(selectedChannel: Channel, userToAdd: User) {
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
        const channelList = await this.prismaService.channel.findMany({
            include: {
                messages: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        return channelList;
    }

    async getMessageInChannel(channel: Channel): Promise<Message[]> {
        return ;
    }
    
}
