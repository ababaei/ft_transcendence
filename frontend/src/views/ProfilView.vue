<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';

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
        return null
      }
    },
    created() {
      const user: any = localStorage.getItem('currentUser');
      console.log("fe_user: ", user)
      console.log("CURRENT: ", localStorage.getItem('currentUser'))
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
          profilePic.style.width = '5vw';
          profilePic.style.height = '10vh';
          profilePic.style.borderRadius = '50%';
        }
      }
    },
    methods: {
      getUser() {
        
      },
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
    <v-btn class="mt-5" @click="getUser">USER</v-btn>
    <v-btn class="mt-5" @click="logOut">Log out</v-btn>
  </main>
</template>