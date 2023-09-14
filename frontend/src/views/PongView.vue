<template>
    <main>
        <v-btn color="success" v-on:click="load" :class="{ invisible: game }">Trouver une partie</v-btn>
        <div :class="{ invisible: !loading }" id="loading">
          <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe>
        </div>
        <canvas :class="{ invisible: !game }" id="game"></canvas>
    </main>
  </template>
  
  <script lang="ts">
  import { RouterLink, RouterView } from 'vue-router'
  import { defineComponent } from 'vue';
  import { io } from 'socket.io-client';
  import axios from 'axios';
  
  export default defineComponent({
    name: 'PongView',
    components: ({}),
    data() {
      return {
        socket: io('http://localhost:3000'),
        key: 'aucune',
        context: {},
        position: {
          x: 0,
          y: 0
        },
        loading: false,
        socketRef: '',
        game: false
      }
    },
    mounted() {
      window.addEventListener('keydown', this.KeypressEvt);
      this.socket.on('KeyPressed', (data: string) => {
        this.key = data;
      });
      this.socket.on('InitGame', () => {
        this.loading = false;
      }) ;
      this.socket.on('socketRef', (data:string) => {
        console.log(data);
        this.socketRef = data;
      })
    },
    methods: {
      KeypressEvt(event: KeyboardEvent) {
        this.socket.emit('keypress', event.key);
      },
      async load() {
        if (this.loading == false)
        {
          this.loading = true;
          await axios.post('http://localhost:3000/pong', {
            socket: this.socketRef
          });
          console.log("apres le post");
          const nbPlayers = await axios.get('http://localhost:3000/pong/waiting');
          if (nbPlayers.data >= 2)
            this.socket.emit('initGame');
        }
        else
        {
          this.loading = false;
          const me = await axios.get('http://localhost:3000/pong/' + this.socketRef);
          if (me != null)
          {
            await axios.delete('http://localhost:3000/pong/' + this.socketRef)
          }
        }
      }
    }
  })
  </script>
