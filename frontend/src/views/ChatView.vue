
<template>
  <main>
    <h1>Page Chat</h1>
      <input type="text" id="usernameEntry" name="username" v-model="usernameToSend" autocomplete="off">
      <button @click="sendUsername">send cacasername</button>
    <button @click="onClickButton">boutonTry</button>
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
      }
    },
    methods: {
      async onClickButton() {
        console.log('click button');
        try {
          const response = await axios.post('/api/chat/buttonTest');
          console.log('Réponse du serveur :', response.data);
        } catch (error) {
          console.error('Erreur lors de la requête :', error);
        }
      },
      async sendUsername() {
        console.log('send username button');
        try {
          const reponse = await axios.post('/api/chat/setUsername', {
            username: this.usernameToSend,
          });
          console.log({ username: this.usernameToSend });
        } catch { console.error(); }
      }
    }
  })
</script>
