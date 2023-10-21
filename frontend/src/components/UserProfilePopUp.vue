<template>
    <v-card max-width="400" max-height="400" >

    <v-col><v-avatar size="200px">
            <v-img :src="userRequested.avatar" alt="Avatar" />
    </v-avatar></v-col>

      <v-card-title>{{ this.userRequested.name }}</v-card-title>

      <v-card-actions v-if="this.userRequested.id != this.profileUser.id">
        <v-btn v-if="!this.isFriend(this.userRequested.id, friendList)" @click="addFriend">Add friend</v-btn>
        <v-btn v-if="this.isFriend(this.userRequested.id, friendList)" @click="removeFriend">Remove friend</v-btn>
        <v-btn v-if="!this.isBlocked(this.userRequested.id, blockedList)" @click="blockUser">Block user</v-btn>
        <v-btn v-if="this.isBlocked(this.userRequested.id, blockedList)" @click="unblockUser">Unblock user</v-btn>
      </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { isUserInChannel, isBan, getChannelName, isBlocked, isFriend } from './chat_utilsMethods';
import type { Channel, User, Message } from './chat_utilsMethods';
import { channel } from 'diagnostics_channel';

    export default defineComponent ({
        name: "userProfilePopup",
        components : {
        },
        data() {
          return {
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
        props: {
          userRequested: {
                type: Object as () => User,
                default: () => ({ id: 0, name: 0}),
            },
            friendList: {
                type: Array,
                default: () => [],
            },
            blockedList: {
                type: Array,
                default: () => [],
            },
        },
        methods: {
            async addFriend() {
              // console.log('method: add friend')
              try {
                  const reponse = await axios.post('/api/chat/addFriendRequest', {
                  friendName: this.userRequested.name,
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
              this.friendName = '';
            } catch { console.error(); }
          },
          async blockUser() {
              // console.log('method: blockUser')
              try {
                  const reponse = await axios.post('/api/chat/blockUserRequest', {
                  blockedName: this.userRequested.name,
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
                  removedFriendId: this.userRequested.id,
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
            } catch { console.error(); }
          },
          async unblockUser(userID: number) {
              // console.log('method: unblockUser')
              try {
                // console.log(userID);
                  const reponse = await axios.post('/api/chat/unblockUserRequest', {
                  unblockedId: this.userRequested.id,
              }, { headers: { "Authorization": `Bearer ${this.jwt_token}` }})
              // console.log(reponse);
            } catch { console.error(); }
          },
            isBlocked(userID: number, blockedList: User[]): boolean { return isBlocked(userID, blockedList); },
            isFriend(userID: number, friendList: User[]): boolean { return isFriend(userID, friendList) },
        },
    })
</script>
