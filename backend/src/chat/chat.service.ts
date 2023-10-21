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
            // console.log('chatService: channel created: ', newChannel.name);
            return newChannel;
        } catch {
            // console.log('chatService: error while creating channel')
            throw error
        }
    }

    async addUserInChannel(selectedChannel: Channel, userToAdd: User) {
        // console.log('chatService: adding ', userToAdd.name, ' in ', selectedChannel.name);
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
            // console.log('chatService:', userToAdd.name, ' added in channel ', selectedChannel.name)
        } catch {
            // console.log('failed to add user in channel')
            throw error
        }
    }

    async getChannelsList(): Promise<Channel[]> {
        try {
            const channelList = await this.prismaService.channel.findMany({
                include: {
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
                // console.log('error while loading channels list');
                throw error;
            }
    }

    async getMessagesInChannel(channel: Channel): Promise<Message[]> {
        try {
            // console.log('chatService: getMessagesInChannel');
            if (!channel) {return null}
            const messages = await this.prismaService.message.findMany({
                where: {
                    channelID: channel.id,
                },
                include: {
                    user: true,
                    channel: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });
            return messages;
        } catch (error) {
            // console.log('error: getMessagesInChannel', error);
            throw error;
        }
    }   

    async getUsersList(): Promise<User[]> {
        try {
            const userList = await this.prismaService.user.findMany({
                include: {
                    friends: true
                },                
            },)
            return userList;
        }
        catch {
            // console.log('error: loading userList')
            throw error;
        }
    }

    async getFriendsList(user: User): Promise<User[]> {
        try {
          if (!user) {
            return [];
          }
          const friendsList = await this.prismaService.user.findMany({
            where: {
              friends: {
                some: {
                  id: user.id,
                },
              },
            },
          });
      
          return friendsList;
        } catch (error) {
          console.error('Error in getFriendsList:', error);
          throw error;
        }
      }
      async getBlockedList(user: User): Promise<User[]> {
        try {
          if (!user) {
            return [];
          }
          const blockedList = await this.prismaService.user.findUnique({
            where: {
              id: user.id,
            },
          }).blocked();
      
          return blockedList;
        } catch (error) {
          console.error('Error in getBlockedList:', error);
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
            // console.log('error: destroy channel');
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
            // console.log('error: removing user from channel');
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
            // console.log('error: edit channel')
            throw error
        }
    }

    async setUserAdmin(channel: Channel, userID: number) {
        try {
            // console.log('chatService: set User admin');
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
            // console.log('error: set user admin');
            throw error
        }
    }
    async removeUserAdmin(channel: Channel, userID: number) {
        try {
            // console.log('chatService: remove User admin');
            const updatedAdminArray = channel.adminID.filter(id => id !== userID);
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    adminID: updatedAdminArray,
                },
            });
        }
        catch {
            // console.log('error: set user admin');
            throw error
        }
    }

    async setUserMute(channel: Channel, userID: number) {
        try {
            // console.log('chatService: set User mute');
            const updatedMuteArray = [...channel.muteID, userID];
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    muteID: updatedMuteArray,
                },
            });
        }
        catch {
            // console.log('error: set user admin');
            throw error
        }  
    }
    async removeUserMute(channel: Channel, userID: number) {
        try {
            // console.log('chatService: remove User mute');
            const updatedMuteArray = channel.muteID.filter(id => id !== userID);
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    muteID: updatedMuteArray,
                },
            });
        }
        catch {
            // console.log('error: set user admin');
            throw error     
        }
    }
    async setUserBan(channel: Channel, userID: number) {
        try {
            // console.log('chatService: set User ban');
            const updatedBanArray = [...channel.banID, userID];
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    banID: updatedBanArray,
                },
            });
        }
        catch {
            // console.log('error: set user admin');
            throw error 
        }
    }
    async removeUserBan(channel: Channel, userID: number) {
        try {
            // console.log('chatService: remove User ban');
            const updatedBanArray = channel.banID.filter(id => id !== userID);
            await this.prismaService.channel.update({
                where: { id: channel.id },
                data: {
                    banID: updatedBanArray,
                },
            });
        }
        catch {
            // console.log('error: set user admin');
            throw error 
        }
    }

    async addUserInFriends(user1: User, user2: User, conv: number) {
        try {
            await this.prismaService.user.update({
                where: { id: user1.id },
                data: {
                    friends: { connect: [{ id: user2.id }] }
                }
            });
            await this.prismaService.user.update({
                where: { id: user2.id },
                data: {
                    friends: { connect: [{ id: user1.id }] }
                }
            });
        } catch (error) {
            // console.log('Error: Adding friends', error);
            throw error;
        }
    }

    async addUserInBlockedList(userToAdd: User, userBlocking: User) {
        try {
            // Mettre à jour l'utilisateur bloquant pour ajouter l'utilisateur à la liste des bloqués
            await this.prismaService.user.update({
                where: { id: userBlocking.id },
                data: {
                    blocked: {
                        connect: {
                            id: userToAdd.id,
                        },
                    },
                },
            });
    
            // console.log(`User ${userToAdd.name} has been added to the blocked list of ${userBlocking.name}`);
        } catch (error) {
            console.error('Error in addUserInBlockedList:', error);
            throw error;
        }
    }

    async findChannelById(channelId: number) {
        try {
            // console.log('chatService: findChannelByID')
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
            // console.log('error: findChannelById');
            throw error 
        }
    }

    async findDirectChannelByUserIds(userId1: number, userId2: number): Promise<Channel | null> {
        try {
          // Recherchez le canal direct où les deux utilisateurs sont membres
          const directChannel = await this.prismaService.channel.findFirst({
            where: {
              isDirect: true,
              users: {
                every: {
                  OR: [
                    { id: userId1 },
                    { id: userId2 },
                  ],
                },
              },
            },
          });
      
          return directChannel;
        } catch (error) {
          console.error('Error in findDirectChannelByUserIds:', error);
          throw error;
        }
      }

    async findUserByName(username: string): Promise<User | null> {
        try {
          const user = await this.prismaService.user.findFirst({
            where: {
              name: username,
            },
          });
          return user;
        } catch (error) {
          console.error('Error in findUserByName:', error);
          throw error;
        }
      }
      

    async findUserById(userId: number) {
        try {
            // console.log('chatService: findUserByID')
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
            });
            return user;
        }
        catch {
            // console.log('error: findUserById');
            throw error 
        }
    }

    async findMessageById(messageId: number) {
        try {
            // console.log('chatService: findMessageByID')
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
            // console.log('error: findMessageById');
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
            if (!channel || !userID) {
                return false;
            }
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
    async isFriend(user1: User, user2: User): Promise<boolean> {
        try {
            // console.log('isFriend');
          if (!user1 || !user2) {
            return false; // L'un des utilisateurs n'existe pas
          }
      
          const friendsListUser1 = await this.getFriendsList(user1);
          const user2IsFriend = await friendsListUser1.some((friend) => friend.id === user2.id);
          return user2IsFriend;
        } catch (error) {
          console.error('Error in isFriend:', error);
          throw error;
        }
      }
      async isBlocked(user1: User, user2: User): Promise<boolean> {
        try {
            if (!user1 || !user2) {
                return false; // L'un des utilisateurs n'existe pas
            }
    
            const user1BlockedUsers = await this.prismaService.user.findUnique({
                where: { id: user1.id },
                select: {
                    blocked: {
                        where: { id: user2.id },
                    },
                },
            });
    
            return user1BlockedUsers.blocked.length > 0;
        } catch (error) {
            console.error('Error in isBlocked:', error);
            throw error;
        }
    }
    async removeUserFromFriends(user1: User, userToRemove: User): Promise<void> {
        try {
            if (!user1 || !userToRemove) {
                throw new Error('User not found');
            }
    
            await this.prismaService.user.update({
                where: { id: user1.id },
                data: {
                    friends: {
                        disconnect: [{ id: userToRemove.id }],
                    },
                },
            });
    
            await this.prismaService.user.update({
                where: { id: userToRemove.id },
                data: {
                    friends: {
                        disconnect: [{ id: user1.id }],
                    },
                },
            });
        } catch (error) {
            console.error('Error in removeUserFromFriends:', error);
            throw error;
        }
    }
    async removeUserFromBlocked(userBlocking: User, userToRemove: User): Promise<void> {
        try {
            if (!userBlocking || !userToRemove) {
                throw new Error('User not found');
            }
    
            await this.prismaService.user.update({
                where: { id: userBlocking.id },
                data: {
                    blocked: {
                        disconnect: [{ id: userToRemove.id }],
                    },
                },
            });
    
            // console.log(`User ${userToRemove.name} has been removed from the blocked list of ${userBlocking.name}`);
        } catch (error) {
            console.error('Error in removeUserFromBlocked:', error);
            throw error;
        }
    }
}
