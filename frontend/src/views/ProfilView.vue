<script lang="ts">
import axios from 'axios';
import Vue from 'vue';
import VueCookies from 'vue-cookies';

export default {
    data() {
      return {
        jwtToken: null,
      };
    },
    mounted() {
      const cooks = this.$cookies.get("userData")
      console.log(cooks);
      axios.get('/api/auth/test', {
        withCredentials: true
      })
      .then(() => 
        {console.log(this.$cookies.get('userData'))}
      )
    },
    methods: {
      getUser() {
        axios.get('/api/auth/user/ababaei', {
          withCredentials: true
        })
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
