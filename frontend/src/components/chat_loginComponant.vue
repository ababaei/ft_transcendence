<template>
    <v-container class="pt-10">
        <v-form @submit.prevent="this.sendUsername" method="POST"> 
            <v-text-field
                v-model="this.nameForm.name"
                name="name"
                label="Name"
            ></v-text-field>
            <v-btn type="submit">login</v-btn>
        </v-form>
    </v-container>
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
        name: "chat_BetaloginForm",
        data() {
            return {
                nameForm: {
                    name: "",
                },
            }
        },
        methods: {
        async sendUsername() {
            const reponse = await axios.post('/api/chat/setUsername', {
                username: this.nameForm.name,
            });
            console.log("reponse", reponse.data)
            this.$emit('user-loged', reponse)
            // this.logedUser.id = reponse.data.userid;
            // this.logedUser.name = reponse.data.username;
            // console.log('methods: senndUsername:', this.logedUser);
            // console.log(this.listChannels)
        },
    }
})
</script>