<template>
    <main>
        <v-btn variant="outlined" v-on:click="load" :class="{ invisible: game }" id="recherche">Trouver un adversaire aléatoire</v-btn>
        <h1 :class="{ invisible: !game }">{{ left.score }} - {{ right.score }}</h1>
        <!-- <div :class="{ invisible: !loading }" id="loading"> -->
          <v-dialog
          v-model="loading"
          :scrim="false"
          persistent
          width="auto"
        >
          <v-card
            color="white"
          >
            <v-card-text>
              Nous recherchons un adversaire
              <v-progress-linear
                indeterminate
                color="#ae7cd6"
                class="mb-0"
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>


        <v-dialog v-model="endGame">
          <v-card title="VICTOIRE">
            <v-card-text>
              La partie est terminée car votre adversaire a quitté le jeu.
              <v-spacer></v-spacer>
              Vous remportez la partie !
            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
        
                <v-btn
                  text="Fermer"
                  @click="endGame = false">
                </v-btn>
              </v-card-actions>
          </v-card>
        </v-dialog>
          <!-- <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe> -->
        <!-- </div> -->
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
        socket: io('http://10.34.9.8:3000', { transports : ['websocket'] }),
        // socket: io('http://10.34.9.8:3000'),
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
        game: false,
        gameID: 0,
        arrowup : false,
        arrowdown : false,
        justPressed : false,
        endGame: false
      }
    },
    mounted() {
      window.addEventListener('keydown', this.KeyDownEvt);
      window.addEventListener('keyup', this.KeyUpEvt);
      this.socket.on('newBall', (data: any) => {
        this.ball.x = data.x,
        this.ball.y = data.y,
        this.ball.size = data.size
      })
      this.socket.on('forceEndGame', () => {
        this.endGame = true;
        this.game = false;
        this.socket.emit('endGame');
      })
      window.addEventListener('keyup', this.KeyUpEvt);
      this.socket.on('initGame', () => {     
        const text = <HTMLInputElement>document.getElementsByClassName('v-btn__content')[3];
        if (text)
          text.innerHTML = 'Trouver un adversaire aléatoire'
        this.game = true;
        this.loading = false;
        requestAnimationFrame(this.renderGame);
      })
      this.socket.on('posUpdate', (data: any) =>{
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
      this.socket.on('goal', (leftPlayer: any, rightPlayer: any) => {
        this.left.score = leftPlayer.score;
        this.right.score = rightPlayer.score;
      })
      this.socket.on('ballPos', (data: any) => {
        this.ball.x = data.x;
        this.ball.y = data.y;
        this.ball.size = data.size;
      })
    },
    beforeRouteLeave(to, from, next)  {
      this.socket.emit('pageChanged');
      next();
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
      getParseUser() {
        const user = localStorage.getItem('currentUser')
        if (user)
          return (JSON.parse(user))
        return null
      },
      async load(){
        const text = <HTMLInputElement>document.getElementsByClassName('v-btn__content')[3];
        if (this.loading == false)
        {
          this.loading = true;
          const user = this.getParseUser();
          const userID = user.id;
          this.socket.emit('newPlayer', userID);
          if (text)
          {
            text.innerHTML = "Arreter la recherche"
          }
        }
        else
        {
          this.loading = false;
          this.socket.emit('deletePlayer');
          if (text)
            text.innerHTML = 'Trouver un adversaire aléatoire'
        }
      },
    }
  })
  </script>

<style> 
button {
  color: #ae7cd6 !important;
}

#spin {
  color: black !important;
}
</style>