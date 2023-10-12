<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import { mapActions } from 'pinia'
import jwt_decode from "jwt-decode";
import { defineComponent } from 'vue';
import router from '@/router';
import { mapStores } from 'pinia';

export default defineComponent({
    data() {
      return {
        jwtToken: null,
      };
    },
    computed: {
      profileUser() {
        return localStorage.getItem('currentUser')
      }
    },
    created() {
      const user: any = localStorage.getItem('currentUser');
      console.log("fe_user: ", user)
      console.log("CURRENT: ", localStorage.getItem('currentUser'))
      // if (this.userStore.currentUser) {
      //   this.profileUser = this.userStore.currentUser;
      // }
      // if (user) {
      //   router.push("/profil/" + user.id)
      // } else {
      //   router.push('/login')
      // }
    },
    methods: {
      // getUser() {
      //   console.log(this.userStore.currentUser)
      //   return this.userStore.currentUser
      // },
      logOut() {
        localStorage.setItem('isAuthenticated', 'false')
        localStorage.removeItem('currentUser')
        this.$cookies.remove('userData')
        router.push('/login')
      },
    }
  })
</script>

<template>
  <main>
    <h1>Page Profil</h1>
    LOGGED USER: {{profileUser}}
    <!-- <v-btn class="mt-5" @click="getUser">USER</v-btn> -->
    <v-btn class="mt-5" @click="logOut">Log out</v-btn>
  </main>
</template>