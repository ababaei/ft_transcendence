<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';
import axios from 'axios';
import twoFaForm from '@/components/TwoFaForm.vue'

export default defineComponent({
    data() {
      return {
        qrcodeSrc: '' as string,
        googleAuthCode: '' as string,
        twoFaActivated: false as boolean,
      };
    },
    components: {
      twoFaForm
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
    mounted() {
      if (this.profileUser)
      {
        this.twoFaActivated = this.profileUser.twoFaActivated;
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
      getUser() {
        axios.post('/api/2fa/generate',{},
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        .then((res) => {
          this.qrcodeSrc = res.data
          console.log(res.data);
        })
      },
      logOut() {
        localStorage.setItem('isAuthenticated', 'false')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('jwt_token')
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
    <two-fa-form />
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