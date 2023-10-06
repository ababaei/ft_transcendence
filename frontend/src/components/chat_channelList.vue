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
    <v-card v-if="item.id !== -1"
    class="mb-3">
      <v-row>
        <v-col>
          <v-card-text>{{ item.name }}</v-card-text>
        </v-col>
        <v-col>
          <v-chip class="" prepend-icon="">{{ item.mode }}</v-chip>
        </v-col>
        <v-col>
          <v-card-actions>
            <v-btn @click="this.selectChannel(item)">
              <v-icon>mdi-account-plus</v-icon>
              Join Channel
            </v-btn>
          </v-card-actions>
        </v-col>
      </v-row>              
    </v-card>
  </template>
</v-virtual-scroll>




      <!-- <v-row>
        <v-col v-for="channel in this.channelList" :key="channel.id" cols="12">
            <v-card v-if="channel.id != -1"
            color="teal-lighten-1">
            <v-row>
              <v-col>
                <v-card-text> {{ channel.name }} </v-card-text>
              </v-col>
              <v-col>
                <v-chip class="d-flex align-center" prepend-icon=""> {{ channel.mode }} </v-chip>
              </v-col>
              <v-col>
              <v-card-actions>
                <v-btn @click="this.selectChannel(channel)">
                  <v-icon>mdi-account-plus</v-icon>
                  Join Channel
                </v-btn>
              </v-card-actions>
              </v-col>
            </v-row>              
            </v-card>
        </v-col>
      </v-row> -->
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
        },
        methods: {
            selectChannel(channel: Channel) {
                console.log('button clicked', channel)
                this.$emit('channel-selected', channel);
            }
        }
    })
</script>
