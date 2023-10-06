<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import { mapActions } from 'pinia'
import { useUserStore } from '@/stores/user';
import jwt_decode from "jwt-decode";
import { defineComponent } from 'vue';
import router from '@/router';

export default defineComponent({
    setup() {
      const userStore = useUserStore()
      console.log('PROFIL_SETUP')
      return {userStore};
    },
    data() {
      return {
        jwtToken: null,
      };
    },
    beforeCreate() {
      const user: any = this.getUser();
      console.log("fe_user: ", user)
      if (user) {
        router.push("http://localhost/profil/" + user.id)
      }
    },
    methods: {
      getUser() {
        console.log(this.userStore.currentUser)
        return this.userStore.currentUser
      },
      logOut() { 
        // axios.get('api/auth/logout')
        this.userStore.logOut();
      },
    }
  })
</script>

<template>
  <main>
    <h1>Page Profil</h1>
    <v-btn class="mt-5" @click="getUser">USER</v-btn>
    <v-btn class="mt-5" @click="logOut">Log out</v-btn>
  </main>
</template>
