<template>
    <main>
        <v-btn color="success" v-on:click="load" :class="{ invisible: game }">Trouver une partie</v-btn>
        <!-- <p>{{ key }}</p> -->
        <div :class="{ invisible: !loading }" id="loading">
          <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe>
        </div>
        <canvas id="game" :class="{ invisible: !game }" width="900" height="500"></canvas>
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
        socket: io('ws://localhost:3000', { transports : ['websocket'] }),
        key: 'aucune',
        context: {},    
        position: {
          x: 0,
          y: 0
        },
        loading: false,
        socketRef: '',
        game: false,
        gameID: 0,
      }
    },
    mounted() {
      var c = <HTMLCanvasElement>document.querySelector('canvas');
      if (!c)
        throw new Error('failed to get canvas');
      // c.width = window.innerWidth / 2;
      // c.height = c.width / 2;
      var ctx = c.getContext("2d");
      if (!ctx)
        throw new Error('failed to get 2D context');
      ctx.fillStyle = '#6d4db6';
      ctx.translate(0.5, 0.5);
      ctx.fillRect(c.width / 200, (c.height / 2)  - (c.height / 4 / 2) , c.width / 50, c.height / 4);
      ctx.fillRect(c.width - (c.width / 50) - (c.width / 200), (c.height / 2)  - (c.height / 4 / 2) , c.width / 50, c.height / 4);
      ctx.imageSmoothingEnabled = false;
      window.addEventListener('keydown', this.KeypressEvt);
      this.socket.on('KeyPressed', (data: string) => {
        this.key = data;
      });
      this.socket.on('socketRef', (data:string) => {
        console.log(data);
        this.socketRef = data;
      });
      this.socket.on('gameStarted', (data: number) => {
        this.game = true;
        this.loading = false;
        console.log('gameID = ' + data);
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
          console.log(this.socketRef)
          await axios.post('api/pong', {
            socket: this.socketRef
          });
          const players = await axios.get('api/pong');
          console.log(players.data.length);
          console.log("players id = ");
          console.log(players.data[0].id);
          if (players.data.length >= 2)
          {
            this.socket.emit('initGame', players.data[0], players.data[1]);
            await axios.delete('api/pong/' + players.data[0].id);
            await axios.delete('api/pong/' + players.data[1].id);
          }
        }
        else
        {
          this.loading = false;
          const me = await axios.get('api/pong/' + this.socketRef);
          if (me != null)
          {
            console.log(me.data.id);
            await axios.delete('api/pong/' + me.data.id)
          }
        }
      }
    }
  })
  </script>
