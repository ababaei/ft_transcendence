<template>
  <v-responsive>
    <v-container fluid>  
      <v-main>
        <v-row class="d-flex justify-space-evenly w-100" flex-wrap>
          <p v-if="this.profileUser.id!=0"> {{ this.profileUser.name }}</p>

          <v-col v-if="this.channelInChatBoxID!=0"> <!-- Colonne de la boîte de chat -->
<!-- CHATBOX                      @components/chat_chatboxComponent.vue -->
            <chat_chatboxComponent
            v-if="this.profileUser.id!=0 && this.channelInChatBoxID != 0"
            :channelInChatBox="this.channelInChatBox"
            :friendList="this.friendsList"
            :blockedList="this.blockedList"/>
          </v-col>


          <v-col> <!-- colonne de la liste channel -->
            <v-row>
              <v-col>
  <!-- LOGIN -->
                <!-- <chat_BetaLoginForm v-if="this.fe_user.id==0"
                @user-loged="this.userLoged"/> -->

<!-- CHANNEL LIST                 @component/channelList.vue -->
                <chat_channelList
                 v-if="this.profileUser.id != 0"
                 :channelList="this.channelList" 
                 @channel-selected="this.selectChannel" />


<!-- CHANNEL CREATION FORM        @component/channelCreationComponent.vue-->
                 <Chat_channelCreationComponent
                 v-if="this.profileUser.id!=0"/>
              </v-col>

            </v-row>
          </v-col>

          <v-col
            class="friend-list-column" v-if="profileUser.id !== 0">
            <friendListComponent
            :friendList="this.friendsList"
            :blockedList="this.blockedList"
            :channelList="this.channelList" />
          </v-col>
        </v-row>
      </v-main>
    </v-container>
  </v-responsive>
</template>


<script lang="ts">
import { io } from 'socket.io-client';
import axios from 'axios';
import Chat_channelCreationComponent from "@/components/chat_channelCreationComponent.vue";
import chat_channelList from "@/components/chat_channelList.vue";
import chat_chatboxComponent from "@/components/chat_chatboxComponent.vue"
import friendListComponent from '@/components/FriendListComponent.vue';
import { type Channel, type User, type Message, isUserInChannel } from '@/components/chat_utilsMethods';



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
            blockedList: [] as User[]
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
      console.log("fe_user: ", user)
      console.log("CURRENT: ", localStorage.getItem('currentUser'))
    },


    methods: {
      updateSelectedChannel(channelId: number) {
        console.log('update: ',channelId)
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
      console.log('messageiNCHatBox: ',this.messagesInChatbox);
      // if (channel.isDirect || this.isUserInChannel(this.logedUser.id, this.chatboxOnChannel)) {this.chatboxWindow = 1}
      console.log('methods: selectChannel:', this.channelInChatBox);
    },

    getUserFromId(userID: number) {
      console.log('Methods: getUserFromId')
      console.log('userlist: ', this.userList);
      console.log(userID);
      const userFounded = this.userList.find(user => user.id == userID);
      console.log(userFounded);
      if (userFounded)
        return (userFounded);
      return {id: 0, name: ''} as User;
    },

    async getMessageList(): Promise<Message[]> {
      console.log('method: get message in channel');
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
      console.log('method: get friend in channel');
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
      console.log('method: get blocked list');
      try {
        const reponse = await axios.post('/api/chat/getBlockedList', {
        }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}}) as User[];
        console.log('blockedList:', reponse);
        return (reponse as User[]);
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
},
    mounted() {

    this.socket.on('updateChannelList', async (data) => {
        console.log('Socket.io: updateChanList: chatboxOnChannelID: ', this.channelInChatBoxID);
        console.log('data:', data);

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
        console.log('listChannel at the end of updateListChannel: ', this.channelList);
        console.log('chatBoxOnChannel: ', this.channelInChatBox)
    })

    this.socket.on('updateUsersList', async (data) => {
        console.log('Socket.io: update userList from: ', data);
        this.userList = [];
        for (let i = 0; i < data.length; i++) {
            let userInList = data[i];
            this.userList.push(userInList);
        }
        const tmp = (await this.getFriendList()).data as User[];
        if (tmp) {
          this.friendsList = tmp;
        }
        const tmp2 = (await this.getBlockedList()).data as User[];
        if (tmp) {
          this.blockedList = tmp2;
        }
      })
    },
  }

</script>

<style scoped>
.friend-list-column {
  flex: 0 0 auto;
  width: 300px;
  background-color: #f0f0f0;
  padding: 10px;
  overflow-y: auto;
  height: 100vh;
}
</style>