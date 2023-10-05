<script lang="ts">
import chat_BetaLoginForm from "@/components/chat_loginComponant.vue";
import { io } from 'socket.io-client';

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
      chat_BetaLoginForm
    },
    data() {
        return {
            logedUser: { name: '', id: '0' },
            socket: io('http://localhost:3000'),
            channelList: [] as Channel[],
            userList: [] as User[],
            channelInChatBox: { id: 0 } as Channel,
            channelInChatBoxID: 0 as number,
            logedUser: {id: 0} as User,
        }
    },


    methods: {
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
        console.log('Socket.io: updateFriends list');
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
      this.socket.on('logUser', (data) => {
        this.logedUser = data as User
      })
    },
  }



</script>

<template>
  <v-responsive>
    <v-container fluid>  
      <v-main>
        <v-row>
          <v-col cols="4" offset="4">
            <chat_BetaLoginForm />
          </v-col>
        </v-row>
      </v-main>
    </v-container>
  </v-responsive>
</template>