import { Body, Injectable } from '@nestjs/common';
import { Channel, Message, User } from '@prisma/client';
import { error } from 'console';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor (private readonly prismaService: PrismaService) {}

    async createMessage(inChannel: Channel, fromUser: User, text: string) {
        return await this.prismaService.message.create({
            data: {
                text: text,
                channelID: inChannel.id,
                userID: fromUser.id
            },
        })
    }

    async createNewChannel(channelName: string, mode: string, password: string, ownerId: number, chanOrDirect: boolean) {
        try { const newChannel = await this.prismaService.channel.create({
            data: {
                name: channelName,
                mode: mode,
                password: password,
                ownerID: ownerId,
                isDirect: chanOrDirect,
            },});
            console.log('chatService: channel created: ', newChannel.name);
            return newChannel;
        } catch {
            console.log('chatService: error while creating channel')
            throw error
        }
    }





    async addUserInChannel(selectedChannel: Channel, userToAdd: User) {
        console.log('chatService: adding ', userToAdd.name, ' in ', selectedChannel.name);
        let newChannelOwner;
        if (selectedChannel.ownerID == 0)
            newChannelOwner = userToAdd.id;
        else
            newChannelOwner = selectedChannel.ownerID
        try {
            await this.prismaService.channel.update({
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
            console.log('chatService:', userToAdd.name, ' added in channel ', selectedChannel.name)
        } catch {
            console.log('failed to add user in channel')
            throw error
        }
    }

    async getChannelsList(): Promise<Channel[]> {
        try {
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
            return channelsWithAdminID;
        }   catch {
                console.log('error while loading channels list');
                throw error;
            }
    }

    async getUsersList(): Promise<User[]> {
        try {
            const userList = await this.prismaService.user.findMany({
                include: {
                    friendsID: true
                },                
            },)
            return userList;
        }
        catch {
            console.log('error: loading userList')
            throw error;
        }
    }

    async destroyChannel(channel: Channel)
    {
        try {
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
        catch {
            console.log('error: destroy channel');
            throw error;
        }
    }

    async removeUserFromChannel(user: User, channel: Channel) {
        try {
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
                    this.setUserAdmin(await updatedChannel, channelOwner)
                }
                await this.prismaService.channel.update({
                    where: { id: channel.id },
                    data: {
                        ownerID: channelOwner,
                    },
                })
            }
        }
        catch {
            console.log('error: removing user from channel');
            throw error
        }
    }

    async editChannel(channel: Channel, newName: string, newType: string, newPassword: string) {
        try {
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    name: newName,
                    mode: newType,
                    password: newPassword,
                },
            })
        }
        catch {
            console.log('error: edit channel')
            throw error
        }
    }

    async setUserAdmin(channel: Channel, userID: number) {
        try {
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
        catch {
            console.log('error: set user admin');
            throw error
        }
    }
    async removeUserAdmin(channel: Channel, userID: number) {
        try {
            console.log('chatService: remove User admin');
            const updatedAdminArray = channel.adminID.filter(id => id !== userID);
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    adminID: updatedAdminArray,
                },
            });
        }
        catch {
            console.log('error: set user admin');
            throw error
        }
    }

    async setUserMute(channel: Channel, userID: number) {
        try {
            console.log('chatService: set User mute');
            const updatedMuteArray = [...channel.muteID, userID];
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    muteID: updatedMuteArray,
                },
            });
        }
        catch {
            console.log('error: set user admin');
            throw error
        }  
    }
    async removeUserMute(channel: Channel, userID: number) {
        try {
            console.log('chatService: remove User mute');
            const updatedMuteArray = channel.muteID.filter(id => id !== userID);
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    muteID: updatedMuteArray,
                },
            });
        }
        catch {
            console.log('error: set user admin');
            throw error     
        }
    }
    async setUserBan(channel: Channel, userID: number) {
        try {
            console.log('chatService: set User ban');
            const updatedBanArray = [...channel.banID, userID];
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    banID: updatedBanArray,
                },
            });
        }
        catch {
            console.log('error: set user admin');
            throw error 
        }
    }
    async removeUserBan(channel: Channel, userID: number) {
        try {
            console.log('chatService: remove User ban');
            const updatedBanArray = channel.banID.filter(id => id !== userID);
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    banID: updatedBanArray,
                },
            });
        }
        catch {
            console.log('error: set user admin');
            throw error 
        }
    }

    async addUserInFriends(user1: User, user2: User, conv: number) {
        try {
            console.log('chatService: make friends');
            await this.prismaService.friendRelation.create({
                data: {
                    userID: user1.id,
                    friendID: user2.id,
                    convID: conv
                },
            })
            await this.prismaService.friendRelation.create({
                data: {
                    userID: user2.id,
                    friendID: user1.id,
                    convID: conv
                },
            })
        }
        catch {
            console.log('error: set user admin');
            throw error 
        }
    }

    async setBlockedRelation(user1: User, user2: User) {
        console.log('chatService: set Blocked Relation');
        try {
            const relation = await this.prismaService.friendRelation.findFirst({
                where: {
                    userID: user1.id,
                    friendID: user2.id,
                }
            });
            console.log(relation);
            if (!relation) {
                console.log("!relation")
                await this.prismaService.friendRelation.create({
                    data: {
                        userID: user1.id,
                        friendID: user2.id,
                        convID: 0,
                        isBlocked: true
                    },
                })
                await this.prismaService.friendRelation.create({
                    data: {
                        userID: user2.id,
                        friendID: user1.id,
                        convID: 0,
                    },
                })
            }
            else {
                await this.prismaService.friendRelation.update({
                    where: { id: relation.id },
                    data: {
                        isBlocked: true,
                    },
                })
            }
        }
        catch {
            console.log('error: set user admin');
            throw error 
        }
    }
    async removeBlockedRelation(user1: User, user2: User) {
        try {
            console.log('chatService: set Blocked Relation');
            const relation = await this.prismaService.friendRelation.findFirst({
                where: {
                    userID: user1.id,
                    friendID: user2.id,
                }
            });
            console.log(relation);
            if (relation) {
                await this.prismaService.friendRelation.delete({
                    where: {id: relation.id}
                })
            }
            const relation2 = await this.prismaService.friendRelation.findFirst({
                where: {
                    userID: user2.id,
                    friendID: user1.id,
                }
            });
            if (relation2) {
                await this.prismaService.friendRelation.delete({
                    where: {id: relation2.id}
                })
            }
        } catch {
            console.log('error: set user admin');
            throw error 
        }
    }

    async findChannelById(channelId: number) {
        try {
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
        catch {
            console.log('error: set user admin');
            throw error 
        }
    }   

    async findUserById(userId: number) {
        try {
            console.log('chatService: findUserByID')
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
            });
            return user;
        }
        catch {
            console.log('error: set user admin');
            throw error 
        }
    }

    async findMessageById(messageId: number) {
        try {
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
        catch {
            console.log('error: set user admin');
            throw error        
        }
    }

    async isBan(userID: number, channel: Channel): Promise<boolean> {
        try {
            if (channel.banID.includes(userID)) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error in isBan:', error);
            throw error;
        }
    }
    async isMute(userID: number, channel: Channel): Promise<boolean> {
        try {
            if (channel.muteID.includes(userID)) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error in isMute:', error);
            throw error;
        }
    }
    async isUserInChannel(userID: number, channel: Channel): Promise<boolean> {
        try {
            const channelWithUsers = await this.prismaService.channel.findUnique({
                where: { id: channel.id },
                include: {
                    users: true,
                },
            });
    
            if (channelWithUsers && channelWithUsers.users) {
                const userInChannel = channelWithUsers.users.some((user) => user.id === userID);
                return userInChannel;
            }
    
            return false;
        } catch (error) {
            console.error('Error in isUserInChannel:', error);
            throw error;
        }
    }
    async isAdmin(userID: number, channel: Channel): Promise<boolean> {
        try {
            if (channel.adminID.includes(userID)) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error in isAdmin:', error);
            throw error;
        }
    }
}
