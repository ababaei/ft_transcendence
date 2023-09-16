
<template>
  <main>
    <h1>Page Chat</h1>

<!-- partie login et affichage du user -->
    <div id="userDiv">
      <input v-if="logedUser.userid == 0" type="text" id="usernameEntry" name="username" v-model="usernameToSend" autocomplete="off">
      <button v-if="logedUser.userid == 0" @click="sendUsername">send username</button>
      <p v-if="logedUser.userid != 0">{{ logedUser.username }}</p>
    </div>

<!-- partie chatbox                    -->

    <div id="chatboxDiv">
      <h2> ~ Chatbox ~ </h2>
      <h3 id="channelName"></h3>
      <ul id="messageHistory"></ul>
      <input id="messageEntry" type="text">
      <button>send</button>
    </div>

<!-- partie liste des channels et creations de channels -->
    <div id="channelsHub">
      <h2> ~ Channel list ~ </h2>
      <ul div="channelsList"></ul>
      <input id="channelName" type="text">
      <button>Join/Create channel</button>
    </div>
  </main>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios'

  export default defineComponent({
    name: 'ChatView',
    components:({}),
    data() {
      return {
        usernameToSend: '',
        logedUser: {username: '', userid: 0},
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
          this.logedUser = reponse.data;
          console.log(this.logedUser);

        } catch { console.error(); }
      }
    },
  // creer ou join un channel
    async sendChannelName() {
      console.log('send channel creation/join request');
    }
  })
</script>
