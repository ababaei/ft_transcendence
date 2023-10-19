<template>
  <main>

    <div class="box rounded-lg" id="leftProfil">
      <img src="" alt="" id="avatar" class="rounded-circle">
      <h1>{{ profileUser.name }}</h1>
      <v-btn class="mt-5" @click="changePhoto">Modifier photo</v-btn>
      <v-btn class="mt-5" @click="changePseudo">Modifier pseudo</v-btn>
      <v-btn v-if="FActivated" class="mt-5" @click="update2fa(false)">Désactiver 2FA</v-btn>
      <v-btn v-else class="mt-5" @click="update2fa(true)">Activer 2FA</v-btn>
      <two-fa-form />
      <v-btn class="mt-5" @click="logOut">Se déconnecter</v-btn>
    </div>

    <div v-if="history" class="box rounded-lg" id="rightProfil">
        <h1>Historique des parties</h1>
        <h4>Parties jouées : {{ gameData.length }} | Parties Gagnées : {{ gameData.filter(el => el.idWinner == profileUser.id).length }} </h4>
        <div v-for="(game, index) in gameData.slice(-3)" :key="index" class="gameScore">
          <div class="player">
            <img :src="getAvatar(game.Players[0].userID)" class="rounded-circle">
            <span>{{ getName(game.Players[0].userID) }}</span>
          </div>
          <span> {{ game.Players[0].score }} </span>
          <h2> - </h2>
          <span> {{ game.Players[1].score }} </span>
          <div class="player">
            <img :src="getAvatar(game.Players[1].userID)" class="rounded-circle">
            <span>{{ getName(game.Players[1].userID) }}</span>
          </div>
        </div>
        <v-btn class="mt-5" @click="showHistoryBtn">Voir tout l'historique</v-btn>
    </div>
    <div v-else class="box rounded-lg" id="rightProfil">
      <div id="viensJouer">
        <span> Vous n'avez encore jamais joué ! <br> </span>
        <span> Faites une première partie de ginpgonp pour afficher votre historique</span>
        <v-btn @click="Jouer">Jouer</v-btn>
      </div>
    </div>

    <v-dialog
      v-model="showHistory"
      scrollable
      width="30vw"
    >
      <v-card id="dialogHistory">
        <v-card-text style="height: 55vh;">
           <div v-for="(game, index) in gameData" :key="index" class="gameScoreDialog" style="margin-bottom: 1vh;">
            <div class="player">
              <img :src="getAvatar(game.Players[0].userID)" class="rounded-circle">
              <span>{{ getName(game.Players[0].userID) }}</span>
            </div>
            <span> {{ game.Players[0].score }} </span>
            <h2> - </h2>
            <span> {{ game.Players[1].score }} </span>
            <div class="player">
              <img :src="getAvatar(game.Players[1].userID)" class="rounded-circle">
              <span>{{ getName(game.Players[1].userID) }}</span>
            </div>
           </div>
        </v-card-text>
          <v-card-actions style="justify-content: center;">
            <v-btn
            color="blue-darken-1"
            variant="text"
            @click="showHistory = false"
            >
            Fermer l'historique
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </main>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';
import axios from 'axios';
import { faL } from '@fortawesome/free-solid-svg-icons';
import twoFaForm from '@/components/TwoFaForm.vue'

export interface friendRelation {
    id: number
    userID: number
    friendID: number
    convID: number
    isBlocked: boolean
}

export interface User {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    friendsID: friendRelation[];
    name: string;
    email: string;
    avatar: string;
    messages: Message[];
    channels: Channel[];
    games: Game[];
    player:Player[];
}

export interface Message {
    id: number;
    text: string;
    channel: Channel;
    user: User
}
export interface Channel {
    id: number;
    name: string;
    messages: Message[],
    mode: string,
    password: string,
    ownerID: number,
    adminID: number[],
    muteID: number[],
    banID: number[],
    users: User[],
    isDirect: boolean
}

export interface Game {
  id: number;
  active: boolean;
  Players: Player[];
  idWinner: number;
  scoreLeft: number;
  scoreRight: number;
}

export interface Player {
  id:number;
  gameID:number;
  userID:number;
  score:number;
  side:string;
}

export default defineComponent({
    data() {
      return {
        gameData: [] as Game[],
        userData: [] as User[],
        history: false,
        showHistory: false,
        FActivated: false,
        qrcodeSrc: '' as string,
        googleAuthCode: '' as string,
        twoFaActivated: false as boolean,
      };
    },
    components: {
      twoFaForm
    },
    computed: {
      profileUser() {
        const user = localStorage.getItem('currentUser')
        if (user)
          return (JSON.parse(user))
        return null
      },
      jwt_token() {
        const userTkn = localStorage.getItem('jwt_token')
        if (userTkn)
          return userTkn
        return null
      },
    },
    async created() {
      const user: any = localStorage.getItem('currentUser');
    },
    async mounted() {
      if (this.profileUser)
      {
        this.twoFaActivated = this.profileUser.twoFaActivated;
        const avatar = this.profileUser.avatar;
        const profilePic = document.getElementsByTagName('img')[0];
        if (profilePic)
        profilePic.src = avatar;
        axios.get('/api/users/' + this.profileUser.id)
        .then((res) => {
          this.FActivated = res.data.twoFaActivated
        })
      } 
      await this.logData()
    },
    methods: {
      async logData() {
        await this.getGames();
        await this.getUsers();
      },
      async getGames() {
        if (this.profileUser)
        {
          axios.get('/api/users/' + this.profileUser.id,
          { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
          .then((res) => {
            for (let i = 0; i < res.data.games.length; i++)
            {
              this.history = true;
              try {
                axios.get('/api/games/' + res.data.games[i].id)
                  .then((res) => {
                  this.gameData.push(res.data);
                })
              } catch (error) {
                console.log(error);
              }
            }
          })
        }
      },
      async getUsers() {
        axios.get('/api/users')
        .then((res) => {
          this.userData = res.data
        })
      },
      getUser() {
        axios.post('/api/2fa/generate',{},
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        .then((res) => {
          this.qrcodeSrc = res.data
          console.log(res.data)})
      },
      getAvatar(userID:number){
        const user = this.userData.find(user => user.id == userID);
        return user?.avatar;
      },
      getName(userID:number){
        const user = this.userData.find(user => user.id == userID);
        return user?.name;
      },
      logOut() {
        localStorage.setItem('isAuthenticated', 'false')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('jwt_token')
        this.$cookies.remove('userData')
        router.push('/login')
      },
      Jouer() {
        this.$router.push('/pong')
      },
      async update2fa(active: boolean) {
        await axios.put('/api/users/' + this.profileUser.id, {active})
        .then(() => {
          this.FActivated = active
        })
      },
      changePhoto(){

      },
      changePseudo(){

      },
      showHistoryBtn() {
        this.showHistory = true;
      },
      async showGame(id : string) {
        const game = await axios.get('/api/games/' + id);
        return (game.data.id)
      }
    }
  })
</script>

<style scoped>
#avatar {
  width: 30%;
}

main {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

.box {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  width: 40%;
  min-height: 70%;
  /* border: 2px solid #6d4db6; */
  background-color: #6d4db60e;
  border-radius: 10%;
  box-shadow:#6d4db6 0 0 20px;
}

.gameScore {
  width: 70% !important;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.gameScoreDialog {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.player {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.player img {
 height: 10vh;
}

#leftProfil {
  width: 30%;
  padding: 5% 0;
}

#rightProfil {
  padding: 2% 0;
}

h1 {
  font-size: 3em;
}

#viensJouer {
  display: flex;
  flex-direction: column;
  height: 20vh;
  justify-content: space-around;
  align-items: center;
}

#viensJouer .v-btn {
  width: fit-content;
}

@media screen and (max-width: 1000px) {
  #avatar {
    width: 20%;
  }
}
</style>