<template>
    <v-container>
      <v-card id="channelListCard"
      class="mx-auto" max-width="500">
      <v-col>
          <v-card-title>Channel list</v-card-title>
        </v-col>
        <v-col>
          <v-btn @click="this.openDirectMessageDialog" color="primary">Direct Message</v-btn>
        </v-col>

    <v-divider></v-divider>
    <v-virtual-scroll
    :items="(this.channelList as Channel[])"
    height="320"
    item-height="48">
    <template v-slot:default="{ item }">

<!-- CARTE DE DESCRIPTION D'UN CHANNEL -->
    <v-card id="channelDescriptionBar"
    v-if="item.id !== -1 &&
    !(item.isDirect && !this.isUserInChannel(this.profileUser.id, item)) &&
    !(item.mode==='private' && !this.isUserInChannel(this.profileUser.id, item))"
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
  <!-- Boîte de dialogue pour le message direct -->
  <v-dialog v-model="directMessageDialog" max-width="400">
    <v-card>
      <v-card-title>Direct Message</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="this.sendDirectMessage">
          <v-text-field v-model="directMessageTarget" label="user"></v-text-field>
          <v-text-field v-model="directMessageContent" label="Message" multi-line></v-text-field>
          <v-btn type="submit">Send</v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeDirectMessageDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { isUserInChannel, isBan, getChannelName } from './chat_utilsMethods';
import type { Channel, User, Message } from './chat_utilsMethods';
import { channel } from 'diagnostics_channel';

    export default defineComponent ({
        name: "chat_channelList",
        components : {
        },
        data() {
          return {
            password: '',
            directMessageDialog: false,
            directMessageTarget: "",
            directMessageContent: "",
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
        emits: ['channel-selected'],
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
                this.password = ''
              }
              catch { console.error(); }
            },

            async sendDirectMessage() {
              try {
                console.log('method: send direct message')
                const reponse = await axios.post('/api/chat/directMessageRequest', {
                  target: this.directMessageTarget,
                  text: this.directMessageContent,
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                console.log(reponse.data);
                this.closeDirectMessageDialog()
                console.log(reponse.data);
              }
              catch { console.error(); }
            },
            openDirectMessageDialog() {
              this.directMessageDialog = true;
            },
            closeDirectMessageDialog() {
              this.directMessageDialog = false;
              this.directMessageContent = '';
              this.directMessageTarget = '';
            },

            // imports 
            isUserInChannel(userID: number, channel: Channel) { return isUserInChannel(userID, channel); },
            isBan(userID: number, channel: Channel): boolean { return isBan(userID, channel); },
            getChannelName(channel: Channel, self: User): string { return getChannelName(channel, self); }
        }
    })
</script>
