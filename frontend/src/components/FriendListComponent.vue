<template>  
      <div id="friendsListCard">
      <v-tabs v-model="this.tab">
        <v-tab value="one">Amis</v-tab>
        <v-tab value="two">Utilisateurs bloqués</v-tab>
      </v-tabs>
        
        <v-divider></v-divider>

        <v-window v-model="this.tab">
          <v-window-item value="one">
            <v-divider></v-divider>

                <v-text-field
                  v-model="friendName"
                  density="compact"
                  label="Ajouter un ami"
                  append-inner-icon="mdi-account-plus-outline"
                  single-line
                  hide-details
                  @click:append-inner="addFriend"
                ></v-text-field>

        <v-list>
          <div
            v-for="friend in this.friendList"
            :key="friend.id" class="friendInfos">
            <div class="names"
            @click="profilePopup = true; userSelected = friend">
            <v-avatar>
              <v-img :src="friend.avatar" alt="Avatar" />
            </v-avatar>
            <v-list-item-title>{{ friend.name }}</v-list-item-title>
          </div>

            <!-- actions on friends -->
            <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <div>
                <!-- Send message -->
                <v-list-item @click="this.sendDirectMessage(friend.id)">
                  Envoyer un message
                </v-list-item>
                <!-- Challenge user -->
                <v-list-item @click="challengeUser(friend.id)">
                  Le défier au pong
                </v-list-item>
                <!-- Remove friend -->
                <v-list-item @click="removeFriend(friend.id)">
                  Supprimer de la liste d'amis
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
        </div>
      </v-list>
      </v-window-item>



        <v-window-item value="two">
          <v-card>
            <v-divider></v-divider>
            <v-text-field
                  v-model="blockedName"
                  density="compact"
                  label="Bloquer un utilisateur"
                  append-inner-icon="mdi-account-cancel"
                  single-line
                  hide-details
                  @click:append-inner="blockUser"
            ></v-text-field>

        </v-card>

        <v-list>
          <div
            v-for="blocked in this.blockedList"
            :key="blocked.id" class="friendInfos">
            <div class="names"
            @click="profilePopup = true; userSelected = blocked"><v-avatar>
              <v-img :src="blocked.avatar" alt="Avatar" />
            </v-avatar>
            <v-list-item-title>{{ blocked.name }}</v-list-item-title>
            </div>
            <!-- actions on friends -->
            <v-menu id="actionFriend">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <div>
                <!-- Block user -->   
                <v-list-item @click="unblockUser(blocked.id)">
                  Débloquer
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
            </div>
        </v-list>
        </v-window-item>
      </v-window>
    </div>


    <v-dialog v-model="profilePopup" max-width="400">
      <UserProfilePopUp
      :userRequested="this.userSelected"
      :friendList="this.friendList"
      :blockedList="this.blockedList"/>
    </v-dialog>
  </template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import UserProfilePopUp from './UserProfilePopUp.vue';
import { isUserInChannel, isBan } from './chat_utilsMethods';
import type { Channel, User, Message } from './chat_utilsMethods';
import { faGrinTongueSquint, faMedal } from '@fortawesome/free-solid-svg-icons';

    export default defineComponent ({
        name: "friendListComponent",
        components: {
          UserProfilePopUp,
        },
        data() {
          return {
            tab: null,
            password: '',
            friendName: '',
            blockedName: '',
            profilePopup: false,
            userSelected: 0,
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
          }      
        },
        created() {
          const user: any = localStorage.getItem('currentUser');
        },
        props: {
          friendList: {
              type: Array,
              default: () => []
          },
          blockedList: {
            type: Array,
            default: () => []
          },
          channelList: {
            type: Array,
            default: () => []
          }
        },
        methods: {
          async addFriend() {
              try {
                  const reponse = await axios.post('/api/chat/addFriendRequest', {
                  friendName: this.friendName
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
              this.friendName = '';
            } catch { console.error(); }
          },
          async blockUser() {
              // console.log('method: blockUser')
              try {
                  const reponse = await axios.post('/api/chat/blockUserRequest', {
                  blockedName: this.blockedName,
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
              this.blockedName = '';
            } catch { console.error(); }
          },
          async removeFriend(userID: number) {
              // console.log('method: removeFriend')
              try {
                // console.log(userID);
                  const reponse = await axios.post('/api/chat/removeFriendRequest', {
                  removedFriendId: userID,
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
            } catch { console.error(); }
          },
          async unblockUser(userID: number) {
              // console.log('method: unblockUser')
              try {
                // console.log(userID);
                  const reponse = await axios.post('/api/chat/unblockUserRequest', {
                  unblockedId: userID,
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
            } catch { console.error(); }
          },

          async challengeUser(userID: number) {
              try {
                const game = await axios.post('/api/games');
                const reponse = await axios.post('/api/chat/challengeRequest', {
                challengedId: userID,
                gameID: game.data.id
            }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
                  // console.log(game.data)
                  // const playerLEft = await axios.post('/api/player')
                  const leftPlayer = await axios.post('/api/player', {
                    gameID: game.data.id, 
                    userID: parseInt(this.profileUser.id), 
                    side: 'left'})
                  const rightPlayer = await axios.post('/api/player', {
                    gameID: game.data.id, 
                    userID: userID, 
                    side: 'right'})
                  this.$router.push('/private/' + game.data.id);
            } catch { console.error(); }
          }
    },
  })
</script>

<style scoped>

#friendsListCard {
  width: 100%;
  height: 100%;
}

#addFriend {
  display: flex;
  align-items: center;
  height: 8vh;
}

#addFriend button {
  width: 100%;
}

.friendInfos {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 7vh;
  margin-bottom: 1vh;
  border-bottom: 1px solid grey;
}

.names {
  width: 60%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.friendInfos button {
  margin-right: 1vw;
}

</style>



