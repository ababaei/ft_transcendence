<template>
    <main class="mt-10">

      <h1 :class="{ invisible: !game }">{{ left.score }} - {{ right.score }}</h1>

          <v-dialog
          v-model="waiting"
          :scrim="false"
          persistent
          width="auto"
        >
          <v-card
            color="white"
          >
            <v-card-text>
              En attente de votre adversaire
              <v-progress-linear
                indeterminate
                color="#ae7cd6"
                class="mb-0"
              ></v-progress-linear>
            </v-card-text>
          </v-card>
        </v-dialog>

        <v-dialog v-model="refused">
          <v-card>
            <v-card-text>
              Votre adversaire a refusé la partie.
            </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
        
                <v-btn
                  text="Fermer"
                  @click="refusedBtn">
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
                  @click="endGameBtn">
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
                  @click="victoryBtn">
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
                  @click="defeatBtn">
                </v-btn>
              </v-card-actions>
          </v-card>
        </v-dialog>
        <canvas id="game" :class="{ invisible: !game }" width="600" height="300"></canvas>
    </main>
  </template>

  <script lang="ts">
  import { defineComponent } from 'vue';
  import { io } from 'socket.io-client';
  import axios from 'axios';
import { faL } from '@fortawesome/free-solid-svg-icons';
  
  export default defineComponent({
    name: 'Private',
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
        waiting: true,
        game: false,
        gameID: 0,
        arrowup : false,
        arrowdown : false,
        justPressed : false,
        endGame: false,
        victory: false,
        defeat: false,
        alreadyWaiting: false,
        // privateID: '' as string,
        side: '',
        refused: false,
        interval: 0
      }
    },
    beforeMount() {
      this.privateID = this.$route.params.gameID
    },
    computed: {
      profileUser() {
        const user = localStorage.getItem('currentUser')
        if (user)
          return (JSON.parse(user))
        return null
    },
      privateID() {
        return this.$route.params.gameID
      }
    },
    async mounted() {
      this.interval = setInterval(this.gameStatus, 50);
      const player = await axios.get('/api/player/' + this.privateID + '/' + this.profileUser.id)
      this.socket.emit('privateGame', this.privateID, this.profileUser.id, player.data)
      window.addEventListener('keydown', this.KeyDownEvt);
      window.addEventListener('keyup', this.KeyUpEvt);
      this.socket.on('newBall', (data: any) => {
        this.ball.x = data.x,
        this.ball.y = data.y,
        this.ball.size = data.size
      })
      this.socket.on('forceEndGame', () => {
        console.log('forceEndGame');
        this.endGame = true;
        this.game = false;
        this.socket.emit('endGame');
      })
      // window.addEventListener('keyup', this.KeyUpEvt);
      this.socket.on('initGame', () => {     
        this.waiting = false;
        this.game = true;
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
        // console.log('posupdate', data);
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
        // console.log('ball pos ', data);
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
      async gameStatus() {
        // console.log('privateid = ',this.privateID)
        const gameInfo = await axios.get('/api/games/' + this.privateID)
        const status = gameInfo.data.status;
        if (status == 2)
        {
          this.refused = true
          clearInterval(this.interval);
        }
      },
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
      victoryBtn() {
        this.victory = false;
        this.$router.push('/chat')
      },
      defeatBtn() {
        this.defeat = false;
        this.$router.push('/chat' )
      },
      endGameBtn() {
        this.endGame = false;
        this.$router.push('/chat')
      },
      refusedBtn() {
        this.refused = false
        this.$router.push('/chat')
      }
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