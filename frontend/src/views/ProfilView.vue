<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';
import { mapActions } from 'pinia'
import { useUserStore } from '@/stores/user';
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
      
      this.getUser();
    },
    methods: {
      async getUser() {
        await this.userStore.fetchUser(this.$route.params.id)
        .then((res: any) => {console.log("Response: ", res.data)})
        .catch((err: any) => {console.error('Error TOTO: ', err)})
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
