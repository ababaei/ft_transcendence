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
        const user = localStorage.getItem('currentUser')
        if (user)
          return (JSON.parse(user))
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
    mounted() {
      if (this.profileUser)
      {
        const avatar = this.profileUser.avatar;
        console.log('avatar :', avatar);
        // const profilePic = document.getElementsByTagName('img')[1];
        const profilePic = document.getElementsByTagName('img')[0];
        if (profilePic)
        {
          console.log('profilePic')
          profilePic.src = avatar;
        }
      }
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
    <!-- <h1>Page Profil</h1> -->
    <img src="" alt="" id="avatar">
    <h2>{{ profileUser.name }}</h2>
    <!-- <v-avatar v-bind:src="profileUser.avatar" rounded="0" id="avatar"></v-avatar> -->
    <!-- LOGGED USER: {{profileUser.avatar}} -->
    <!-- <v-btn class="mt-5" @click="getUser">USER</v-btn> -->
    <v-btn class="mt-5" @click="logOut">Log out</v-btn>
  </main>
</template>

<style>
#avatar {
  width: 10%;
  border-radius: 50%;
}

@media screen and (max-width: 800px) {
  #avatar {
    width: 20%;
  }
}
</style>