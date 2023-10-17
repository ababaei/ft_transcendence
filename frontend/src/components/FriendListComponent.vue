<template>
    <v-container>
      <v-card id="friendsListCard" class="mx-auto" max-width="500">
      <v-tabs v-model="this.tab">
        <v-tab value="one">Friends</v-tab>
        <v-tab value="two">Blocked</v-tab>
      </v-tabs>
        
        <v-divider></v-divider>
        <v-window v-model="this.tab">
          <v-window-item value="one">
        <v-card>
            <v-divider></v-divider>
            <v-form @submit.prevent="addFriend" class="w-100">
                <v-row class="w-90 align-center">
                <v-col cols="7">
                <v-text-field v-model="friendName" label="Friend's Name"></v-text-field>
                </v-col>
                <v-col cols="2">
                <v-btn type="submit" color="primary">+</v-btn>
                </v-col>
                </v-row>
            </v-form>
        </v-card>

        <v-list>
          <v-card
            v-for="friend in this.friendList"
            :key="friend.id">
            <v-row class="d-flex justify-center">
            <v-col><v-avatar size="40px">
              <v-img :src="friend.avatar" alt="Avatar" />
            </v-avatar></v-col>
            <v-col><v-list-item-title>{{ friend.name }}</v-list-item-title></v-col>

            <!-- actions on friends -->
            <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <div>
                <!-- Send message -->
                <v-list-item @click="this.sendDirectMessage(friend.id)">
                  Send Message
                </v-list-item>
                <!-- Block user -->   
                <v-list-item @click="">
                  Block User
                </v-list-item>
                <!-- Challenge user -->
                <v-list-item @click="">
                  Challenge User
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
        </v-row>
            </v-card>
        </v-list>
      </v-window-item>
        <v-window-item value="two">
          <v-card>
            <v-divider></v-divider>
            <v-form @submit.prevent="blockUser" class="w-100">
                <v-row class="w-90 align-center">
                <v-col cols="7">
                <v-text-field v-model="blockedName" label="Block user"></v-text-field>
                </v-col>
                <v-col cols="2">
                <v-btn type="submit" color="primary">+</v-btn>
                </v-col>
                </v-row>
            </v-form>
        </v-card>

        <v-list>
          <v-card
            v-for="blocked in this.blockedList"
            :key="blocked.id">
            <v-row class="d-flex justify-center">
            <v-col><v-avatar size="40px">
              <v-img :src="blocked.avatar" alt="Avatar" />
            </v-avatar></v-col>
            <v-col><v-list-item-title>{{ blocked.name }}</v-list-item-title></v-col>

            <!-- actions on friends -->
            <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <div>
                <!-- Block user -->   
                <v-list-item @click="">
                  Unblock User
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
        </v-row>
            </v-card>
        </v-list>
        </v-window-item>
      </v-window>
      </v-card>
    </v-container>
  </template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { isUserInChannel, isBan } from './chat_utilsMethods';
import type { Channel, User, Message } from './chat_utilsMethods';

    export default defineComponent ({
        name: "friendListComponent",
        components: {
        },
        data() {
          return {
            tab: null,
            password: '',
            friendName: '',
            blockedName: '',
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
          console.log("fe_user: ", user)
          console.log("CURRENT: ", localStorage.getItem('currentUser'))
        },
        props: {
          friendList: {
              type: Array,
              default: () => []
          },
          blockedList: {
            type: Array,
            default: () => []
          }
        },
        methods: {
          async addFriend() {
              console.log('method: add friend')
              try {
                  const reponse = await axios.post('/api/chat/addFriendRequest', {
                  friendName: this.friendName
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              console.log(reponse);
              this.friendName = '';
            } catch { console.error(); }
          },
          async blockUser() {
              console.log('method: blockUser')
              try {
                  const reponse = await axios.post('/api/chat/blockUserRequest', {
                  blockedName: this.blockedName
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              console.log(reponse);
              this.blockedName = '';
            } catch { console.error(); }
          },
          sendDirectMessage(userid: number) {
            this.$emit('send-direct', userid);
          }
    },
  })
</script>



