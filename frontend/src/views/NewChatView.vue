<template>
  <v-responsive>
    <v-container fluid>  
      <v-main>
        <v-row>
          <v-col cols="6"> <!-- Colonne de la boîte de chat -->
            <p v-if="this.logedUser.id!=0"> {{ this.logedUser.name }}</p>
            <chat_chatboxComponent
            v-if="this.logedUser.id!=0 && this.channelInChatBoxID != 0"
            :channelInChatBox="this.channelInChatBox"
            :logedUser="this.logedUser"/>
          </v-col>
          <v-col cols="6"> <!-- Colonne des autres composants -->
            <v-row>
              <v-col>
                <chat_BetaLoginForm v-if="this.logedUser.id==0"
                @user-loged="this.userLoged"/>
                <chat_channelList
                 v-if="this.logedUser.id != 0"
                 :channelList="this.channelList" 
                 :logedUser="this.logedUser"
                 @channel-selected="this.selectChannel" />
                 <Chat_channelCreationComponent v-if="this.logedUser.id!=0" :logedUserID="this.logedUser.id" />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-main>
    </v-container>
  </v-responsive>
</template>

<style>
  p {
    background: red white--text;
  }
</style>


<script lang="ts">
import chat_BetaLoginForm from "@/components/chat_loginComponant.vue";
import { io } from 'socket.io-client';
import Chat_channelCreationComponent from "@/components/chat_channelCreationComponent.vue";
import chat_channelList from "@/components/chat_channelList.vue";
import chat_chatboxComponent from "@/components/chat_chatboxComponent.vue"

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
            logedUser: { name: '', id: 0 } as User,
            socket: io('http://localhost:3000'),
            channelList: [] as Channel[],
            userList: [] as User[],
            channelInChatBox: { id: 0 } as Channel,
            channelInChatBoxID: 0 as number,
        }
    },


    methods: {
      updateSelectedChannel(channelId) {
        console.log('update: ',channelId)
      // Mettre à jour channelInChatBoxID avec l'ID du canal sélectionné
        this.channelInChatBoxID = channelId;
    },

    userLoged(user: {data: {userid, name}}) {
      console.log("Methods: logedUser: ", user.data)
      console.log(this.getUserFromId(user.data.userid));
      this.logedUser = this.getUserFromId(user.data.userid);
      console.log("logedUser: ", this.logedUser)
    },


    selectChannel(channel: Channel) {
      console.log(channel)
      this.channelInChatBox = channel;
      this.channelInChatBoxID = channel.id;
      console.log(this.channelInChatBox)
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
  },
    mounted() {

    this.socket.on('updateChannelList', (data) => {
        console.log('Socket.io: updateChanList: chatboxOnChannelID: ', this.channelInChatBoxID);
        console.log('data:', data);

        //init
        data.sort((a, b) => a.id - b.id);
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
            this.channelInChatBox = this.channelList.find(channel => channel.id === this.channelInChatBoxID) as Channel;
        }
        console.log('listChannel at the end of updateListChannel: ', this.listChannels);
    })

    this.socket.on('updateUsersList', (data) => {
        console.log('Socket.io: update userList from: ', data);
        this.userList = [];
        for (let i = 0; i < data.length; i++) {
            let userInList = data[i];
            this.userList.push(userInList);
        }
        if (this.logedUser.id) {
            let tmp = this.logedUser.id;
            this.logedUser = this.userList.find(user => user.id == tmp) as User;
        }
        console.log('userList : ', this.userList);
      })
    },
  }



</script>
