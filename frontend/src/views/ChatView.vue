
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
      <h3 id="channelName"> {{ chatboxOnChannel.name }} </h3>
      <button @click="switchChatboxWindow"> {{ switchChatboxButton }}</button>

  <!-- INFO CHANNEL -->

      <div id="channelInfo" v-if="chatboxWindow==0">

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
          <div id="joinChannel" v-if="!isUserInChannel(logedUser.id, chatboxOnChannel)">
            <input id="passwordJoinEntry" v-model="passwordToJoin"
            v-if="chatboxOnChannel.mode==='protected'" placeholder="Password">
            <button @click="joinChannel()">Join</button>
          </div>
      <!-- JOINCHANNEL FIN -->

      <!-- DESTROY/LEAVE CHANNEL -->
          <label for="channelAction">Channel Action</label>
          <input type="checkbox" id="channelAction" v-model="channelActionCheckbox">
          <div id="channelActionList" v-if="channelActionCheckbox">
            <ul>
              <li><button @click="leaveChannel">Leave channel</button></li>
              <li v-if="chatboxOnChannel.ownerID===logedUser.id">
                <button @click="destroyChannel">Destroy channel</button></li>
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
                <button v-if="!isMute(user.id, chatboxOnChannel.id)" @click="toggleTimer(1)">Mute</button>
                <div id="timerButtons" v-if="timerCursorOn==1">
                  <button @click="muteUser(user.id, chatboxOnChannel.id, 0.25)"> 1 min </button>
                  <button @click="muteUser(user.id, chatboxOnChannel.id, 30)"> 30 min </button>
                  <button @click="muteUser(user.id, chatboxOnChannel.id, 60)"> 1 hour</button>
                </div>
                <button v-if="isMute(user.id, chatboxOnChannel.id)"
                @click="unmuteUser(user.id, chatboxOnChannel.id)">unmute</button>

            <!-- KICK -->
                <button @click="kickUserFromChannel(user.id, chatboxOnChannel.id)">Kick</button>

            <!-- BAN -->
                <button @click="toggleTimer(2)">Ban</button>
                <div id="timerButtons" v-if="timerCursorOn==2">
                  <button> 30 min </button>
                  <button> 1 hour </button>
                  <button> 8 hour</button>
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
          <li v-for="message in chatboxOnChannel.messages" :key="message.id">
            <p>{{ message.user.name }} : {{ message.text }}</p>
          </li>
        </ul>
        <form @submit.prevent="sendMessage" v-if="!isMute(logedUser.id, chatboxOnChannel.id)">
          <input id="messageEntry" type="text" name="messageBody"
          v-model="messageToSend" placeholder="Message">
          <button>send</button>
        </form>
        <h4 v-if="isMute(logedUser.id, chatboxOnChannel.id)">You are mute</h4>
      </div>
    </div>

<!-- CHANNEL LIST -->
    <div id="channelsHub" v-if="logedUser.id">
      <div>
      <h2> ~ Channel list ~ </h2>
      <ul div="channelsList">
        <li v-for="channel in listChannels" :key="channel.id">
          <div @click="selectChannel(channel)" id="channelDescriptionBar">
            {{ channel.name }} - {{ channel.mode }}
          </div>
        </li>
      </ul>
      </div>
      <div>
<!-- CREATION CHANNEL -->
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
    </div>
  </main>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios'
  import { io } from 'socket.io-client';

  interface User {
    id: number;
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
    users: User[]
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

    async selectChannel(channel: Channel) {
      this.chatboxOnChannel = channel;
      this.chatboxOnChannelID = channel.id;
      this.channelNewName = channel.name;
      this.passwordChannelEdit = channel.password;
      this.channelTypeEdit = channel.mode;
      this.chatboxWindow = 0;
      this.channelActionCheckbox = false;
      this.userActionCursorOn = 0;
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

    async joinChannel() {
      console.log('methods: joinChannel');
      const reponse = await axios.post('/api/chat/joinChannelRequest', {
        channelID: this.chatboxOnChannel.id,
        userID: this.logedUser.id,
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

  isMute(userID: number, channelID: number) {
      const channelMuted = this.listChannels.find(channel => channel.id = channelID)?.muteID;
      if (!channelMuted)
        return 0;
      if (channelMuted.find(user => user == userID))
        return (1)
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

  updateChannelListFrag(data: Channel[]) {
    console.log('Socket.io: updateChanList: chatboxOnChannelID: ', this.chatboxOnChannel.name);
    console.log('data:', data);
    data.sort((a, b) => a.id - b.id);
    this.listChannels = [];
    this.chatboxOnChannelID = this.chatboxOnChannel.id;
    this.chatboxOnChannel = { id: 0 } as Channel;

    for (let i = 0; i < data.length; i++) {
      this.channelWhileUpdating = data[i];
      this.listChannels.push(this.channelWhileUpdating);
    }
    if (this.chatboxOnChannelID !== 0) {
      this.chatboxOnChannel = this.listChannels.find(channel => channel.id === this.chatboxOnChannelID) as Channel;
    }
    console.log('listChannel at the end of updateListChannel: ', this.listChannels);
  },
},

// Reception sur le socket
  mounted() {

// MISE A JOUR DE LA LISTE DES CHANNELS

    this.socket.on('updateChannelList', (data) => {
      this.updateChannelListFrag(data);
    })
  },
  })
</script>
