<template>

  <v-card class="mx-auto" width="35vw" height="80vh">


<!-- HEADER DU CHANNEL AVEC EDIT LEAVE ET DESTROY -->
          <div id="channelTitle">
          <v-card-title>{{ getChannelName(channelInChatBox, profileUser) }} </v-card-title>
          <v-menu id="menuChannelTitle">
              <template v-slot:activator="{ props }">
                <v-btn icon="mdi-dots-vertical" v-bind="props"></v-btn>
              </template>
              <v-list>
                <v-list-item @click="leaveChannel">Leave Channel</v-list-item>
                <v-list-item v-if="profileUser.id == channelInChatBox.ownerID && !channelInChatBox.isDirect"
                @click="openEditChannelDialog">Edit Channel</v-list-item>
                <v-list-item v-if="profileUser.id == channelInChatBox.ownerID && !channelInChatBox.isDirect"
                @click="destroyChannel">Destroy Channel</v-list-item>
              </v-list>
          </v-menu>
          </div>
      <v-tabs class="title" v-model="this.tab">
        <v-tab value="one">Messages</v-tab>
        <v-tab value="two">Infos</v-tab>
      </v-tabs>
      <v-divider></v-divider>

<!-- ONGLETS DE LA CHATBOX -->
        <v-window v-model="this.tab">
  <!-- FENETRE DE MESSAGES DU CHANNEL -->
          <v-window-item value="one" id="messages" >
            <v-virtual-scroll :items="(channelInChatBox.messages as Message[])"  height="57vh" item-height="5vh" style="overflow-x: hidden;">
            <template v-slot:default="{ item: message }">
            <div id="messageCard" v-if="!this.isBlocked(message.user.id, this.blockedList)">
              <v-row class="w-100"
              :class="{ 'justify-end': message.user.id === this.profileUser.id,
              'justify-start': message.user.id !== this.profileUser.id }">

              <!-- avatar -->
                <v-col cols="1" v-if="message.user.id !== this.profileUser.id"><v-avatar size="40px">
                <v-img :src="message.user.avatar" alt="Avatar" />
                </v-avatar></v-col>

              <!-- text et emeteur -->
                <v-col cols="6" class="w-100"
                :class="{ 'text-right': message.user.id === this.profileUser.id,
                'text-left': message.user.id !== this.profileUser.id }"><v-list-item>
                    <v-list-item-title  style="white-space: pre-wrap;">{{ message.text }}</v-list-item-title>
                    <v-list-item-subtitle>from  {{ message.user.displayName }}</v-list-item-subtitle>
                </v-list-item></v-col>

              <!-- avatar -->
                <v-col cols="1" class="justify-end" v-if="message.user.id === this.profileUser.id"><v-avatar size="40px">
                <v-img :src="message.user.avatar" alt="Avatar" />
                </v-avatar></v-col>

              </v-row>
            </div>
            </template>
            </v-virtual-scroll>
            <v-divider></v-divider>

    <!-- ENVOIE DE MESSAGES -->
            <!-- <v-card-actions> -->
            <v-form @submit.prevent="sendMessage" method="POST"
            v-if="!isMute(profileUser.id, channelInChatBox)" id="formSendMessage">
              <div id="sendMessage">
                <v-text-field
                  v-model="this.messageToSend"
                  name="message"
                  label="Message"
                  hide-details="auto"
                  id="inputMessage">
                </v-text-field>
                <v-btn type="submit"><v-icon>mdi-send</v-icon></v-btn>
              </div>
            </v-form>
            <!-- </v-card-actions> -->
            <v-card-text v-if="this.isMute(this.profileUser.id, this.channelInChatBox)">You are mute</v-card-text>
          </v-window-item>
<!-- FENETRE D'INFO DU CHANNEL -->






<!-- LISTE USERS -->
    <v-window-item value="two" id="users">
            <div id="userTitle">
              <v-card-title>Liste des utilisateurs du channel</v-card-title>
            </div>
            <v-divider></v-divider>
          <v-virtual-scroll :items="(this.channelInChatBox.users as User[])"  height="55vh" item-height="7vh">
            <template v-slot:default="{ item: user }">
                    <div id="userInChan"
                    @click="profilePopup = true; this.userSelected = user">
                      <span>{{ user.displayName }}</span>
                      <div class="chip">
                        <v-chip v-if="user.id==this.channelInChatBox.ownerID && !this.channelInChatBox.isDirect"> owner </v-chip>
                        <v-chip v-if="this.isAdmin(user.id, this.channelInChatBox) && !this.channelInChatBox.isDirect"> admin </v-chip>
                      </div>
                        
                        
                        
              <!-- ACTIONS SUR USER -->
                    <v-menu v-if="!this.channelInChatBox.isDirect">
                      <template v-slot:activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" v-bind="props" v-if="user.id!==this.profileUser.id"></v-btn>
                      </template>
                      <v-list>
                        <div v-if="this.profileUser.id==this.channelInChatBox.ownerID || this.isAdmin(this.profileUser.id, this.channelInChatBox)">
                <!-- make admin -->
                        <v-list-item v-if="this.profileUser.id==this.channelInChatBox.ownerID && !this.isAdmin(user.id, this.channelInChatBox)"
                        @click="this.makeUserAdmin(user.id, this.channelInChatBox.id)">Make admin</v-list-item>
                <!-- unmake admin -->
                        <v-list-item v-if="this.profileUser.id==this.channelInChatBox.ownerID && this.isAdmin(user.id, this.channelInChatBox)"
                        @click="this.removeUserAdmin(user.id, this.channelInChatBox.id)">Remove admin</v-list-item>
                <!-- kick user -->
                        <v-list-item v-if="user.id!=this.profileUser.id && user.id!=this.channelInChatBox.ownerID"
                        @click="this.kickUserFromChannel(user.id, this.channelInChatBox.id)">Kick</v-list-item>
                <!-- Mute user -->
                        <v-list-item v-if="!this.isMute(user.id, this.channelInChatBox) && user.id!==this.channelInChatBox.ownerID"
                        @click="this.openTimerDialog('mute', user.id)">Mute</v-list-item>
                        <v-list-item v-if="this.isMute(user.id, this.channelInChatBox)"
                        @click="this.unmuteUser(user.id, this.channelInChatBox.id)">Unmute</v-list-item>
                        <!-- Mute user -->
                        <v-list-item v-if="!this.isBan(user.id, this.channelInChatBox) && user.id!==this.channelInChatBox.ownerID"
                        @click="this.openTimerDialog('ban', user.id)">Ban</v-list-item>
                        <v-list-item v-if="this.isBan(user.id, this.channelInChatBox)"
                        @click="this.unbanUser(user.id, this.channelInChatBox.id)">Unban</v-list-item>  
                      </div>
                    </v-list>
                  </v-menu>
                </div>
                </template>
                </v-virtual-scroll>                
              </v-window-item>          
            </v-window>
            <div id="inviteUser">
              <v-btn v-if="!this.channelInChatBox.isDirect" @click="this.openInviteDialog()"><v-icon>mdi-account-plus-outline</v-icon> Inviter un utilisateur </v-btn>
            </div>



        </v-card>


      <!-- TOGGLES -->
<!-- CHANNEL EDIT FORM TOGGLE -->
    <v-dialog v-model="this.editChannelDialog" max-width="500">
    <v-card>
      <v-card-title>Edit Channel</v-card-title>
      <v-card-text>

        <v-form @submit.prevent="this.editChannel" method="POST">
        <v-text-field
          v-model="this.channelEditForm.name"
          name="channelname"
          label="Channel name"
          autocomplete="off"
        ></v-text-field>
        <div>
          <v-radio-group inline v-model="this.channelEditForm.type">
            <v-radio label="public" value="public" color="black"></v-radio>
            <v-radio label="private" value="private" color="black"></v-radio>
            <v-radio label="protected" value="protected" color="red"></v-radio>
          </v-radio-group>
        </div>
        <div v-if="this.channelEditForm.type === 'protected'">
          <v-text-field v-model="this.channelEditForm.password" label="Password"></v-text-field>
        </div>
        <v-btn type="submit">Edit</v-btn>
      </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="this.closeEditChannelDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

<!-- TIMMER DIALOGUE -->
<v-dialog v-model="this.timerDialog" max-width="500">
    <v-card>
      <v-card-title> For how long ?</v-card-title>
      <v-card-text>
      <v-form @submit.prevent="this.submitAction">
        <div>
          <v-radio-group inline v-model="this.timerForm.time">
            <v-radio label="1 minute" value=0.25></v-radio>
            <v-radio label="30 minutes" value=30></v-radio>
            <v-radio label="1 heure" value=60></v-radio>
          </v-radio-group>
        </div>
        <v-btn type="submit"> {{ this.timerForm.action }}</v-btn>
      </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="this.closeTimerDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
<!-- INVITE FRIENDS DIALOG -->
<v-dialog v-model="this.inviteDialog" max-width="500">
    <v-card>
      <v-card-title> Add friend in channel</v-card-title>
      <v-card-text>
      <v-form @submit.prevent="this.addFriendInchannel">
        <div>
          <v-list>
          <v-card
            v-for="friend in this.friendList"
            :key="friend.id" @click="this.openInviteDialog(friend.id)"
            v-bind:class="{ 'selected-card': friend.id === selectedFriend }">
            <v-row class="d-flex justify-center" @click="selectFriend(friend.id)">
            <v-col><v-avatar size="40px">
              <v-img :src="friend.avatar" alt="Avatar" />
            </v-avatar></v-col>
            <v-col><v-list-item-title>{{ friend.displayName }}</v-list-item-title></v-col>
          </v-row>
            </v-card>
        </v-list>
        </div>
        <v-btn type="submit"> Add friend</v-btn>
      </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="this.closeInviteDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="profilePopup" max-width="400">
      <UserProfilePopUp
      :userRequested="this.userSelected"
      :friendList="this.friendList"
      :blockedList="this.blockedList"/>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import UserProfilePopUp from './UserProfilePopUp.vue';
import { VListItem } from 'vuetify/components';
import type { Channel, User, Message } from './chat_utilsMethods';
import { isAdmin, isMute, isBan, getChannelName, isBlocked } from './chat_utilsMethods'

    export default defineComponent ({
        name: "chat_chatboxComponent",
        components: {
          UserProfilePopUp,
        },
        data: () => ({
            tab: null,
            messageToSend: '',
            profilePopup: false,
            editChannelDialog: false,
            userSelected: 0,
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
            selectedFriend: 0,
            inviteDialog: false,
        }),
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
        props: {
          channelInChatBox: {
            type: Object as () => Channel,
            default: () => ({ id: 0, name: '' }),
          },
          friendList: {
            type: Array,
            default: () => [],
          },
          blockedList: {
            type: Array,
            default: () => [],
          },
        },
        methods: {
            async sendMessage() {
                // console.log('methods: sendMessage: ');
                try {
                    const reponse = await axios.post('/api/chat/messageRequest', {
                        text: this.messageToSend,
                        channel: this.channelInChatBox.id,
                    }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                    // console.log(reponse.data);
                }
                catch { console.error(); }
                this.messageToSend = ''
            },

            async leaveChannel() {
              try {
                // console.log('methods: LeaveChannel');
                if (this.channelInChatBox.users.length === 1) {
                  const reponse = await axios.post('/api/chat/destroyChannelRequest', {
                    channelID: this.channelInChatBox.id,
                  }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                  // console.log(reponse.data);
                }
                else {
                  const reponse = await axios.post('/api/chat/leaveChannelRequest', {
                    channelID: this.channelInChatBox.id,
                  }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}});
                  // console.log(reponse.data);
                }
              }
              catch { console.error(); }
            },
            async destroyChannel() {
              try {
                // console.log('methods: Destroy channel');
                const reponse = await axios.post('/api/chat/destroyChannelRequest', {
                  channelID: this.channelInChatBox.id,
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                // console.log(reponse.data);
              } catch { console.error(); }
            },
            openEditChannelDialog() {
              this.editChannelDialog = true;
              this.channelEditForm.name = this.channelInChatBox.name;
              this.channelEditForm.type = this.channelInChatBox.mode;
              this.channelEditForm.password = '';
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
            openInviteDialog() {
              this.inviteDialog = true;
            },
            closeInviteDialog() {
              this.inviteDialog = false;
              this.selectedFriend = 0;
            },
            selectFriend(friendID: number) {
              this.selectedFriend = friendID;
            },
            async editChannel() {
              try {
                const reponse = await axios.post('/api/chat/editChannelRequest', {
                  channelID: this.channelInChatBox.id,
                  newChannelName: this.channelEditForm.name,
                  newChannelType: this.channelEditForm.type,
                  newChannelPassword: this.channelEditForm.password,
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                // console.log(reponse.data);
              } catch { console.error(); }
              this.closeEditChannelDialog();
            },
// ACTIONS SUR LES USERS
            async makeUserAdmin(newAdminID: number, channelID: number) {
              try {
                // console.log('methosds: makeUserAdmin');
                const reponse = await axios.post('/api/chat/makeUserAdminRequest', {
                  channelID: channelID,
                  newAdminID: newAdminID,
                }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                // console.log(reponse.data);
              } catch { console.error(); }
            },
            async removeUserAdmin(AdminID: number, channelID: number) {
              try {
                // console.log('methosds: removeUserAdmin');
                const reponse = await axios.post('/api/chat/removeUserAdminRequest', {
                channelID: channelID,
                removedAdminID: AdminID,
              }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
              // console.log(reponse.data);
            } catch { console.error(); }
          },


    async kickUserFromChannel(userID: number, channelID: number) {
      // console.log('methods: LeaveChannel');
      try {
        const reponse = await axios.post('/api/chat/kickUserRequest', {
          channelID: channelID,
          userID: userID,
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}});
        // console.log(reponse.data);
      } catch { console.error(); }
    },

    async muteUser(userID: number, channelID: number, time: number) {
      try {
        // console.log('methosds: mute user');
        const reponse = await axios.post('/api/chat/muteUserRequest', {
          channelID: channelID,
          userID: userID,
          timer: time,
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        // console.log(reponse.data);
      } catch { console.error(); }
    },
    async unmuteUser(userID: number, channelID: number) {
      try {
        // console.log('methosds: mute user');
          const reponse = await axios.post('/api/chat/unmuteUserRequest', {
            channelID: channelID,
            userID: userID,
          }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
          // console.log(reponse.data);
      } catch { console.error(); }
    },

    async banUser(userID: number, channelID: number, time: number) {
      try {
        // console.log('methosds: ban user');
        const reponse = await axios.post('/api/chat/banUserRequest', {
          channelID: channelID,
          userID: userID,
          timer: time,
        })
        // console.log(reponse.data);
        await axios.post('/api/chat/leaveChannelRequest', {
            userID: userID,
            channelID: channelID,
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}});
        // console.log(reponse.data);
      } catch { console.error(); }
    },
    async unbanUser(userID: number, channelID: number) {
      try {
        // console.log('methosds: unban user');
          const reponse = await axios.post('/api/chat/unbanUserRequest', {
            channelID: channelID,
            userID: userID,
          }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
          // console.log(reponse.data);
      } catch { console.error(); }
    },
    async addFriendInchannel() {
      try {
        // console.log('methosds: add user in channel');
          const reponse = await axios.post('/api/chat/addFriendInChannelRequest', {
            channelID: this.channelInChatBox.id,
            friendId: this.selectedFriend,
          }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
          // console.log(reponse.data);
          this.closeInviteDialog();
      } catch { console.error(); }
    },
    submitAction() {
      if (this.timerForm.action === 'mute') {
        this.muteUser(this.timerForm.onUserID, this.channelInChatBox.id, this.timerForm.time);
      }
      else if (this.timerForm.action === 'ban') {
        this.banUser(this.timerForm.onUserID, this.channelInChatBox.id, this.timerForm.time);
      }
      this.timerDialog = false;
    },
          // IMPORTS
          isAdmin(userID: number, channel: Channel) { return isAdmin(userID, channel); },
          isMute(userID: number, channel: Channel): boolean { return isMute(userID, channel); },
          isBan(userID: number, channel: Channel): boolean { return isBan(userID, channel); },
          isBlocked(userID: number, blockedList: User[]): boolean { return isBlocked(userID, blockedList); },
          getChannelName(channel: Channel, self: User): string { return getChannelName(channel, self); }
        }
    })
</script>

<style>
.selected-card {
  background-color: #333;
  color: #fff;
}

#messages {
  margin-top: 2vh;
  padding: 0 1vw;
}

#channelTitle {
  display: flex;
  margin-top: 1vh;
  margin-bottom: 1vh;
}


#channelTitle div {
  padding-right: 2vw;
  padding-left: 1vw;
}

#userTitle {
  display: flex;
  margin-top: 1vh;
  margin-bottom: 1vh;
  justify-content: center;
}

#sendMessage {
  display: flex;
  align-items: center;
  height: 100%;
}

#formSendMessage {
  height: 10vh;
}

#sendMessage div {
  width: 98%;
}

#userInChan {
  display: flex;
  width: 100%;
  padding: 1vh 1vw;
  align-items: center;
}

#userInChan span {
  min-width: 20%;
  padding: 0 1vw;
}

#userInChan .chip {
  width: 80%;
}

#userInChan .chip * {
  margin-right: 1vw;
}

#inviteUser {
  display: flex;
  justify-content: center;
}

</style>