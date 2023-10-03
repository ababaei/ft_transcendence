<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import { mapActions } from 'pinia'
import { useUserStore } from '@/stores/user';
import jwt_decode from "jwt-decode";
import { defineComponent } from 'vue';

export default defineComponent({
    setup() {
      const userStore = useUserStore()

      
      return {userStore};
    },
    data() {
      return {
        jwtToken: null,
      };
    },
    created() {
      const cookies = this.$cookies.get("userData")
            console.log(typeof(cookies));
            console.log(cookies.token);
            console.log(jwt_decode(cookies.token))
      console.log("ROUTE_ID: ", this.$route.params.id, typeof(this.$route.params.id))
      this.getUser();
    },
    methods: {
      async getUser() {
        await this.userStore.fetchUser(this.$route.params.id as string)
      },
      logOut() { 
        axios.get('api/auth/logout')
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
