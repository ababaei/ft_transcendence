<template>
    <main class="mt-10">
        <v-btn variant="outlined" v-on:click="load" :class="{ invisible: game }" id="recherche">Trouver un adversaire aléatoire</v-btn>
<div id="regles">
  <h3>Tu peux diriger ta raquette avec les fleches du haut et du bas de ton clavier.</h3>
  <h3>La partie se joue en 3 points.</h3>
  <h3>Si tu quittes une partie en cours, tu perdras automatiquement 3 - 0.</h3>
</div>

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


      <v-dialog v-model="alreadyWaiting">
          <v-card title="DOUBLE CONNEXION">
            <v-card-text>
              Il semblerait que vous soyez deja en train de chercher un adversaire... 
              <v-spacer></v-spacer>
              Verifiez que vous n'etes pas connecte sur un autre onglet puis retentez votre chance            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
        
                <v-btn
                  text="Fermer"
                  @click="alreadyWaiting = false">
                </v-btn>
              </v-card-actions>
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

        <v-dialog v-model="victory">
          <v-card title="GAGNÉ !">
            <v-card-text>
              La partie est terminée car vous avez atteint 3 points.
              <v-spacer></v-spacer>
              Vous remportez la partie !
            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
        
                <v-btn
                  text="Fermer"
                  @click="victory = false">
                </v-btn>
              </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="defeat">
          <v-card title="PERDU !">
            <v-card-text>
              La partie est terminée car votre adversaire a marqué 3 points.
              <v-spacer></v-spacer>
              Vous perdez la partie !
            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
        
                <v-btn
                  text="Fermer"
                  @click="defeat = false">
                </v-btn>
              </v-card-actions>
          </v-card>
        </v-dialog>
          <!-- <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe> -->
        <!-- </div> -->
        <canvas id="game" :class="{ invisible: !game }" width="600" height="300"></canvas>
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
        socket: io(process.env.VITE_HOST, { transports : ['websocket'] }),
        ratio : 1,
        key: 'aucune',
        canvas: {
          width: 600,
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
        endGame: false,
        victory: false,
        defeat: false,
        alreadyWaiting: false
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
      this.socket.on('alreadyWaiting', () => {
        this.loading = false;
        this.alreadyWaiting = true;
        const text = <HTMLInputElement>document.getElementsByClassName('v-btn__content')[3];
        text.innerHTML = 'Trouver un adversaire aléatoire'
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
      this.socket.on('Winner', (winner: any) => {
        this.game = false;
        const user = this.getParseUser();
        if (winner.id == user.id)
          this.victory = true;
        else
          this.defeat = true;
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
      this.socket.on('goal', (Winner: any) => {
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
          return;
        var ctx = c.getContext("2d");
        if (!ctx)
          return;
        if (window.innerWidth < 700)
        {
          this.ratio = 600 / (window.innerWidth - 100)
          c.width = 600 / this.ratio;
          c.height = 300 / this.ratio;
        }
        else
        {
          this.ratio = 1
          c.width = 600
          c.height = 300
        }
        // console.log(this.ratio)
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#6d4db6';
        ctx.fillRect(this.left.x / this.ratio, this.left.y / this.ratio, this.paddleSize.width / this.ratio, this.paddleSize.height / this.ratio);
        ctx.fillRect(this.right.x / this.ratio, this.right.y / this.ratio, this.paddleSize.width / this.ratio, this.paddleSize.height / this.ratio);
        ctx.imageSmoothingEnabled = false;
        ctx.beginPath();
        ctx.arc(this.ball.x / this.ratio, this.ball.y / this.ratio, this.ball.size / this.ratio, 0, Math.PI * 2, false);
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

#regles {
  margin-top: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

</style>