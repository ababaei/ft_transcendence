<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';
import axios from 'axios';

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
    messages: Message[];
    channels: Channel[];
    games: Game[];
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
  Players: User[];
}

export default defineComponent({
    data() {
      return {
        // games: this.getUser(),
        gameData: [] as Game[]
        // jwtToken: null,
      };
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
      // async getUserGame() {
      //   const games = await this.getUser();
      //   console.log(games);
      //   // return (games);
      // }     
    },
    created() {
      const user: any = localStorage.getItem('currentUser');
      // this.getUser()
      // console.log("fe_user: ", user)
      // console.log("CURRENT: ", localStorage.getItem('currentUser'))
    },
    mounted() {
      if (this.profileUser)
      {
        const avatar = this.profileUser.avatar;
        // console.log('avatar :', avatar);
        // const profilePic = document.getElementsByTagName('img')[1];
        const profilePic = document.getElementsByTagName('img')[0];
        if (profilePic)
        {
          // console.log('profilePic')
          profilePic.src = avatar;
        }
      }
      this.getUser()
    },
    methods: {
      async getUser() {
        if (this.profileUser)
        {
          axios.get('/api/users/' + this.profileUser.id,
          { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
          .then((res) => {
            for (let i = 0; i < res.data.games.length; i++)
            {
              axios.get('/api/games/' + res.data.games[i].id)
              .then((res) => {
                console.log(res.data)
                this.gameData.push(res.data);
              })
            }
          })
        }
      },
      logOut() {
        localStorage.setItem('isAuthenticated', 'false')
        localStorage.removeItem('currentUser')
        this.$cookies.remove('userData')
        router.push('/login')
      },
      activate2fa() {
        
      },
      async getGames(id: string) {
        const ponGame = await axios.get('/api/games/' + id);
        console.log(ponGame);
      },
      async showGame(id : string) {
        const game = await axios.get('/api/games/' + id);
        console.log(game.data.Players);
        return (game.data.id)
      }
    }
  })
</script>

<template>
  <main>
    <div class="box rounded-lg" id="leftProfil">
      <!-- <h1>Page Profil</h1> -->
      <img src="" alt="" id="avatar" class="rounded-circle">
      <h1>{{ profileUser.name }}</h1>
      <!-- <v-btn class="mt-5" @click="getUser">USER</v-btn> -->
      <v-btn class="mt-5" @click="getUser">Modifier photo</v-btn>
      <v-btn class="mt-5" @click="getUser">Modifier pseudo</v-btn>
      <v-btn class="mt-5" @click="activate2fa">Enable 2FA</v-btn>
      <v-btn class="mt-5" @click="logOut">Log out</v-btn>
    </div>
    <div class="box rounded-lg" id="rightProfil">
      <h1>Historique</h1>
      <!-- <h2>{{ games }}</h2> -->
      <div v-for="(game, index) in gameData" :key="index" class="gameScore">
        <div class="player">
          <img :src="game.Players[0].avatar" class="rounded-circle">
          <span>{{ game.Players[0].name }}</span>
        </div>
        <span> score </span>
        <h2> - </h2>
        <span> score </span>
        <div class="player">
          <img :src="game.Players[1].avatar" class="rounded-circle">
          <span>{{ game.Players[1].name }}</span>
        </div>
      </div>
    </div>
  </main>
</template>

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

@media screen and (max-width: 1000px) {
  #avatar {
    width: 20%;
  }
}
</style>