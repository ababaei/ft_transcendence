<template>
    <main>
        <v-btn color="success" v-on:click="load" :class="{ invisible: game }">Trouver une partie</v-btn>
        <!-- <p>{{ key }}</p> -->
        <div :class="{ invisible: !loading }" id="loading">
          <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe>
        </div>
        <canvas id="game" :class="{ invisible: !game }" width="700" height="300"></canvas>
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
          canvas: {
            width: 700,
            height: 300
          },
          paddleSize: {
            width: 15,
            height: 80
          },
          left: {
            x: 4,
            y: 110
          },
          right: {
            x: 681,
            y: 110
          },
          ball: {
            x: 350,
            y: 150,
            size: 5,
            direction: 2
          }
        },
        loading: false,
        socketRef: '',
        game: false,
        gameID: 0,
        x:0,
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
      window.addEventListener('keydown', this.KeypressEvt);
      this.socket.on('KeyPressed', (data: any) => {
        // this.key = data.key;
        // this.position = data.position;
        console.log("data position :")
        console.log(data);
      });
      this.socket.on('socketRef', (data:string) => {
        console.log(data);
        this.socketRef = data;
      });
      this.socket.on('gameStarted', (data: number) => {
        this.game = true;
        this.loading = false;
        this.gameID = data;
        this.animateBall();
      })
    },
    methods: {
      KeypressEvt(event: KeyboardEvent) {
        this.socket.emit('keypress', event.key, this.gameID, this.position);
      },
      animateBall() {
        var c = <HTMLCanvasElement>document.querySelector('canvas');
        if (!c)
          throw new Error('failed to get canvas');
        // c.width = window.innerWidth / 2;
        // c.height = c.width / 2;
        var ctx = c.getContext("2d");
        if (!ctx)
          throw new Error('failed to get 2D context');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#6d4db6';
        // ctx.translate(0.5, 0.5);
        ctx.fillRect(this.position.left.x, this.position.left.y, this.position.paddleSize.width, this.position.paddleSize.height);
        ctx.fillRect(this.position.right.x, this.position.right.y, this.position.paddleSize.width, this.position.paddleSize.height);
        ctx.imageSmoothingEnabled = false;
        requestAnimationFrame(this.animateBall);
        ctx.beginPath();
        ctx.arc(this.position.ball.x, this.position.ball.y, this.position.ball.size, 0, Math.PI * 2, false);
        ctx.fill();
        // if (this.position.ball.x < this.position.canvas.width - this.position.ball.size)
        //   this.position.ball.x+=1;
        if (this.position.ball.x + this.position.ball.size > this.position.canvas.width)
          this.position.ball.direction *= -1;
        if (this.position.ball.x - this.position.ball.size < 0)
          this.position.ball.direction *= -1;
        this.position.ball.x += this.position.ball.direction;
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
