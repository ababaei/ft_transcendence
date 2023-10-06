<template>
    <v-container>
      <v-card class="mx-auto" max-width="500">
        <v-card-title> Channel list </v-card-title>

    <v-divider></v-divider>
    <v-virtual-scroll
    :items="this.channelList"
    height="320"
    item-height="48">
    <template v-slot:default="{ item }">
    <v-card v-if="item.id !== -1" @click="this.selectChannel(item)"
    class="mb-3">
      <v-row>
        <v-col>
          <v-card-text>{{ item.name }}</v-card-text>
        </v-col>
        <v-col>
          <v-chip class="d-flex align-center p-20" prepend-icon="">{{ item.mode }}</v-chip>
        </v-col>
        <v-col>
          <v-card-actions>
            <v-btn @click="this.joinChannel(this.logedUser.id, item)">
              <v-icon>mdi-account-plus</v-icon>
              Join Channel
            </v-btn>
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

interface friendRelation {
    id: number
    userID: number
    friendID: number
    convID: number
    isBlocked: boolean
  }

  interface User {
    id: number;
    friendsID: friendRelation[];
    name: string;
  }
  interface Message {
    id: number;
    text: string;
    channel: Channel;
    user: User
  }
  interface Channel {
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

    export default defineComponent ({
        name: "chat_channelList",
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
                this.$emit('channel-selected', channel);
            },

            async joinChannel(userID: number, channel: Channel) {
              console.log('methods: joinChannel');
              console.log("to send ",channel.id, this.logedUser.id)
              try {
                console.log("to send ",channel.id, this.logedUser.id)
                const reponse = await axios.post('/api/chat/joinChannelRequest', {
                  channelID: channel.id,
                  userID: this.logedUser.id,
                  password: ""
                })
                console.log(reponse.data);
              }
              catch { console.error(); }
    },
        }
    })
</script>
