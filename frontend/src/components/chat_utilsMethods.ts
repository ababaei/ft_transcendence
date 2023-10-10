export interface friendRelation {
    id: number
    userID: number
    friendID: number
    convID: number
    isBlocked: boolean
}

export interface User {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    friendsID: friendRelation[];
    name: string;
    email: string;
    messages: Message[];
    channels: Channel[];  
}

export interface Message {
    id: number;
    text: string;
    channel: Channel;
    user: User
}
export interface Channel {
    id: number;
    name: string;
    messages: Message[],
    mode: string,
    password: string,
    ownerID: number,
    adminID: number[],
    muteID: number[],
    banID: number[],
    users: User[],
    isDirect: boolean
}

export function isUserInChannel(userID: number, channel: Channel): number {
  if (!channel || !userID) {
    return 0;
  }
  const ret = channel.users.find((user) => user.id == userID);
  return ret ? 1 : 0;
}