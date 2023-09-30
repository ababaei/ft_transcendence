
<template>
  <main>
    <h1>Page Chat</h1>

<!-- LOGIN -->
    <form id="userDiv" @submit.prevent="sendUsername">
      <input v-if="!logedUser.id" type="text" id="usernameEntry" name="username" v-model="usernameToSend" autocomplete="off">
      <button v-if="!logedUser.id">send username</button>
    </form>
    <h2 v-if="logedUser">[  {{ logedUser.name }}  ]</h2>

<!-- CHATBOX                    -->

    <div id="chatboxDiv" v-if="logedUser.id && chatboxOnChannel.id && chatboxOnChannelID">
      <h2> ~ Chatbox ~ </h2>
      <h3 id="channelName"> {{ getChannelName() }} </h3>
      <button @click="switchChatboxWindow"> {{ switchChatboxButton }}</button>

  <!-- INFO CHANNEL -->

      <div id="channelInfo" v-if="chatboxWindow==0 && !chatboxOnChannel.isDirect">

        <!-- EDIT CHANNEL PART -->
        <div v-if="chatboxOnChannel.ownerID===logedUser.id">
          <input v-if="chatboxOnChannel.ownerID===logedUser.id"
          v-model="channelNewName">

          <div>
            <input type="radio" id="public" value="public" v-model="channelTypeEdit">
            <label for="public">public</label>
            
            <input type="radio" id="private" value="private" v-model="channelTypeEdit">
            <label for="private">private</label>
            
            <input type="radio" id="protected" value="protected" v-model="channelTypeEdit">
            <label for="protected">protected</label>
          </div>
          <div  v-if=" channelTypeEdit === 'protected' ">
            <input type="text" id="password" v-model="passwordChannelEdit" placeholder="Password">
          </div>

          <button v-if="chatboxOnChannel.ownerID===logedUser.id"
          @click="editChannel">edit channel</button>
        </div>
      <!-- EDIT CHANNEL PART FIN -->

      <!-- JOIN CHANNEL -->
          <div id="joinChannel" v-if="!isUserInChannel(logedUser.id, chatboxOnChannel) &&
          !isBan(logedUser.id, chatboxOnChannel) && chatboxOnChannel.mode!='private'">
            <input id="passwordJoinEntry" v-model="passwordToJoin"
            v-if="chatboxOnChannel.mode==='protected'" placeholder="Password">
            <button @click="joinChannel(logedUser.id)">Join</button>
          </div>
          <p v-if="isBan(logedUser.id, chatboxOnChannel)"> You are banned</p>
      <!-- JOINCHANNEL FIN -->

      <!-- DESTROY/LEAVE CHANNEL -->
          <label for="channelAction">Channel Action</label>
          <input type="checkbox" id="channelAction" v-model="channelActionCheckbox">
          <div id="channelActionList" v-if="channelActionCheckbox
          && isUserInChannel(logedUser.id, chatboxOnChannel)">
            <ul>
              <li><button @click="leaveChannel">Leave channel</button></li>
              <li v-if="chatboxOnChannel.ownerID===logedUser.id">
                <button @click="destroyChannel">Destroy channel</button></li>

      <!-- INVITER UN AMI -->
              <li><button @click="toggleTimer(3)">Invite friend</button>
                <div id="ivitefriend" v-if="timerCursorOn==3">
                  <template v-for="friend in logedUser.friendsID">
                  <li v-if="!isUserInChannel(friend.id, chatboxOnChannel)">
                      {{ getUserFromId(friend.id).name }}
                      <button @click="joinChannel(friend.id)">+</button>
                  </li>
                  </template>
                </div>
              </li>
            </ul>
          </div>
      <!-- DESTROY/LEAVE CHANNEL FIN -->
          
      <!-- LISTE DES USERS -->
          <h6>Users in channel</h6>
          <ul id = "channelUserList">
            <li v-for="user in chatboxOnChannel.users" :key="user.id">

          <!-- NOM ET GRADE DU USER -->
              {{ user.name }}
              <h6 v-if="user.id === chatboxOnChannel.ownerID"> owner </h6>
              <h6 v-if="isAdmin(user.id, chatboxOnChannel)"> admin </h6>


          <!-- ACTION SUR LE USER -->
            <div id="actionOnUser" v-if="logedUser.id!=user.id">
              <button @click="toggleContextMenu(user.id)"> o </button>
              <div v-if="userActionCursorOn==user.id">


          <!-- MUTE KICK ET BAN -->
              <div v-if="isAdmin(logedUser.id, chatboxOnChannel) && user.id!=chatboxOnChannel.ownerID
              ||logedUser.id === chatboxOnChannel.ownerID ">

            <!-- MUTE et UNMUTE -->
                <button v-if="!isMute(user.id, chatboxOnChannel)" @click="toggleTimer(1)">Mute</button>
                <div id="timerButtons" v-if="timerCursorOn==1">
                  <button @click="muteUser(user.id, chatboxOnChannel.id, 0.25)"> 1 min </button>
                  <button @click="muteUser(user.id, chatboxOnChannel.id, 30)"> 30 min </button>
                  <button @click="muteUser(user.id, chatboxOnChannel.id, 60)"> 1 hour</button>
                </div>
                <button v-if="isMute(user.id, chatboxOnChannel)"
                @click="unmuteUser(user.id, chatboxOnChannel.id)">unmute</button>

            <!-- KICK -->
                <button @click="kickUserFromChannel(user.id, chatboxOnChannel.id)">Kick</button>

            <!-- BAN -->
                <button @click="toggleTimer(2)">Ban</button>
                <div id="timerButtons" v-if="timerCursorOn==2">
                  <button @click="banUser(user.id, chatboxOnChannel.id, 0.25)"> 30 min </button>
                  <button @click="banUser(user.id, chatboxOnChannel.id, 30)"> 1 hour </button>
                  <button @click="banUser(user.id, chatboxOnChannel.id, 60)"> 8 hour</button>
                </div>

      
            <!-- SET ADMIN -->
                <div v-if="logedUser.id === chatboxOnChannel.ownerID">

                  <button v-if="!isAdmin(user.id, chatboxOnChannel)
                  && user.id != chatboxOnChannel.ownerID"
                  @click="makeUserAdmin(user.id, chatboxOnChannel.id)">Make Admin</button>

                  <button v-if="isAdmin(user.id, chatboxOnChannel)
                  && user.id != chatboxOnChannel.ownerID"
                  @click="removeUserAdmin(user.id, chatboxOnChannel.id)">Remove admin</button>

                </div>
                </div>
              </div>
            </div>
            </li>
          </ul>
      </div>

    <!-- FENETRE MESSAGE -->
      <div id="convWindow" v-if="chatboxWindow==1">
        <h6>Conversation</h6>
        <ul id="messageHistory">
          <template v-for="message in chatboxOnChannel.messages" :key="message.id">
          <li v-if="!isBlocked(logedUser.id, message.user.id)">
            <p>{{ message.user.name }} : {{ message.text }}</p>
          </li>
          </template>
        </ul>
        <form @submit.prevent="sendMessage" v-if="!isMute(logedUser.id, chatboxOnChannel)">
          <input id="messageEntry" type="text" name="messageBody"
          v-model="messageToSend" placeholder="Message">
          <button>send</button>
        </form>
        <h4 v-if="isMute(logedUser.id, chatboxOnChannel)">You are mute</h4>
      </div>
    </div>

<!-- CHANNEL LIST -->
    <div id="channelsHub" v-if="logedUser.id">
      <div>
      <h2> ~ Channel list ~ </h2>
      <ul div="channelsList">
        <template v-for="channel in listChannels" :key="channel.id">
        <li v-if="channel.id!=-1 && !channel.isDirect">
          <div @click="selectChannel(channel)" id="channelDescriptionBar">
            {{ channel.name }} - {{ channel.mode }}
          </div>
        </li>
      </template>
      </ul>
      </div>

<!-- CREATION CHANNEL -->
    <div>
      <form @submit.prevent="createNewChannel">
        <h4>Channel creation form</h4>
        <input type="text" id="channelEntry" name="channelname"
        placeholder="Channel name"
        v-model="channelCreationName" autocomplete="off">
        <div>
          <input type="radio" id="public" value="public" v-model="channelType">
          <label for="public">public</label>
          
          <input type="radio" id="private" value="private" v-model="channelType">
          <label for="private">private</label>
          
          <input type="radio" id="protected" value="protected" v-model="channelType">
          <label for="protected">protected</label>
        </div>
        <div  v-if=" channelType === 'protected' ">
          <input type="text" id="password" v-model="passwordChannel" placeholder="Password">
        </div>
        <button v-if="channelType && channelCreationName" type="submit">Create channel</button>
      </form>
    </div>
<!-- LISTE D'AMIS -->
    <div id="relationsListsHub">
      <h2> ~ Users List ~</h2>
      <ul>
        <template v-for="user in userList">
        <li v-if="user.id!==logedUser.id && !isBlocked(logedUser.id, user.id) && 
        !isBlocked(user.id, logedUser.id)">
             {{ user.name }}
            <button v-if="!isFriend(user.id)" @click="addFriend(user.id)">add friend</button>
            <button @click="blockUser(user.id)"> block user </button>
        </li>
        </template>
      </ul>
      <h2> ~ Friends List ~</h2>
      <ul>
        <template v-for="friend in logedUser.friendsID" >
        <li v-if="!isBlocked(logedUser.id, friend.id) && !isBlocked(friend.id, logedUser.id)">
            {{ getUserFromId(friend.friendID).name }}
            <button @click="selectChannel(getChannelFromID(friend.convID))">direct message</button>
        </li>
        </template>
      </ul>
      <h2> ~ Blocked List ~</h2>
      <ul>
        <template v-for="user in userList">
        <li v-if="isBlocked(logedUser.id, user.id)">
             {{ user.name }}
            <button @click="unblockUser(user.id)"> unblock user </button>
        </li>
        </template>
      </ul>
    </div>
    </div>
  </main>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios'
  import { io } from 'socket.io-client';

  interface friendRelation {
    id: number
    userID: number
    friendID: number
    convID: number
    isBlocked: boolean
  }

  interface User {
    id: number;
    friendsID: friendRelation[];
    name: string;
  }
  interface Message {
    id: number;
    text: string;
    channel: Channel;
    user: User
  }
  interface Channel {
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


  export default defineComponent({
    name: 'ChatView',
    components:({}),
    data() {
      return {
        socket: io('http://localhost:3000'),
        usernameToSend: '' as string,
        logedUser: { name: '', id: 0 } as User,
        channelCreationName: '' as string,
        listChannels: [] as Channel[],
        userList: [] as User[],
        chatboxOnChannel: { id: 0} as Channel,
        chatboxOnChannelID: 0 as number,
        messageToSend: '' as string,
        channelType: "public",
        channelTypeEdit: "public",
        passwordChannel: '' as string,
        passwordChannelEdit: '' as string,
        passwordToJoin: '' as string,
        chatboxWindow: 0,
        switchChatboxButton: 'Infos',
        channelActionCheckbox: false,
        channelNewName: '' as string,
        userContextMenu: null,
        userActionCursorOn: 0,
        timerCursorOn: 0,
        channelWhileUpdating: {id: 0} as Channel
      }
    },
    methods: {

  // setup d'un pseudo utilisateur
      async sendUsername() {
          const reponse = await axios.post('/api/chat/setUsername', {
            username: this.usernameToSend,
          });
          this.logedUser.id = reponse.data.userid;
          this.logedUser.name = reponse.data.username;
          console.log('methods: senndUsername:', this.logedUser);
          console.log(this.listChannels)
      },

  // creer un channel
    async createNewChannel() {
      console.log('methods: createNewChannel');
      try {
        const reponse = await axios.post('/api/chat/createChannelRequest', {
          channelName: this.channelCreationName,
          userid: this.logedUser.id,
          mode: this.channelType,
          password: this.passwordChannel,

        })
      } catch { console.error(); }
      this.channelCreationName = ''
      this.passwordChannel = ''
      this.channelType = 'public'
    },

    async createNewDirectConv() {
      console.log('methods: createNewDirectConv');
      try {
        const reponse = await axios.post('/api/chat/createDirectConvRequest', {
          channelName: this.channelCreationName,
          userid: this.logedUser.id,
          mode: this.channelType,
          password: this.passwordChannel,

        })
      } catch { console.error(); }
      this.channelCreationName = ''
      this.passwordChannel = ''
      this.channelType = 'public'
    },

    async selectChannel(channel: Channel) {
      this.chatboxOnChannel = channel;
      this.chatboxOnChannelID = channel.id;
      this.channelNewName = channel.name;
      this.passwordChannelEdit = channel.password;
      this.channelTypeEdit = channel.mode;
      this.chatboxWindow = 0;
      this.channelActionCheckbox = false;
      this.userActionCursorOn = 0;
      if (channel.isDirect) {this.chatboxWindow = 1}
      console.log('methods: selectChannel:', this.chatboxOnChannelID);
    },

  // envoyer un message

    async sendMessage() {
      console.log('methods: sendMessage');
      try {
        const reponse = await axios.post('/api/chat/messageRequest', {
          text: this.messageToSend,
          user: this.logedUser.id,
          channel: this.chatboxOnChannel.id,
        })
        console.log(reponse.data);
      } catch { console.error(); }
      this.messageToSend = ''
    },

    // join un channel

    async joinChannel(userID: number) {
      console.log('methods: joinChannel');
      const reponse = await axios.post('/api/chat/joinChannelRequest', {
        channelID: this.chatboxOnChannel.id,
        userID: userID,
        password: this.passwordToJoin
      })
    },
    async switchChatboxWindow() {
      console.log('methods: switchChatboxWindow ', this.chatboxWindow)
      if (!this.isUserInChannel(this.logedUser.id, this.chatboxOnChannel))
        return ;
      if (this.chatboxWindow == 0) {
        this.chatboxWindow = 1;
        this.switchChatboxButton = 'Messages'
      }
      else {
        this.chatboxWindow = 0;
        this.switchChatboxButton = 'Infos'
      }
    },

// ACTIONS SUR LE CHANNEL

    async destroyChannel() {
      console.log('methods: Destroy channel');
      const reponse = await axios.post('/api/chat/destroyChannelRequest', {
        channelID: this.chatboxOnChannel.id,
      })
    },

    async leaveChannel() {
      console.log('methods: LeaveChannel');
      if (this.chatboxOnChannel.users.length === 1) {
          const reponse = await axios.post('/api/chat/destroyChannelRequest', {
          channelID: this.chatboxOnChannel.id,
        })
      }
      else {
        const reponse = await axios.post('/api/chat/leaveChannelRequest', {
          userID: this.logedUser.id,
          channelID: this.chatboxOnChannel.id,
        });
      }
    },
    async editChannel() {
      const reponse = await axios.post('/api/chat/editChannelRequest', {
        channelID: this.chatboxOnChannel.id,
        newChannelName: this.channelNewName,
        newChannelType: this.channelTypeEdit,
        newChannelPassword: this.passwordChannelEdit,
      })
    },


// ACTIONS SUR LES USERS

    async makeUserAdmin(newAdminID: number, channelID: number) {
      console.log('methosds: makeUserAdmin');
      const reponse = await axios.post('/api/chat/makeUserAdminRequest', {
        channelID: channelID,
        newAdminID: newAdminID,
      })
    },
    async removeUserAdmin(AdminID: number, channelID: number) {
      console.log('methosds: removeUserAdmin');
      const reponse = await axios.post('/api/chat/removeUserAdminRequest', {
        channelID: channelID,
        removedAdminID: AdminID,
      })
    },


    async kickUserFromChannel(userID: number, channelID: number) {
      console.log('methods: LeaveChannel');
      if (this.chatboxOnChannel.users.length === 1) {
          const reponse = await axios.post('/api/chat/destroyChannelRequest', {
          channelID: this.chatboxOnChannel.id,
        })
      }
      else {
        const reponse = await axios.post('/api/chat/leaveChannelRequest', {
          userID: userID,
          channelID: channelID,
        });
      }
    },

    async muteUser(userID: number, channelID: number, time: number) {
      console.log('methosds: mute user');
      const reponse = await axios.post('/api/chat/muteUserRequest', {
        channelID: channelID,
        userID: userID,
        timer: time,
      })
    },
    async unmuteUser(userID: number, channelID: number) {
    console.log('methosds: mute user');
      const reponse = await axios.post('/api/chat/unmuteUserRequest', {
        channelID: channelID,
        userID: userID,
      })
    },


    async banUser(userID: number, channelID: number, time: number) {
      console.log('methosds: ban user');
      const reponse = await axios.post('/api/chat/banUserRequest', {
        channelID: channelID,
        userID: userID,
        timer: time,
      })
      await axios.post('/api/chat/leaveChannelRequest', {
          userID: userID,
          channelID: channelID,
      });
    },
    async unbanUser(userID: number, channelID: number) {
    console.log('methosds: unban user');
      const reponse = await axios.post('/api/chat/unbanUserRequest', {
        channelID: channelID,
        userID: userID,
      })
    },


    async addFriend(friendID: number) {
      console.log('methosds: addd friend');
      if (this.isBlocked(friendID, this.logedUser.id)) { return }
      const reponse = await axios.post('/api/chat/addFriendRequest', {
        userID: this.logedUser.id,
        friendID: friendID,
      })
    },

    async blockUser(blockedID: number) {
      console.log("methods: block user")
    const reponse = await axios.post('/api/chat/blockUserRequest', {
        userID: this.logedUser.id,
        blockedID: blockedID,
      })
    },
    async unblockUser(blockedID: number) {
      console.log("methods: unblock user")
    const reponse = await axios.post('/api/chat/unblockUserRequest', {
        userID: this.logedUser.id,
        blockedID: blockedID,
      })
    },
// utils

  isAdmin(userID: number, channel: Channel) {
      const channelAdmins = channel.adminID;
      if (!channelAdmins)
        return 0;
      if (channelAdmins.find(user => user == userID)) {
        console.log('isAdmin: ', userID, ' is administrator')
        return (1)
      }
      return 0;
    },

  isMute(userID: number, channel: Channel) {
    console.log("methods: is ");
    const channelMuted = channel.muteID;
    console.log(channel.muteID);
      if (!channelMuted) {
        return 0;
      }
      if (channelMuted.find(user => user == userID)) {
        return (1)
      }
        return 0;
    },
    isBan(userID: number, channel: Channel) {
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
    },

    isUserInChannel(userID: number, channel: Channel): number {
      console.log('methods: isUserInChannel');
      if (!channel || !userID)
        return 0
      const ret = channel.users.find(user => user.id == userID)
      if (ret)
        return (1)
      else
        return (0)
    },

    isFriend(userID: number){
      console.log('methods: is friend')
      const friendList = this.logedUser.friendsID;
      if (!friendList) return 0
      const ret = friendList.find(user => user.friendID == userID);
      if (ret) { return 1 }
      return 0;
    },
    isBlocked(user1ID: number, user2ID: number) {
      if (!user1ID || !user2ID) return (0);
      let user1 = this.getUserFromId(user1ID)
      if (!user1 || !user1.friendsID) return 0;
      let relationWithUser2 = user1.friendsID.find(relation => relation.friendID == user2ID);
      if (!relationWithUser2) return 0;
      if (relationWithUser2.isBlocked) return 1;
      return 0;
    },

  toggleContextMenu(userId: number) {
      if (this.userActionCursorOn == userId)
        this.userActionCursorOn = 0;
      else
        this.userActionCursorOn = userId;
    },
    toggleTimer(timerOn: number) {
      if (timerOn == this.timerCursorOn)
        this.timerCursorOn = 0;
      else
        this.timerCursorOn = timerOn;
    },

    getUserFromId(userID: number) {
      const user = this.userList.find(user => user.id == userID);
      if (user)
        return (user);
      return {id: 0, name: ''} as User;
    },

    getChannelFromID(channelID: number) {
      const channel = this.listChannels.find(channel => channel.id == channelID);
      if (channel)
        return (channel);
      return {id: 0} as Channel;
    },

    getChannelName() {
      if (this.chatboxOnChannel.isDirect) {
        const otherUser = this.chatboxOnChannel.users.find(user => user.id !== this.logedUser.id);
        if (otherUser) { return otherUser.name }
      }
      return this.chatboxOnChannel.name
    },

  updateChannelListFrag(data: Channel[]) {
    console.log('Socket.io: updateChanList: chatboxOnChannelID: ', this.chatboxOnChannel.name);
    console.log('data:', data);
    data.sort((a, b) => a.id - b.id);
    this.listChannels = [];
    let cpy = [] as Channel[];
    cpy.push({id: -1,} as Channel);
    console.log(cpy);
    this.chatboxOnChannelID = this.chatboxOnChannel.id;
    this.chatboxOnChannel = { id: 0 } as Channel;

    for (let i = 0; i < data.length; i++) {
      this.channelWhileUpdating = data[i];
      // this.channelWhileUpdating.muteID = data[i].muteID;
      cpy.push(this.channelWhileUpdating);
    }
    for (let i = 0; i < cpy.length; i++) {
      this.channelWhileUpdating = cpy[i];
      // if (i != 0) {
      //   this.channelWhileUpdating.muteID = cpy[i].muteID;
      // }
      this.listChannels.push(this.channelWhileUpdating);
    }
    if (this.chatboxOnChannelID !== 0) {
      this.chatboxOnChannel = this.listChannels.find(channel => channel.id === this.chatboxOnChannelID) as Channel;
    }
    console.log('listChannel at the end of updateListChannel: ', this.listChannels);
  },

  updateUsersListFrag(data: User[]) {
    console.log('Socket.io: updateFRiends list');
    this.userList = [];
    for (let i = 0; i < data.length; i++) {
      let userInList = data[i];
      this.userList.push(userInList);
    }
    let tmp = this.logedUser.id;
    this.logedUser = this.userList.find(user => user.id == tmp) as User;
    console.log('userList : ', this.userList);
  }
},

// Reception sur le socket
  mounted() {

// MISE A JOUR DE LA LISTE DES CHANNELS

    this.socket.on('updateChannelList', (data) => {
      this.updateChannelListFrag(data);
    })
    this.socket.on('updateUsersList', (data) => {
      this.updateUsersListFrag(data);
    })
  },
  })
</script>
