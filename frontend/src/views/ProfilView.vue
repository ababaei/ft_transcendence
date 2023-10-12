<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import { mapActions } from 'pinia'
import { useUserStore } from '@/stores/user';
import jwt_decode from "jwt-decode";
import { defineComponent } from 'vue';
import router from '@/router';
import { mapStores } from 'pinia';

export default defineComponent({
    // setup() {
    //   const userStore = useUserStore()
    //   console.log('PROFIL_SETUP:', userStore.currentUser)
    //   return {userStore};
    // },
    // computed: {
    //   ...mapStores(useUserStore)
    // },
    data() {
      return {
        jwtToken: null,
        profileUser: '' as string,
      };
    },
    created() {
      const user: any = this.getUser();
      console.log("fe_user: ", user)
      console.log("CURRENT: ", localStorage.getItem('currentUser'))
      // if (this.userStore.currentUser) {
      //   this.profileUser = this.userStore.currentUser;
      // }
      if (user) {
        router.push("http://localhost/profil/" + user.id)
      }
    },
    methods: {
      // getUser() {
      //   console.log(this.userStore.currentUser)
      //   return this.userStore.currentUser
      // },
      // logOut() { 
      //   // axios.get('api/auth/logout')
      //   this.userStore.logOut();
      // },
    }
  })
</script>

<template>
  <main>
    <h1>Page Profil</h1>
    LOGGED USER: {{ profileUser }}
    <v-btn class="mt-5" @click="getUser">USER</v-btn>
    <v-btn class="mt-5" @click="logOut">Log out</v-btn>
  </main>
</template>