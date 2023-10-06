<template>
      <v-card class="mx-auto" max-width="500">
        <v-card-title> {{ this.channelInChatBox.name }} </v-card-title>
      <v-tabs v-model="tab">
        <v-tab value="one">Messages</v-tab>
        <v-tab value="two">Infos</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-card height="520" item-height="48">


        <v-window v-model="tab">
          <v-window-item value="one">
            <v-virtual-scroll :items="this.channelInChatBox.messages"  height="420" item-height="48" style="overflow-x: hidden;">
            <template v-slot:default="{ item: message }">
                    <v-row>
                        <v-col :class="{ 'text-right': message.user.id === this.logedUser.id }">
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>{{ message.user.name }}</v-list-item-title>
                                    <v-list-item-subtitle style="white-space: pre-wrap;">{{ message.text }}</v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-col>
                    </v-row>
            </template>
            </v-virtual-scroll>
            <v-divider></v-divider>
            <v-form @submit.prevent="sendMessage" method="POST">
              <v-row>
              <v-col cols="4">
                <v-text-field
                    v-model="messageToSend"
                    name="message"
                    label="Message">
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-btn type="submit">send</v-btn>
              </v-col>
            </v-row>
            </v-form>
          </v-window-item>

          <v-window-item value="two">

          <v-virtual-scroll :items="this.channelInChatBox.users"  height="420" item-height="48" style="overflow-x: hidden;">
            <template v-slot:default="{ item: user }">
                    <v-row>
                        <v-col>
                            <v-list-item>
                                <v-list-item-content>
                                    <v-list-item-title>{{ user.name }}</v-list-item-title>
                                </v-list-item-content>
                            </v-list-item>
                        </v-col>
                    </v-row>
            </template>
          </v-virtual-scroll>

          </v-window-item>


        </v-window>
        </v-card>
    </v-card>
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
        name: "chat_chatboxComponent",
        data: () => ({
            tab: null,
            messageToSend: '',
        }),
        props: {
          channelInChatBox: {
            type: Object as () => Channel,
            default: () => ({ id: 0, name: '' }),
          },
          logedUser: {
            type: Object as () => User,
            default: () => ({ id:0, name: ''}),
          }
        },
        methods: {
            async sendMessage() {
                console.log('methods: sendMessage: ', );
                try {
                    const reponse = await axios.post('/api/chat/messageRequest', {
                        text: this.messageToSend,
                        user: this.logedUser.id,
                        channel: this.channelInChatBox.id,
                    })
                    console.log(reponse.data);
                }
                catch { console.error(); }
                this.messageToSend = ''
            },
        }
    })
</script>