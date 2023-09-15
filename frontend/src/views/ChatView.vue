
<template>
  <main>
    <h1>Page Chat</h1>
    <form>
      <input type="text" id="username">
      <button @click="sendUsername">send sername</button>
    </form>
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
      }
    },
    methods: {
      async onClickButton() {
        console.log('click button');
        try {
          const response = await axios.post('http://localhost:3000/chat/buttonTest');
          console.log('Réponse du serveur :', response.data);
        } catch (error) {
          console.error('Erreur lors de la requête :', error);
        }
      },
      async sendUsername() {
        console.log('send username button');
        try {
          const reponse = await axios.post('http://localhost:3000/chat/')
        } catch {
        }
      }
    }
  })
</script>
