<template>
      <v-card class="mx-auto" max-width="500">
        <v-card-title> {{ this.channelInChatBox.name }} </v-card-title>
      <v-tabs v-model="tab">
        <v-tab value="one">Messages</v-tab>
        <v-tab value="two">Infos</v-tab>
      </v-tabs>
  
      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="one">

            <v-list lines="one">
                <v-list-item v-for="message in this.channelInChatBox.messages" :key="message.id"
                :title="message.user.name"
                :subtitle="message.text"
                ></v-list-item>
            </v-list>
            <v-form @submit.prevent="sendMessage" method="POST">
                <v-text-field
                    v-model="messageToSend"
                    name="message"
                    label="Message">
                </v-text-field>
                <v-btn type="submit">send</v-btn>
            </v-form>

          </v-window-item>


  
          <v-window-item value="two">
          </v-window-item>
        </v-window>
      </v-card-text>
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