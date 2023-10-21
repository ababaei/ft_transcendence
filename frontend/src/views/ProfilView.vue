<template>
  <main>

    <div class="box rounded-lg" id="leftProfil">
      <img :src="avatar" alt="" id="avatar" class="rounded-circle">
      <h1>{{ name }}</h1>
      <v-btn class="mt-3" @click="toggleAvatar = !toggleAvatar">Modifier photo</v-btn>
      <v-btn class="mt-3" @click="togglePseudo = !togglePseudo">Modifier pseudo</v-btn>
      <twoFaForm />
      <v-btn class="mt-3" @click="logOut">Se déconnecter</v-btn>
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
        <v-btn class="mt-3" @click="showHistoryBtn">Voir tout l'historique</v-btn>
    </div>
    <div v-else class="box rounded-lg" id="rightProfil">
      <div id="viensJouer">
        <span> Vous n'avez encore jamais joué ! <br> </span>
        <span> Faites une première partie de ginpgonp pour afficher votre historique</span>
        <v-btn @click="Jouer">Jouer</v-btn>
      </div>
    </div>


    <v-dialog
          v-model="togglePseudo"
          :scrim="false"
          width="20vw"
        >
          <v-card
            color="white"
          >
            <v-card-text>
      <v-text-field
      v-if="togglePseudo"
        name="togglePseudo"
        label="Nouveau pseudo"
        id="togglePseudo"
        single-line
        density="compact"
        append-inner-icon="mdi-pencil"
        v-model="newPseudo"
        @click:append-inner="changePseudo(newPseudo)"
      ></v-text-field>
    </v-card-text>
          </v-card>
        </v-dialog>


      <v-dialog
        v-model="toggleAvatar"
        :scrim="false"
        width="20vw"
      >
        <v-card
          color="white"
        >
          <v-card-text>
      <v-text-field
        name="togglePhoto"
        label="photo URL"
        id="togglePhoto"
        single-line
        density="compact"
        append-inner-icon="mdi-pencil"
        v-model="newAvatar"
        @click:append-inner="changePhoto(newAvatar)"
      ></v-text-field>
  </v-card-text>
        </v-card>
      </v-dialog>

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

    <v-dialog
      v-model="newUser"
      width="auto"
      persistent
    >
    <v-form @submit.prevent="updateProfil">      
      <v-card>
        <v-card-title primary-title>
          <span class="text-h5">Premiere Connexion</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            name="photo"
            label="photo URL"
            id="photo"
            v-model="newAvatar"
          >
          </v-text-field>
          <v-text-field
            name="pseudo "
            label="pseudo*"
            id="pseudo"
            v-model="newPseudo"
            required
          ></v-text-field>
          Tu peux laisser les informations par defaut et changer plus tard.
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" type="submit">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
    </v-dialog>

    <v-dialog
      v-model="pseudoRequired"
      width="auto"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-text>
          Le pseudo est obligatoire pour la premiere connexion, merci !
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="pseudoRequired = !pseudoRequired">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="pseudoTaken"
      width="auto"
      transition="dialog-transition"
    >
      <v-card>
        <v-card-text>
          Ce pseudo est deja pris ! 😱
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="pseudoTaken = !pseudoTaken">Ok</v-btn>
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
        newUser:false as boolean,
        newAvatar: '' as string,
        newPseudo: '' as string,
        togglePseudo: false as boolean,
        toggleAvatar: false as boolean,
        name: '',
        avatar: '',
        pseudoRequired: false,
        pseudoTaken: false
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
        if (this.profileUser.newUser)
          this.newUser = true;
        this.name = this.profileUser.name;
        this.twoFaActivated = this.profileUser.twoFaActivated;
        this.avatar = this.profileUser.avatar;
        const profilePic = document.getElementsByTagName('img')[0];
        if (profilePic)
          profilePic.src = this.avatar;
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
      async updateProfil() {
        if (this.newPseudo == '') {
          this.pseudoRequired = true
          return;
        }
        await this.changePhoto(this.newAvatar)
        .catch(() => {
          return;
        })
        await this.changePseudo(this.newPseudo)
        .catch(() => {
          return;
        })
        await axios.get('/api/users/' + this.profileUser.id + '/update',
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        .then(() => {
          const user = this.profileUser;
          user.newUser = false
          this.newUser = false;
          localStorage.setItem('currentUser', JSON.stringify(user))
        })
        .catch((e) => {
          console.error(e);
        })
      },
      async changePhoto(avatar: string){
        if (avatar == '')
         return;
        await axios.put('/api/users/' + this.profileUser.id + '/update-photo', { avatar },
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        .then(() => {
          const user = this.profileUser;
          user.avatar = avatar
          this.avatar = avatar
          localStorage.setItem('currentUser', JSON.stringify(user))
          this.toggleAvatar = false
        })
      },
      async changePseudo(pseudo: string){
        if (pseudo == '')
         return;
        await axios.put('/api/users/' + this.profileUser.id + '/update-pseudo', { pseudo },
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        .then(() => {
          const user = this.profileUser;
          user.name = pseudo;
          this.name = pseudo;
          localStorage.setItem('currentUser', JSON.stringify(user))
          this.togglePseudo = false;
        })
        .catch(() => {
          this.pseudoTaken = true;
        })
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
 width: 10vh;
}

#leftProfil {
  width: 30%;
  padding: 2% 0;
}

#rightProfil {
  padding: 2% 0;
}

#leftProfil img {
  width: 15vh;
  height: 15vh;
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