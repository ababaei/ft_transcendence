<template>
  <v-responsive>
    <v-container fluid>  
      <v-main>
        <v-row class="d-flex flex-row-reverse w-100">
        <v-btn :class="{'color': notifList.length !== 0, 'green': notifList.length !== 0}"
        @click="notifPopup=true"> notifications (+{{ notifList.length }}) </v-btn>
      </v-row>
        <v-row class="d-flex justify-space-evenly w-100" flex-wrap>
          <div v-if="channelInChatBoxID!=0" class="colonne chan">
            
             <!-- Colonne de la boîte de chat -->
<!-- CHATBOX                      @components/chat_chatboxComponent.vue -->
            <chat_chatboxComponent
            v-if="this.profileUser.id!=0 && this.channelInChatBoxID != 0"
            :channelInChatBox="this.channelInChatBox"
            :friendList="this.friendsList"
            :blockedList="this.blockedList"/>
          </div>


          <div class="colonne chan"> <!-- colonne de la liste channel -->
            <v-row>
              <div>

<!-- CHANNEL LIST                 @component/channelList.vue -->
                <chat_channelList
                 v-if="this.profileUser.id != 0"
                 :channelList="this.channelList" 
                 @channel-selected="this.selectChannel" />


<!-- CHANNEL CREATION FORM        @component/channelCreationComponent.vue-->
                 <Chat_channelCreationComponent
                 v-if="this.profileUser.id!=0"/>
              </div>

            </v-row>
          </div>

          <div
            class="friend-list-column colonne friend" v-if="profileUser.id !== 0">
            <friendListComponent
            :friendList="this.friendsList"
            :blockedList="this.blockedList"
            :channelList="this.channelList" />
          </div>
        </v-row>
      </v-main>
    </v-container>

    <!-- challenge pop up -->
    <v-dialog v-model="challengePopup" max-width="400">
    <v-card max-width="400" max-height="400" >

        <v-col><v-avatar size="200px">
        <v-img :src="this.challengeFromUser.avatar" alt="Avatar" />
        </v-avatar></v-col>

        <v-card-title>{{ challengeFromUser.displayName }}</v-card-title>

        <v-card-actions>
          <v-btn @click="acceptDuel">Accept</v-btn>
          <v-btn @click="refuseDuel">Decline</v-btn>
        </v-card-actions>
      </v-card>
</v-dialog>

    <!-- notif pop up -->
<v-dialog v-model="notifPopup" max-width="400">
    <v-card max-width="400" max-height="400" >

        <v-card-title> Notifications</v-card-title>
        <v-card-text v-if="!notifList.length">Rien de nouveau !</v-card-text>
        <v-list>
          <div
            v-for="notification in (notifList as Notification[])"
            :key="notification.id">
            <!-- message notif -->
            <v-card @click="selectChannel(getChannelFromId(notification.challengedID));
            resolveNotification(notification);
            notifPopup = false"
            v-if="notification.senderID != profileUser.id && notification.type=='message'">
              <v-card-title> {{ notification.content }}</v-card-title>
            </v-card>
            <!-- challenge notif -->
            <v-card v-if="notification.senderID != profileUser.id && notification.type=='challenge'">
              <v-card-title> {{ notification.content }}</v-card-title>
              <v-btn @click="() => { acceptDuel(notification), resolveNotification(notification)}">Accept</v-btn>
              <v-btn @click="() => { refuseDuel(notification), resolveNotification(notification)}">Decline</v-btn>
            </v-card>
          </div>
      </v-list>
    </v-card>
</v-dialog>

  </v-responsive>
</template>


<script lang="ts">
import { io } from 'socket.io-client';
import axios from 'axios';
import Chat_channelCreationComponent from "@/components/chat_channelCreationComponent.vue";
import chat_channelList from "@/components/chat_channelList.vue";
import chat_chatboxComponent from "@/components/chat_chatboxComponent.vue"
import friendListComponent from '@/components/FriendListComponent.vue';
import { type Channel, type User, type Message, isUserInChannel, type Notification } from '@/components/chat_utilsMethods';
import { notDeepStrictEqual } from 'assert';



export default {
    name: 'ChatView',
    components: {
    Chat_channelCreationComponent,
    chat_channelList,
    chat_chatboxComponent,
    friendListComponent,
},
    data() {
        return {
            socket: io(process.env.VITE_HOST, { transports : ['websocket'] }),
            channelList: [] as Channel[],
            userList: [] as User[],
            channelInChatBox: { id: 0 } as Channel,
            channelInChatBoxID: 0 as number,
            messagesInChatbox: [] as Message[],
            friendsList: [] as User[],
            blockedList: [] as User[],
            notifList: [] as Notification[],
            challengePopup: false,
            challengeFromUser: { id: 0, name: '', avatar: '' } as User,
            notifPopup: false,
            challengeId: 0
        }
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


    methods: {
      updateSelectedChannel(channelId: number) {
        // console.log('update: ',channelId)
      // Mettre à jour channelInChatBoxID avec l'ID du canal sélectionné
        this.channelInChatBoxID = channelId;
    },


    async selectChannel(channel: Channel) {
      // console.log(channel)
      this.channelInChatBox = channel;
      this.channelInChatBoxID = channel.id;
      // this.channelInChatBox.messages = [];
      const tmp = (await this.getMessageList()).data as Message[];
      if (tmp) {
        this.channelInChatBox.messages = tmp;
      }
      // console.log('messageiNCHatBox: ',this.messagesInChatbox);
      // if (channel.isDirect || this.isUserInChannel(this.logedUser.id, this.chatboxOnChannel)) {this.chatboxWindow = 1}
      // console.log('methods: selectChannel:', this.channelInChatBox);
    },
    async resolveNotification(notif: Notification) {
      try {
        // if (notif.resolved) {
        //   return ;
        // }
        const reponse = await axios.post('/api/chat/resolveNotifRequest', {
          notifID: notif.id,
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}}) as Message[];
        // console.log('messageList:', reponse);
        return (reponse as Message[]);
      }
      catch {
        console.error();
        return null;
      }
    },

    getUserFromId(userID: number) {
      // console.log('Methods: getUserFromId')
      // console.log('userlist: ', this.userList);
      // console.log(userID);
      const userFounded = this.userList.find(user => user.id == userID);
      // console.log(userFounded);
      if (userFounded)
        return (userFounded);
      return {id: 0, name: ''} as User;
    },
    getChannelFromId(channelID: number) {
      // console.log('Methods: getUserFromId')
      // console.log('userlist: ', this.userList);
      // console.log(userID);
      const channelFounded = this.channelList.find(channel => channel.id == channelID) as Channel;
      // console.log(userFounded);
      if (channelFounded)
        return (channelFounded);
      return {id: 0, name: ''} as Channel;
    },

    async getMessageList(): Promise<Message[]> {
      // console.log('method: get message in channel');
      try {
        const reponse = await axios.post('/api/chat/getMessageList', {
          channelID: this.channelInChatBoxID,
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}}) as Message[];
        // console.log('messageList:', reponse);
        return (reponse as Message[]);
      }
      catch {
        console.error();
        return null;
      }
    },

    async getFriendList(): Promise<User[]> {
      // console.log('method: get friend in channel');
      try {
        const reponse = await axios.post('/api/chat/getFriendsList', {
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}}) as User[];
        // console.log('messageList:', reponse);
        return (reponse as User[]);
      }
      catch {
        console.error();
        return null;
      }
    },
    async getBlockedList(): Promise<User[]> {
      // console.log('method: get blocked list');
      try {
        const reponse = await axios.post('/api/chat/getBlockedList', {
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}}) as User[];
        // console.log('blockedList:', reponse);
        return (reponse as User[]);
      }
      catch {
        console.error();
        return null;
      }
    },

    async getNotifList(): Promise<Notification[]> {
      // console.log('method: get blocked list');
      try {
        const reponse = await axios.post('/api/chat/getNotifList', {
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}}) as Notification[];
        // console.log('blockedList:', reponse);
        return (reponse as Notification[]);
      }
      catch {
        console.error();
        return null;
      }
    },

    selectDirectConv(userid: number) {
    const directChannel = this.channelList.find((channel) => {
    return (
        channel.isDirect &&
        channel.users.length === 2 && // S'assurer qu'il n'y a que 2 participants
        channel.users.some((user) => user.id === this.profileUser.id) && // L'utilisateur actuel participe
        channel.users.some((user) => user.id === userid) // L'utilisateur cible participe
      );
    });

    if (directChannel) { this.selectChannel(directChannel) }
  },

  async acceptDuel(notification:Notification) {
    this.challengeId = notification.gameID
    await axios.put('/api/games/accept/' + this.challengeId);
    this.$router.push('/private/' + this.challengeId);
  },
  async refuseDuel(notification:Notification) {
    this.challengeId = notification.gameID
    await axios.put('/api/games/refuse/' + this.challengeId);
    this.challengePopup = false;

  }
},
    mounted() {

    this.socket.on('updateChannelList', async (data) => {
        // console.log('Socket.io: updateChanList: chatboxOnChannelID: ', this.channelInChatBoxID);
        // console.log('data:', data);

        //init
        data.sort((a: Channel, b: Channel) => a.id - b.id);
        this.channelList = [];
        let cpy = [] as Channel[];
        cpy.push({id: -1,} as Channel);                                 //pansement

        //save du channel in chatbox
        this.channelInChatBoxID = this.channelInChatBox.id;
        this.channelInChatBox = { id: 0 } as Channel;

        // remplissage de la listChannel du client
        for (let i = 0; i < data.length; i++) {
            let pushedChannel = data[i];
            cpy.push(pushedChannel);
        }
        for (let i = 0; i < cpy.length; i++) {
            let pushedChannel = cpy[i];
            this.channelList.push(pushedChannel);
        }

        // mise a jour de channel in chat box
        if (this.channelInChatBoxID !== 0) {
          const tmp = this.channelList.find(channel => channel.id === this.channelInChatBoxID)
          if (tmp) {
            this.selectChannel(tmp)
          }
        }
        if (!isUserInChannel(this.profileUser.id, this.channelInChatBox)) {
          this.channelInChatBox = {id: 0 } as Channel;
          this.channelInChatBoxID = 0;
        }
        // console.log('listChannel at the end of updateListChannel: ', this.channelList);
        // console.log('chatBoxOnChannel: ', this.channelInChatBox)
    })

    this.socket.on('updateUsersList', async (data) => {
        this.userList = [] as User[];
        this.notifList = [] as Notification[];

        for (let i = 0; i < data.length; i++) {
            let userInList = data[i] as User;
            this.userList.push(userInList);
        }

        const tmp = (await this.getFriendList()).data as User[];
        if (tmp) {
          this.friendsList = await tmp;
        }
        const tmp2 = (await this.getBlockedList()).data as User[];
        if (tmp) {
          this.blockedList = await tmp2;
        }
        const tmp3 = (await this.getNotifList()).data as Notification[];
        if (tmp3) {
          this.notifList = await tmp3;
          this.notifList = this.notifList.filter((notification) => notification.senderID !== this.profileUser.id);
        }
      })
    },
  }

</script>

<style scoped>
.friend-list-column {
  flex: 0 0 auto;
  background-color: #f0f0f074;
  padding: 10px;
  width: 25vw;
  overflow-y: auto;
  height: 100vh;
}

.colonne {
  height: 90vh;
  display: flex;
  align-items: center;
}

.green {
  background-color: lightgreen;
  color: white;
  /* Autres styles spécifiques à la classe "green" */
}



</style>