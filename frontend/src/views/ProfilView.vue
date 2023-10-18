<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';
import axios from 'axios';

export default defineComponent({
    data() {
      return {
        qrcodeSrc: '' as string,
        googleAuthCode: '' as string
      };
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
        this.$cookies.remove('userData')
        router.push('/login')
      },
      async activate2fa() {
        await axios.post('/api/2fa/generate', this.profileUser,
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`},
          responseType: 'arraybuffer'})
        .then((res) => {
          // this.qrcodeSrc = `data:image/png;base64,${res.data}`;
          
          const blob = new Blob([res.data], { type: 'image/png' });
          const dataUrl = URL.createObjectURL(blob);
          
          this.qrcodeSrc = dataUrl;
        })
      },
      async verify2fa() {
        await axios.post('/api/2fa/turn-on',
        {twoFaCode: this.googleAuthCode, user: this.profileUser },
        { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
        .then((res) => {
          const cookies = this.$cookies.get('userData')
          console.log('FRONT', cookies)
          localStorage.setItem('currentUser', JSON.stringify(cookies.user))
        })
        .catch((e) => {
          console.error(e);
        })
      },
      disable2fa() {

      }
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
    <v-container class="align-center" v-if=!profileUser.twoFaActivated>
      <v-btn class="mt-5" @click="activate2fa">Enable 2FA</v-btn>
      <img :src="qrcodeSrc" >
      <v-form @submit.prevent="verify2fa">
        <v-text-field v-model="googleAuthCode" label="Google Auth Code"></v-text-field>
        <v-btn type="submit">verify</v-btn>
      </v-form>
    </v-container>
    <v-container v-else-if=profileUser.twoFaActivated>
      <v-btn class="mt-5" @click="disable2fa">Disable 2FA</v-btn>
    </v-container>
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