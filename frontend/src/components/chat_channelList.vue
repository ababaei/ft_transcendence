<template>
    <v-container>
      <v-card id="channelListCard"
      class="mx-auto" max-width="500">
      <v-card-title> Channel list </v-card-title>

    <v-divider></v-divider>
    <v-virtual-scroll
    :items="(channelList as Channel[])"
    height="320"
    item-height="48">
    <template v-slot:default="{ item }">

<!-- CARTE DE DESCRIPTION D'UN CHANNEL -->
    <v-card id="channelDescriptionBar"
    v-if="item.id !== -1"
    @click="selectChannel(item)"
    class="mb-3">
    <v-row>
        <v-col> <v-card-text>{{ item.name }}</v-card-text> </v-col>
        <v-col> <v-chip> {{ item.mode }} </v-chip> </v-col>
        <v-col>
        <v-card-actions  v-if="!isUserInChannel(logedUser.id, item)">
          <v-form @submit-prevent="joinChannel(logedUser.id, item)" method="POST">
            <v-btn type="submit">Join Channel</v-btn>
          </v-form>
        </v-card-actions>
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
import { isUserInChannel } from './chat_utilsMethods';
import type { Channel, friendRelation, User, Message } from './chat_utilsMethods';

    export default defineComponent ({
        name: "chat_channelList",
        components : {
        },
        props: {
            channelList: {
                type: Array,
                default: () => []
            },
            logedUser: {
            type: Object as () => User,
            default: () => ({ id:0, name: ''}),
          }
        },
        methods: {
            selectChannel(channel: Channel) {
                console.log('methods: selectChannel', channel)
                if (isUserInChannel(this.logedUser.id, channel)) {
                  this.$emit('channel-selected', channel);
                }
            },

            async joinChannel(userID: number, channel: Channel) {
              console.log('methods: joinChannel');
              try {
                const reponse = await axios.post('/api/chat/joinChannelRequest', {
                  channelID: channel.id,
                  userID: userID,
                  password: ""
                });
                console.log(reponse.data);
              }
              catch { console.error(); }
            },

            // imports 
            isUserInChannel(userID: number, channel: Channel) { return isUserInChannel(userID, channel); },
        }
    })
</script>
