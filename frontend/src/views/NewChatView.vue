<template>
  <v-responsive>
    <v-container fluid>  
      <v-main>
        <v-row>
          <v-col cols="6"> <!-- Colonne de la boîte de chat -->
            <p v-if="logedUser.id!=0"> {{ logedUser.name }}</p>

<!-- CHATBOX                      @components/chat_chatboxComponent.vue -->
            <chat_chatboxComponent
            v-if="logedUser.id!=0 && channelInChatBoxID != 0"
            :channelInChatBox="channelInChatBox"
            :logedUser="logedUser"/>
          </v-col>
          <v-col cols="6">
            <v-row>
              <v-col>

  <!-- LOGIN -->
                <chat_BetaLoginForm v-if="logedUser.id==0"
                @user-loged="userLoged"/>

<!-- CHANNEL LIST                 @component/channelList.vue -->
                <chat_channelList
                 v-if="logedUser.id != 0"
                 :channelList="channelList" 
                 :logedUser="logedUser"
                 @channel-selected="selectChannel" />


<!-- CHANNEL CREATION FORM        @component/channelCreationComponent.vue-->
                 <Chat_channelCreationComponent
                 v-if="logedUser.id!=0"
                 :logedUserID="logedUser.id" />
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
            logedUser: { name: '', id: 0 } as User,
            socket: io('http://10.34.9.8:3000'),
            channelList: [] as Channel[],
            userList: [] as User[],
            channelInChatBox: { id: 0 } as Channel,
            channelInChatBoxID: 0 as number,
        }
    },


    methods: {
      updateSelectedChannel(channelId: number) {
        console.log('update: ',channelId)
      // Mettre à jour channelInChatBoxID avec l'ID du canal sélectionné
        this.channelInChatBoxID = channelId;
    },

    userLoged(user: {data: {userid: number, name: string}}) {
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
            this.channelInChatBox = this.channelList.find(channel => channel.id === this.channelInChatBoxID) as Channel;
        }
        if (!isUserInChannel(this.logedUser.id, this.channelInChatBox)) {
          this.channelInChatBox = {id: 0 } as Channel;
          this.channelInChatBoxID = 0;
        }
        console.log('listChannel at the end of updateListChannel: ', this.channelList);
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
