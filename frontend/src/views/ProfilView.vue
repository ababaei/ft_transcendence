<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import { useUserStore } from '@/stores/user';

export default {
    data() {
      return {
        jwtToken: null,
      };
    },
    created() {
      this.getUser();
    },
    methods: {
      async getUser() {
        useUserStore.fetchUser(this.$route.params.id)
        .then((res) => {console.log("Response: ", res.data)})
        .catch((err) => {console.error('Error TOTO: ', err)})
      },
      logOut() {
        axios.get('api/auth/logout')
      }
    }
  }
</script>

<template>
  <main>
    <h1>Page Profil</h1>
    <v-btn class="mt-5" @click="getUser">USER</v-btn>
    <v-btn class="mt-5" @click="logOut">Log out</v-btn>
  </main>
</template>
