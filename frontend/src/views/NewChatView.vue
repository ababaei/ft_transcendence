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
            :channelInChatBox="this.channelInChatBox"/>
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
        </v-row>
      </v-main>
    </v-container>
  </v-responsive>
</template>


<script lang="ts">
import chat_BetaLoginForm from "@/components/chat_loginComponant.vue";
import { io } from 'socket.io-client';
import axios from 'axios';
import Chat_channelCreationComponent from "@/components/chat_channelCreationComponent.vue";
import chat_channelList from "@/components/chat_channelList.vue";
import chat_chatboxComponent from "@/components/chat_chatboxComponent.vue"
import { type Channel, type friendRelation, type User, type Message, isUserInChannel } from '@/components/chat_utilsMethods';



export default {
    name: 'ChatView',
    components: {
    chat_BetaLoginForm,
    Chat_channelCreationComponent,
    chat_channelList,
    chat_chatboxComponent
},
    data() {
        return {
            socket: io('/api'),
            channelList: [] as Channel[],
            userList: [] as User[],
            channelInChatBox: { id: 0 } as Channel,
            channelInChatBoxID: 0 as number,
            messagesInChatbox: [] as Message[],
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

    this.socket.on('updateUsersList', (data) => {
        console.log('Socket.io: update userList from: ', data);
        this.userList = [];
        for (let i = 0; i < data.length; i++) {
            let userInList = data[i];
            this.userList.push(userInList);
        }
        console.log('userList : ', this.userList);
      })
    },
  }



</script>
