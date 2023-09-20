<template>
    <main>
        <v-btn color="success" v-on:click="load" :class="{ invisible: game }">Trouver une partie</v-btn>
        <!-- <p>{{ key }}</p> -->
        <div :class="{ invisible: !loading }" id="loading">
          <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe>
        </div>
        <canvas id="game" :class="{ invisible: !game }"></canvas>
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
        game: false,
        gameID: 0,
      }
    },
    mounted() {
      var c = <HTMLCanvasElement>document.querySelector('canvas');
      if (!c)
        throw new Error('failed to get canvas');
      c.width = window.innerWidth / 2;
      c.height = window.innerHeight / 2;
      var ctx = c.getContext("2d");
      if (!ctx)
        throw new Error('failed to get 2D context');
      ctx.fillStyle = '#00bd7e';
      ctx.fillRect(0, (c.height / 2)  - (c.height / 3 / 2) , 10, c.height / 3);
      ctx.fillRect(c.width - 10, (c.height / 2)  - (c.height / 3 / 2) , 10, c.height / 3);
      window.addEventListener('keydown', this.KeypressEvt);
      this.socket.on('KeyPressed', (data: string) => {
        this.key = data;
      });
      // this.socket.on('InitGame', () => {
      //   this.loading = false;
      // });
      this.socket.on('socketRef', (data:string) => {
        console.log(data);
        this.socketRef = data;
      });
      this.socket.on('gameStarted', (data: number) => {
        this.game = true;
        this.loading = false;
        // this.canvas!.width = window.innerWidth;
        // this.canvas!.height = window.innerHeight / 2;
        // this.canvas.style.border = 1px solid blue;
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
          await axios.post('http://localhost:3000/pong', {
            socket: this.socketRef
          });
          const nbPlayers = await axios.get('http://localhost:3000/pong/waiting');
          console.log(nbPlayers.data);
          const players = await axios.get('http://localhost:3000/pong');
          console.log(players.data);
          if (nbPlayers.data >= 2)
          {
            // await axios.post('http://localhost:3000/games')
          
            // , {
            //   PlayersID : [players.data[0], players.data[1]]
            //   })
            // console.log(this.gameID)
            // console.log('id = ');
            // console.log(players.data[0].id);
            this.socket.emit('initGame', players.data[0], players.data[1]);
            await axios.delete('http://localhost:3000/pong/' + players.data[0].id);
            await axios.delete('http://localhost:3000/pong/' + players.data[1].id);
          }
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
