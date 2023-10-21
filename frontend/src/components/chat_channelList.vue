<template>
    <v-container>
      <v-card id="channelListCard"
      class="mx-auto"  width="30vw">
      
      <div id="titleChannelBox">
        <h2>Liste des channels</h2>
      </div>

    <v-virtual-scroll
    :items="(channelList as Channel[])"
    height="40vh"
    item-height="8vh"
    id="listChan">
    <template v-slot:default="{ item }">
      
<!-- CARTE DE DESCRIPTION D'UN CHANNEL -->
<div id="channelDescriptionBar"
    v-if="item.id !== -1 &&
    !(item.isDirect && !isUserInChannel(profileUser.id, item)) &&
    !(item.mode==='private' && !isUserInChannel(profileUser.id, item))"
    @click="selectChannel(item)"
    >
    <div class="d-flex justify-center">
      <div class="infoChan">
        <div> {{ getChannelName(item, profileUser) }}</div> 
         <v-chip> {{ item.mode }}</v-chip>
      </div>
          <v-card-actions  v-if="!isUserInChannel(profileUser.id, item) && !isBan(profileUser.id, item)">
            <v-form @submit.prevent="joinChannel(item)">
              <h1>TEST</h1>
            <div>
              <v-text-field v-if="item.mode=='protected'"
                v-model="password"
                name="joinPassword"
                label="Password">
              </v-text-field>
              <v-btn type="submit">+</v-btn>
            </div>
          </v-form>
        </v-card-actions>
        <v-card-text v-if="isBan(profileUser.id, item)">You  are ban from this channel</v-card-text>
    </div>
  </div>
  <v-divider></v-divider>
</template>
</v-virtual-scroll>
<div id="privateMessage">
  <v-btn @click="openDirectMessageDialog">Envoyer un message privé</v-btn>
</div>
</v-card>
    </v-container>
  <!-- Boîte de dialogue pour le message direct -->
  <v-dialog v-model="directMessageDialog" max-width="400">
    <v-card>
      <v-card-title>Envoyer un message privé</v-card-title>
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
          // console.log("fe_user: ", user)
          // console.log("CURRENT: ", localStorage.getItem('currentUser'))
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
                // console.log('methods: selectChannel', channel)
                if (isUserInChannel(this.profileUser.id, channel)) {
                  this.$emit('channel-selected', channel);
                }
            },

            async joinChannel(channel: Channel) {
              // console.log('methods: joinChannel');
              try {
                const reponse = await axios.post('/api/chat/joinChannelRequest', {
                  channelID: channel.id,
                  password: channel.mode === 'protected' ? this.password : '',
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                // console.log(reponse.data);
                this.password = ''
              }
              catch { console.error(); }
            },

            async sendDirectMessage() {
              try {
                // console.log('method: send direct message')
                const reponse = await axios.post('/api/chat/directMessageRequest', {
                  target: this.directMessageTarget,
                  text: this.directMessageContent,
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                // console.log(reponse.data);
                this.closeDirectMessageDialog()
                // console.log(reponse.data);
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

<style scoped>

#titleChannelBox 
{
  display: flex;
  height: 5vh;
  justify-content: center;;
  padding: 1vh 1vw 5vh 1vw;
}

#titleChannelBox h2 {
  color: black;
}

#listChan {
  overflow: hidden;
}

#privateMessage {
  display: flex;
  justify-content: center;
  padding-bottom: 2vh;
}

.infoChan {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5vh 2vw;
}

.infoChan span {
  height: 100%;
}

#channelDescriptionBar {
  margin: 1vh 0;
}
</style>