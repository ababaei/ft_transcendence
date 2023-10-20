<template>
    <v-container class="pt-10">
      <v-card class="mx-auto" max-width="500">
        <v-card-title> New channel </v-card-title>
      <v-form @submit.prevent="this.createNewChannel" method="POST">
        <v-text-field
          v-model="this.channelCreationForm.name"
          name="channelname"
          label="Channel name"
          autocomplete="off"
        ></v-text-field>
        <div>
          <v-radio-group inline v-model="this.channelCreationForm.type">
            <v-radio label="public" value="public" color="black"></v-radio>
            <v-radio label="private" value="private" color="black"></v-radio>
            <v-radio label="protected" value="protected" color="red"></v-radio>
          </v-radio-group>
        </div>
        <div v-if="this.channelCreationForm.type === 'protected'">
          <v-text-field v-model="this.channelCreationForm.password" label="Password"></v-text-field>
        </div>
        <v-btn v-if="this.channelCreationForm.name" type="submit" color="primary">Create channel</v-btn>
      </v-form>
      </v-card>
    </v-container>
  </template>

  <style>
v-radio-group {
    background-color: black;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import type { Channel, User, Message } from './chat_utilsMethods';


    export default defineComponent ({
        name: "chat_channelCreation",
        data() {
            return {
                channelCreationForm: {
                    name: "",
                    type: 'public',
                    password: '',
                },
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
            async createNewChannel() {
                console.log('methods: createNewChannel');
                try {
                    const reponse = await axios.post('/api/chat/createChannelRequest', 
                    {
                        channelName: this.channelCreationForm.name,
                        mode: this.channelCreationForm.type,
                        password: this.channelCreationForm.password,
                    }, { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                } catch { console.error(); }
                this.channelCreationForm.name = ''
                this.channelCreationForm.password = ''
                this.channelCreationForm.type = 'public'
            },
        }
    })
</script>

<style>


/* Vous pouvez également styliser les boutons radio sélectionnés différemment */
.v-radio.is-selected {
  background-color: green; /* Par exemple, une couleur différente pour les boutons sélectionnés */
  color: white;
}
</style>