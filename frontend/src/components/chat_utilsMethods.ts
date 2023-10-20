export interface User {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    friends: User[];
    blocked: User[];
    name: string;
    email: string;
    avatar: string;
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
  if (!channel || !userID || !channel.users) {
    return 0;
  }
  const list = channel.users as User[];
  const ret = list.find((user) => user.id == userID);
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

export function isBan(userID: number, channel: Channel): boolean {
console.log("methods: is ban");
const channelBaned = channel.banID;
console.log(channel.banID);
  if (!channelBaned) {
    return false;
  }
  if (channelBaned.find(user => user == userID)) {
    return (true)
  }
  return false;
}

export function getChannelName(channel: Channel, self: User): string {
  if (channel.isDirect) {
    const otherUser = channel.users.find(user => user.id !== self.id);
    if (otherUser) { return otherUser.name }
  }
  return channel.name
}

export function isFriend(userID: number, friendList: User[]): boolean {
  if (!friendList || friendList.length === 0) {
    return false;
  }

  return friendList.some((friend) => friend.id === userID);
}

export function isBlocked(userID: number, blockedList: User[]): boolean {
  console.log('exported: isBlocked', userID, blockedList);
  if (!blockedList || blockedList.length === 0) {
    return false;
  }

  return blockedList.some((blocked) => blocked.id === userID);
}