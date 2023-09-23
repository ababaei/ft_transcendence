
<template>
  <main>
    <h1>Page Chat</h1>

<!-- partie login et affichage du user -->
    <form id="userDiv" @submit.prevent="sendUsername">
      <input v-if="!logedUser.id" type="text" id="usernameEntry" name="username" v-model="usernameToSend" autocomplete="off">
      <button v-if="!logedUser.id">send username</button>
    </form>
    <h2 v-if="logedUser">[  {{ logedUser.name }}  ]</h2>

<!-- partie chatbox                    -->

    <div id="chatboxDiv" v-if="logedUser.id && chatboxOnChannel.id">
      <h2> ~ Chatbox ~ </h2>
      <h3 id="channelName"> {{ chatboxOnChannel.name }} </h3>
      <button @click="switchChatboxWindow"> {{ switchChatboxButton }}</button>

      <!-- fenetre d'info channel -->

      <div id="channelInfo" v-if="chatboxWindow==0">

        <div id="joinChannel" v-if="!isUserInChannel(logedUser.id, chatboxOnChannel)">
          <input id="passwordJoinEntry" v-model="passwordToJoin"
          v-if="chatboxOnChannel.mode==='protected'" placeholder="Password">
          <button @click="joinChannel()">Join</button>
        </div>

        <p> this channel is {{ chatboxOnChannel.mode }}</p>

        <!-- checkbox d'action sur le channel -->
        <label for="channelAction">Channel Action</label>
        <input type="checkbox" id="channelAction" v-model="channelActionCheckbox">
        <div id="channelActionList" v-if="channelActionCheckbox">
          <ul>
            <li><button @click="leaveChannel">Leave channel</button></li>
            <li v-if="chatboxOnChannel.ownerID===logedUser.id"><button>Change channel mode</button></li>
            <li v-if="chatboxOnChannel.ownerID===logedUser.id"><button>Change channel name</button></li>
            <li v-if="chatboxOnChannel.ownerID===logedUser.id"><button>Change channel password</button></li>
            <li v-if="chatboxOnChannel.ownerID===logedUser.id">
              <button @click="destroyChannel">Destroy channel</button></li>
          </ul>
        </div>
        
        <!-- Liste des users du channel -->
        <h6>Users in channel</h6>
        <ul id = "channelUserList">
          <li v-for="user in chatboxOnChannel.users" :key="user.id">
            {{ user.name }}
            <h6 v-if="user.id === chatboxOnChannel.ownerID"> owner </h6>
            <input type="checkbox">
          </li>
        </ul>
      </div>

      <!-- fenetre des messages -->
      <div id="convWindow" v-if="chatboxWindow==1">
        <h6>Conversation</h6>
        <ul id="messageHistory">
          <li v-for="message in chatboxOnChannel.messages" :key="message.id">
            <p>{{ message.user.name }} : {{ message.text }}</p>
          </li>
        </ul>
        <form @submit.prevent="sendMessage">
          <input id="messageEntry" type="text" name="messageBody"
          v-model="messageToSend" placeholder="Message">
          <button>send</button>
        </form>
      </div>
    </div>

<!-- partie liste des channels et creations de channels -->
    <div id="channelsHub" v-if="logedUser.id">
      <div>
      <h2> ~ Channel list ~ </h2>
      <ul div="channelsList">
        <li v-for="channel in listChannels" :key="channel.id">
          <div @click="selectChannel(channel)" id="channelDescriptionBar">
            {{ channel.name }} - 
            {{ channel.mode }}
          </div>
        </li>
      </ul>
      </div>
      <div>
      <form @submit.prevent="createNewChannel">
        <h4>Channel creation form</h4>
        <input type="text" id="channelEntry" name="channelname"
        placeholder="Channel name"
        v-model="channelCreationName" autocomplete="off">
        <div>
          <input type="radio" id="public" value="public" v-model="channelType">
          <label for="public">Public</label>
          
          <input type="radio" id="private" value="private" v-model="channelType">
          <label for="private">Private</label>
          
          <input type="radio" id="protected" value="protected" v-model="channelType">
          <label for="protected">Protected</label>
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
        messageToSend: '' as string,
        channelType: "public",
        passwordChannel: '' as string,
        passwordToJoin: '' as string,
        chatboxWindow: 0,
        switchChatboxButton: 'Infos',
        channelActionCheckbox: false
      }
    },
    methods: {

  // setup d'un pseudo utilisateur
      async sendUsername() {
        try {
          const reponse = await axios.post('/api/chat/setUsername', {
            username: this.usernameToSend,
          });
          this.logedUser.id = reponse.data.userid;
          this.logedUser.name = reponse.data.username;
          console.log('methods: senndUsername:', this.logedUser);
        } catch { console.error(); }
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
      this.channelType = 'Public'
    },

    async selectChannel(channel: Channel) {
      this.chatboxOnChannel = channel;
      console.log('methods: selectChannel:', this.chatboxOnChannel);
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

// actions sur le channel

    async destroyChannel() {
      console.log('methods: Destroy channel');
      const reponse = await axios.post('/api/chat/destroyChannelRequest', {
        channelID: this.chatboxOnChannel.id,
      })
    },

    async leaveChannel() {
      console.log('methods: LeaveChannel');
      const reponse = await axios.post('/api/chat/leaveChannelRequest', {
        userID: this.logedUser.id,
        channelID: this.chatboxOnChannel.id,
      });
    }

  // Reception sur le socket
  },
  mounted() {
    this.socket.on('updateChannelList', (data) => {
      this.listChannels = data;
      console.log('Socket.io: updateChanList');
    })
    this.socket.on('newMessage', data => {
      console.log('Socket.io: newMessage: data: ', data);
      if (data.channelID == this.chatboxOnChannel.id) {
        console.log('Socket.io: update channel on chatbox')
        this.chatboxOnChannel.messages.push(data);
      }
      else  {
        console.log('Socket.io: newMessage: update occult channel');
        (this.listChannels.find((channel) => channel.id === data.channelID))?.messages.push(data);
      }
    })
    this.socket.on('updateChannelUserList', (channel, user) => {
      console.log('Socket.io: updateChannelUserList')
      if (channel.id == this.chatboxOnChannel.id)
        this.chatboxOnChannel.users.push(user);
      else {
        (this.listChannels.find(channel => channel.id === channel.id))?.users.push(user);
      }
    })
    this.socket.on('channelHasBeenDestroyed', (channelID) => {
      console.log('Socket.io: channelHasBeenDestroyed')
      this.listChannels = this.listChannels.filter(channel => channel.id !== channelID);
      if (this.chatboxOnChannel.id == channelID) {
        this.chatboxOnChannel = {id: 0} as Channel;
      }
    })
    this.socket.on('userLeavedChannel', (userID, channelID) => {
      console.log('Socket.io: channelHasBeenLeaved');
      const channelIndex = this.listChannels.findIndex(channel => channel.id === channelID);
      if (channelIndex !== -1) {
        console.log('in if cond')
        const channel = this.listChannels[channelIndex];
        channel.users = channel.users.filter(user => user.id !== userID);
        this.listChannels = this.listChannels.filter(channel => channel.id !== channelID);
        this.listChannels.push(channel);
      }
    })
  },
  })
</script>
