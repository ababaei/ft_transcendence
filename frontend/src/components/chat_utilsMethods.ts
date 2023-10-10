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


export function isAdmin(userID: number, channel: Channel) {
  const channelAdmins = channel.adminID;
  if (!channelAdmins)
    return 0;
  if (channelAdmins.find(user => user == userID)) {
    console.log('isAdmin: ', userID, ' is administrator')
    return (1)
  }
  return 0;
}

export function isMute(userID: number, channel: Channel): boolean{
console.log("methods: is ");
const channelMuted = channel.muteID;
console.log(channel.muteID);
  if (!channelMuted) {
    return false;
  }
  if (channelMuted.find(user => user == userID)) {
    return true
  }
  return false
}

export function isBan(userID: number, channel: Channel) {
console.log("methods: is ban");
const channelBaned = channel.banID;
console.log(channel.banID);
  if (!channelBaned) {
    return 0;
  }
  if (channelBaned.find(user => user == userID)) {
    return (1)
  }
    return 0;
}