<template>

<!-- HEADER DU CHANNEL AVEC EDIT LEAVE ET DESTROY -->
      <v-card class="mx-auto" max-width="500">
        <v-row>
        <v-card-title> {{ channelInChatBox.name }} </v-card-title>
        <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
            </template>
            <v-list>
              <v-list-item @click="leaveChannel">Leave Channel</v-list-item>
              <v-list-item v-if="logedUser.id == channelInChatBox.ownerID"
              @click="openEditChannelDialog">Edit Channel</v-list-item>
              <v-list-item v-if="logedUser.id == channelInChatBox.ownerID"
              @click="destroyChannel">Destroy Channel</v-list-item>
            </v-list>
        </v-menu>
        </v-row>
      <v-tabs v-model="tab">
        <v-tab value="one">Messages</v-tab>
        <v-tab value="two">Infos</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-card height="520" item-height="48">

<!-- ONGLETS DE LA CHATBOX -->
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

    <!-- ENVOIE DE MESSAGES -->
            <v-form @submit.prevent="sendMessage" method="POST" v-if="!isMute(logedUser.id, channelInChatBox)">
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

<!-- FENETRE D'INFO DU CHANNEL -->
          <v-window-item value="two">

      <!-- LISTE USERS -->
          <v-card>
            <v-card-title>Users in channel</v-card-title>
            <v-divider></v-divider>
          <v-virtual-scroll :items="(channelInChatBox.users as User[])"  height="420" item-height="48" style="overflow-x: hidden;">
            <template v-slot:default="{ item: user }">
                    <v-list-item>
                    <v-row>
                      <v-col><v-list-item-title>{{ user.name }}</v-list-item-title></v-col>
                      <v-col>
                        <v-chip v-if="user.id==channelInChatBox.ownerID"> owner </v-chip>
                        <v-chip v-if="isAdmin(user.id, channelInChatBox)"> admin </v-chip>
                      </v-col>
              <!-- ACTIONS SUR USER -->
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
                      </template>
                      <v-list>
                        <div v-if="logedUser.id==channelInChatBox.ownerID || isAdmin(logedUser.id, channelInChatBox)">
                <!-- make admin -->
                        <v-list-item v-if="logedUser.id==channelInChatBox.ownerID && !isAdmin(user.id, channelInChatBox)"
                        @click="makeUserAdmin(user.id, channelInChatBox.id)">Make admin</v-list-item>
                <!-- unmake admin -->
                        <v-list-item v-if="logedUser.id==channelInChatBox.ownerID && isAdmin(user.id, channelInChatBox)"
                        @click="removeUserAdmin(user.id, channelInChatBox.id)">Remove admin</v-list-item>
                <!-- kick user -->
                        <v-list-item v-if="user.id!=logedUser.id && user.id!=channelInChatBox.ownerID"
                        @click="kickUserFromChannel(user.id, channelInChatBox.id)">Kick</v-list-item>
                <!-- Mute user -->
                        <v-list-item v-if="!isMute(user.id, channelInChatBox) && user.id!==channelInChatBox.ownerID"
                        @click="openTimerDialog('mute', user.id)">Mute</v-list-item>
                        <v-list-item v-if="isMute(user.id, channelInChatBox)"
                        @click="unmuteUser(user.id, channelInChatBox.id)">Unmute</v-list-item>                        
                      </div>
                      </v-list>
                    </v-menu>
                    </v-row>
                    </v-list-item>

            </template>
          </v-virtual-scroll>
          </v-card>

          </v-window-item>


        </v-window>
        </v-card>
    </v-card>

      <!-- TOGGLES -->
<!-- CHANNEL EDIT FORM TOGGLE -->
    <v-dialog v-model="editChannelDialog" max-width="500">
    <v-card>
      <v-card-title>Edit Channel</v-card-title>
      <v-card-text>

        <v-form @submit.prevent="editChannel" method="POST">
        <v-text-field
          v-model="channelEditForm.name"
          name="channelname"
          label="Channel name"
          autocomplete="off"
        ></v-text-field>
        <div>
          <v-radio-group inline v-model="channelEditForm.type">
            <v-radio label="public" value="public" color="black"></v-radio>
            <v-radio label="private" value="private" color="black"></v-radio>
            <v-radio label="protected" value="protected" color="red"></v-radio>
          </v-radio-group>
        </div>
        <div v-if="channelEditForm.type === 'protected'">
          <v-text-field v-model="channelEditForm.password" label="Password"></v-text-field>
        </div>
        <v-btn type="submit">Edit</v-btn>
      </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeEditChannelDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

<!-- TIMMER DIALOGUE -->
<v-dialog v-model="timerDialog" max-width="500">
    <v-card>
      <v-card-title> For how long ?</v-card-title>
      <v-card-text>
      <v-form @submit.prevent="submitAction">
        <div>
          <v-radio-group inline v-model="timerForm.time">
            <v-radio label="1 minute" value=0.25></v-radio>
            <v-radio label="30 minutes" value=30></v-radio>
            <v-radio label="1 heure" value=60></v-radio>
          </v-radio-group>
        </div>
        <v-btn type="submit"> {{ timerForm.action }}</v-btn>
      </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="closeTimerDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { VListItem } from 'vuetify/components';
import type { Channel, friendRelation, User, Message } from './chat_utilsMethods';
import { isAdmin, isMute } from './chat_utilsMethods'

    export default defineComponent ({
        name: "chat_chatboxComponent",
        data: () => ({
            tab: null,
            messageToSend: '',
            editChannelDialog: false,
            channelEditForm: {
              name: '',
              type: 'public',
              password: '',
            },
            timerDialog: false,
            timerForm: {
              action: '',
              onUserID: 0,
              time: 0,
            },
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
            async leaveChannel() {
              try {
                console.log('methods: LeaveChannel');
                if (this.channelInChatBox.users.length === 1) {
                  const reponse = await axios.post('/api/chat/destroyChannelRequest', {
                    channelID: this.channelInChatBox.id,
                  })
                  console.log(reponse.data);
                }
                else {
                  const reponse = await axios.post('/api/chat/leaveChannelRequest', {
                    userID: this.logedUser.id,
                    channelID: this.channelInChatBox.id,
                  });
                  console.log(reponse.data);
                }
              }
              catch { console.error(); }
            },
            async destroyChannel() {
              try {
                console.log('methods: Destroy channel');
                const reponse = await axios.post('/api/chat/destroyChannelRequest', {
                  channelID: this.channelInChatBox.id,
                })
                console.log(reponse.data);
              } catch { console.error(); }
            },
            openEditChannelDialog() {
              this.editChannelDialog = true;
              this.channelEditForm.name = this.channelInChatBox.name;
              this.channelEditForm.type = this.channelInChatBox.mode;
              this.channelEditForm.password = this.channelInChatBox.password;
            },
            closeEditChannelDialog() {
              this.editChannelDialog = false;
            },
            openTimerDialog(action: string, onUser: number) {
              this.timerDialog = true;
              this.timerForm.onUserID = onUser;
              this.timerForm.action = action;
            },
            closeTimerDialog() {
              this.timerDialog = false;
              this.timerForm.time = 0;
            },
            async editChannel() {
              try {
                const reponse = await axios.post('/api/chat/editChannelRequest', {
                  channelID: this.channelInChatBox.id,
                  newChannelName: this.channelEditForm.name,
                  newChannelType: this.channelEditForm.type,
                  newChannelPassword: this.channelEditForm.password,
                })
                console.log(reponse.data);
              } catch { console.error(); }
              this.closeEditChannelDialog();
            },
// ACTIONS SUR LES USERS
            async makeUserAdmin(newAdminID: number, channelID: number) {
              try {
                console.log('methosds: makeUserAdmin');
                const reponse = await axios.post('/api/chat/makeUserAdminRequest', {
                  channelID: channelID,
                  newAdminID: newAdminID,
                })
                console.log(reponse.data);
              } catch { console.error(); }
            },
            async removeUserAdmin(AdminID: number, channelID: number) {
              try {
                console.log('methosds: removeUserAdmin');
                const reponse = await axios.post('/api/chat/removeUserAdminRequest', {
                channelID: channelID,
                removedAdminID: AdminID,
              })
              console.log(reponse.data);
            } catch { console.error(); }
          },


    async kickUserFromChannel(userID: number, channelID: number) {
      console.log('methods: LeaveChannel');
      try {
        if (this.channelInChatBox.users.length === 1) {
            const reponse = await axios.post('/api/chat/destroyChannelRequest', {
            channelID: this.channelInChatBox.id,
          })
          console.log(reponse.data);
        }
        else {
          const reponse = await axios.post('/api/chat/leaveChannelRequest', {
            userID: userID,
            channelID: channelID,
          });
          console.log(reponse.data);
        }
      } catch { console.error(); }
    },

    async muteUser(userID: number, channelID: number, time: number) {
      try {
        console.log('methosds: mute user');
        const reponse = await axios.post('/api/chat/muteUserRequest', {
          channelID: channelID,
          userID: userID,
          timer: time,
        })
        console.log(reponse.data);
      } catch { console.error(); }
    },
    async unmuteUser(userID: number, channelID: number) {
      try {
        console.log('methosds: mute user');
          const reponse = await axios.post('/api/chat/unmuteUserRequest', {
            channelID: channelID,
            userID: userID,
          })
          console.log(reponse.data);
      } catch { console.error(); }
    },


    async banUser(userID: number, channelID: number, time: number) {
      try {
        console.log('methosds: ban user');
        const reponse = await axios.post('/api/chat/banUserRequest', {
          channelID: channelID,
          userID: userID,
          timer: time,
        })
        console.log(reponse.data);
        await axios.post('/api/chat/leaveChannelRequest', {
            userID: userID,
            channelID: channelID,
        });
        console.log(reponse.data);
      } catch { console.error(); }
    },
    async unbanUser(userID: number, channelID: number) {
      try {
        console.log('methosds: unban user');
          const reponse = await axios.post('/api/chat/unbanUserRequest', {
            channelID: channelID,
            userID: userID,
          })
          console.log(reponse.data);
      } catch { console.error(); }
    },
    submitAction() {
      if (this.timerForm.action === 'mute') {
        this.muteUser(this.timerForm.onUserID, this.channelInChatBox.id, this.timerForm.time);
      }
      this.timerDialog = false;
    },

          // IMPORTS
          isAdmin(userID: number, channel: Channel) { return isAdmin(userID, channel); },
          isMute(userID: number, channel: Channel): boolean { return isMute(userID, channel); },
        }
    })
</script>