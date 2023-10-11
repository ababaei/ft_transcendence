<template>
    <main>
        <v-btn color="success" v-on:click="loadingF" :class="{ invisible: game }">Trouver une partie</v-btn>
        <h1 :class="{ invisible: !game }">{{ left.score }} - {{ right.score }}</h1>
        <div :class="{ invisible: !loading }" id="loading">
          <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe>
        </div>
        <canvas id="game" :class="{ invisible: !game }" width="700" height="300"></canvas>
    </main>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue';
  import { io } from 'socket.io-client';
  import axios from 'axios';
  
  export default defineComponent({
    name: 'PongView',
    components: ({}),
    data() {
      return {
        socket: io('http://localhost:3000', { transports : ['websocket'] }),
        // socket: io('http://localhost:3000'),
        key: 'aucune',
        canvas: {
          width: 700,
          height: 300
        },
        paddleSize: {
          width: 15,
          height: 80
        },
        left: {
          x: 0,
          y: 0,
          score: 0
        },
        right: {
          x: 0,
          y: 0,
          score: 0
        },
        ball: {
          x: 0,
          y: 0,
          size: 0,
          direction: {
            x: 1,
            y: 0
          }
        },
        loading: false,
        socketRef: '',
        game: false,
        gameID: 0,
        arrowup : false,
        arrowdown : false,
        justPressed : false
      }
    },
    mounted() {
      window.addEventListener('keydown', this.KeyDownEvt);
      window.addEventListener('keyup', this.KeyUpEvt);
      this.socket.on('socketRef', (data:string) => {
        const user = localStorage.getItem('user');
        if (user == null || this.game == false)
          localStorage.setItem('user', data);
        else {
          this.socket.emit('updateSocket', user);
          localStorage.setItem('user', data);
        }
        this.socketRef = data;
      });
      // this.socket.on('gameStarted', (data: number) => {
      //   this.game = true;
      //   this.loading = false;
      //   this.gameID = data;
      //   requestAnimationFrame(this.gameLoop);
      // });
      this.socket.on('newBall', (data: any) => {
        this.ball.x = data.x,
        this.ball.y = data.y,
        this.ball.size = data.size
      })
      this.socket.on('initGame', (data: any) => {
        for (let i = 0; i < 2; i++){
          if (data[i].side === 'left') {
            this.left.x = data[i].x;
            this.left.y = data[i].y;
            this.left.score = data[i].score;
          }
          else {
            this.right.x = data[i].x;
            this.right.y = data[i].y;
            this.right.score = data[i].score;
          }
        }
        this.game = true;
        this.loading = false;
        requestAnimationFrame(this.renderGame);
      })
      this.socket.on('posUpdate', (data: any) =>{
        console.log(data);
          if (data.side === 'left') {
            this.left.x = data.x;
            this.left.y = data.y;
            this.left.score = data.score;
          }
          else {
            this.right.x = data.x;
            this.right.y = data.y;
            this.right.score = data.score;
          }
      })
      this.socket.on('goal', (data: any) => {
        this.left.score = data[0].score;
        this.right.score = data[0].score;
      })
      this.socket.on('ballPos', (data: any) => {
        this.ball.x = data.x;
        this.ball.y = data.y;
        this.ball.size = data.size;
      })
    },
    methods: {
      KeyDownEvt(e: KeyboardEvent) {
        if(e.key === 'ArrowUp'){
          if(this.arrowup === false)
            this.justPressed = true;
          this.arrowup = true;
        }        
        if(e.key === 'ArrowDown'){
          if(this.arrowdown === false)
            this.justPressed = true;
          this.arrowdown = true;
        }
        if(this.justPressed === true && this.game == true)
        {
          let userCommand = {
            up : this.arrowup,
            down : this.arrowdown
          }
          this.socket.emit('keypress', userCommand);
          this.justPressed = false;
        }
      },
      KeyUpEvt(e: KeyboardEvent) {
        if(e.key === 'ArrowUp') {
          this.arrowup = false;
        }
        if(e.key === 'ArrowDown') {
          this.arrowdown = false;
        }
        let userCommand = {
            up : this.arrowup,
            down : this.arrowdown
          }
        if (this.game == true)
          this.socket.emit('keypress', userCommand);
      },
      renderGame() {
        var c = <HTMLCanvasElement>document.querySelector('canvas');
        if (!c)
          throw new Error('failed to get canvas');
        var ctx = c.getContext("2d");
        if (!ctx)
          throw new Error('failed to get 2D context');
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#6d4db6';
        ctx.fillRect(this.left.x, this.left.y, this.paddleSize.width, this.paddleSize.height);
        ctx.fillRect(this.right.x, this.right.y, this.paddleSize.width, this.paddleSize.height);
        ctx.imageSmoothingEnabled = false;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2, false);
        ctx.fill();
        requestAnimationFrame(this.renderGame);
      },
      async loadingF(){
        if (this.loading == false)
        {
          this.loading = true;
          this.socket.emit('newPlayer');
        }
      },
      async load() {
        if (this.loading == false)
        {
          this.loading = true;
          // console.log(this.socketRef)
        //   await axios.post('api/pong', {
        //     socket: this.socketRef
        //   });
        //   const players = await axios.get('api/pong');
        //   console.log(players.data.length);
        //   console.log("players id = ");
        //   console.log(players.data[0].id);
        //   if (players.data.length >= 2)
        //   {
        //     this.socket.emit('initGame', players.data[0], players.data[1]);
        //     await axios.delete('api/pong/' + players.data[0].id);
        //     await axios.delete('api/pong/' + players.data[1].id);
        //   }
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
