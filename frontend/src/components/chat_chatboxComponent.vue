<template>
      <v-card class="mx-auto" max-width="500">
        <v-card-title> {{ channelInChatBox.name }} </v-card-title>
      <v-tabs v-model="tab">
        <v-tab value="one">Messages</v-tab>
        <v-tab value="two">Infos</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-card height="520" item-height="48">


        <v-window v-model="tab">
<!-- FENETRE DE MESSAGES DU CHANNEL -->
          <v-window-item value="one">
            <v-virtual-scroll :items="(channelInChatBox.messages as Message[])"  height="420" item-height="48" style="overflow-x: hidden;">
            <template v-slot:default="{ item: message }">
                    <v-row>
                        <v-col :class="{ 'text-right': message.user.id === logedUser.id }">
                            <v-list-item>
                                <v-list-item-title>{{ message.user.name }}</v-list-item-title>
                                <v-list-item-subtitle style="white-space: pre-wrap;">{{ message.text }}</v-list-item-subtitle>
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
<!-- FENETRE D'INFO DU CHANNEL -->
          <v-virtual-scroll :items="(channelInChatBox.users as User[])"  height="420" item-height="48" style="overflow-x: hidden;">
            <template v-slot:default="{ item: user }">
                    <v-list-item>
                    <v-row>
                      <v-col><v-list-item-title>{{ user.name }}</v-list-item-title></v-col>
                      <v-col><v-chip v-if="user.id==channelInChatBox.ownerID"> owner </v-chip></v-col>
                    </v-row>
                    </v-list-item>

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
import { VListItem } from 'vuetify/components';
import type { Channel, friendRelation, User, Message } from './chat_utilsMethods';

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
                console.log('methods: sendMessage: ');
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