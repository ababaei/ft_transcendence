
<template>
  <main>
    <h1>Page Chat</h1>

<!-- partie login et affichage du user -->
    <div id="userDiv">
      <input v-if="!logedUser.id" type="text" id="usernameEntry" name="username" v-model="usernameToSend" autocomplete="off">
      <button v-if="!logedUser.id" @click="sendUsername">send username</button>
      <h2 v-if="logedUser">{{ logedUser.name }}</h2>
    </div>

<!-- partie chatbox                    -->

    <div id="chatboxDiv">
      <h2> ~ Chatbox ~ </h2>
      <h3 v-if="chatboxOnChannel" id="channelName">{{ chatboxOnChannel.name }}</h3>
      <ul id="messageHistory">
        <li v-for="message in chatboxOnChannel.messages" :key="message.id">
          <p>{{ message.user.name }} : {{ message.text }}</p>
        </li>
      </ul>
      <input id="messageEntry" type="text" name="messageBody" v-model="messageToSend" autocomplete="off">
      <button @click="sendMessage">send</button>
    </div>

<!-- partie liste des channels et creations de channels -->
    <div id="channelsHub">
      <h2> ~ Channel list ~ </h2>
      <ul div="channelsList">
        <li v-for="channel in listChannels" :key="channel.id">
          {{ channel.name }}
          <button @click="selectChannel(channel)">select</button>
        </li>
      </ul>
      <input type="text" id="channelEntry" name="channelname" v-model="channelToSend" autocomplete="off">
      <button v-if="logedUser.id" @click="sendChannelName">Join/Create channel</button>
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
  }


  export default defineComponent({
    name: 'ChatView',
    components:({}),
    data() {
      return {
        socket: io('http://localhost:3000'),
        usernameToSend: '',
        logedUser: { name: '', id: 0 } as User,
        channelToSend: '',
        listChannels: [] as Channel[],
        chatboxOnChannel: {} as Channel,
        messageToSend: '',
      }
    },
    methods: {

  // setup d'un pseudo utilisateur
      async sendUsername() {
        console.log('send username button');
        try {
          const reponse = await axios.post('/api/chat/setUsername', {
            username: this.usernameToSend,
          });
          this.logedUser.id = reponse.data.userid;
          this.logedUser.name = reponse.data.username;
          console.log(this.logedUser);
        } catch { console.error(); }
      },

  // creer ou join un channel
    async sendChannelName() {
      console.log('send channel creation/join request');
      try {
        const reponse = await axios.post('/api/chat/channelRequest', {
          channel: this.channelToSend,
          userid: this.logedUser.id,
        })
        // console.log(reponse);
      } catch { console.error(); }
    },

    async selectChannel(channel: Channel) {
      this.chatboxOnChannel = channel;
    },

  // envoyer un message

    async sendMessage() {
      console.log('send message to channel');
      try {
        const reponse = await axios.post('/api/chat/messageRequest', {
          text: this.messageToSend,
          user: this.logedUser.id,
          channel: this.chatboxOnChannel.id,
        })
        console.log(reponse);
      } catch { console.error(); }
    },

  // Reception sur le socket
  },
  mounted() {
    this.socket.on('updateChannelList', (data) => {
      console.log('update notif receieved');
      this.listChannels = data;
    })
  },
  })
</script>
