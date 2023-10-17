<template>
    <v-container>
      <v-card id="channelListCard"
      class="mx-auto" max-width="500">
      <v-card-title> Channel list </v-card-title>

    <v-divider></v-divider>
    <v-virtual-scroll
    :items="(this.channelList as Channel[])"
    height="320"
    item-height="48">
    <template v-slot:default="{ item }">

<!-- CARTE DE DESCRIPTION D'UN CHANNEL -->
    <v-card id="channelDescriptionBar"
    v-if="item.id !== -1 && !(item.isDirect && !this.isUserInChannel(this.profileUser.id, item))"
    @click="this.selectChannel(item)"
    >
    <v-row flex-wrap class="d-flex justify-center">
        <v-col class="3"> <v-card-text> {{ this.getChannelName(item, this.profileUser) }}</v-card-text> </v-col>
        <v-col class="3"> <v-chip> {{ item.mode }} </v-chip> </v-col>
        <v-col class="3">
        <v-card-actions  v-if="!this.isUserInChannel(this.profileUser.id, item) && !this.isBan(this.profileUser.id, item)">
          <v-form @submit.prevent="this.joinChannel(item)">
            <v-row flex-wrap>
            <v-col><v-text-field v-if="item.mode=='protected'"
            v-model="this.password"
            name="joinPassword"
            label="Password">
            </v-text-field></v-col>
            <v-col cols="2"><v-btn type="submit">+</v-btn></v-col>
          </v-row>
          </v-form>
        </v-card-actions>
        <v-card-text v-if="this.isBan(this.profileUser.id, item)">You  are ban from this channel</v-card-text>
        </v-col>
    </v-row>
    </v-card>

    </template>
    </v-virtual-scroll>
    </v-card>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { isUserInChannel, isBan, getChannelName } from './chat_utilsMethods';
import type { Channel, User, Message } from './chat_utilsMethods';

    export default defineComponent ({
        name: "chat_channelList",
        components : {
        },
        data() {
          return {
            password: '',
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
          channelList: {
              type: Array,
              default: () => []
          },
        },
        methods: {
            selectChannel(channel: Channel) {
                console.log('methods: selectChannel', channel)
                if (isUserInChannel(this.profileUser.id, channel)) {
                  this.$emit('channel-selected', channel);
                }
            },

            async joinChannel(channel: Channel) {
              console.log('methods: joinChannel');
              try {
                const reponse = await axios.post('/api/chat/joinChannelRequest', {
                  channelID: channel.id,
                  password: channel.mode === 'protected' ? this.password : '',
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                console.log(reponse.data);
              }
              catch { console.error(); }
            },

            // imports 
            isUserInChannel(userID: number, channel: Channel) { return isUserInChannel(userID, channel); },
            isBan(userID: number, channel: Channel): boolean { return isBan(userID, channel); },
            getChannelName(channel: Channel, self: User): string { return getChannelName(channel, self); }
        }
    })
</script>
