<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';
import jwt_decode from "jwt-decode";
import axios from 'axios';

    export default defineComponent ({
        name: "loginForm",
        data() {
            return {
                promptTwoFaCode: false as boolean,
                googleAuthCode: '' as string
            }
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
        mounted() {
            const cookies = this.$cookies.get("userData")
            if (cookies) {
                const twoFaActivated = cookies.user.twoFaActivated
                const tmpUser = JSON.stringify(cookies.user)
                // const decodedTkn: any = jwt_decode(cookies.token);
                localStorage.setItem('currentUser', tmpUser)
                localStorage.setItem('jwt_token', cookies.token)
                if (twoFaActivated) {
                    this.promptTwoFaCode = true;
                    return;
                } else {
                    localStorage.setItem('isAuthenticated', 'true')
                    this.promptTwoFaCode = false;
                }
                router.push('/profil/' + cookies.user.id)
            }
            if (localStorage.getItem('isAuthenticated') == 'true') {
                router.push('/profil/' + cookies.user.id)
            }
        },
        methods: {
            schoolLogin() {               
                window.location.href = 'http://localhost:8080/api/auth/42'
            },
            auth2fa() {
                console.log('AUTHUSER', this.profileUser)
                axios.post('/api/2fa/authenticate',
                    {twoFaCode: this.googleAuthCode, user: this.profileUser },
                    { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                    .then((res) => {
                        const cookies = this.$cookies.get('userData');
                        console.log('2FAAUTH', cookies);
                        localStorage.setItem('jwt_token', cookies.token);
                        localStorage.setItem('isAuthenticated', 'true');
                        router.push('/profil/' + cookies.user.id)
                    })
                    .catch((err) => {
                        console.log(err.response);
                    })
            }
        }
    })
</script>

<template>
    <v-container class="pt-10">
        <v-btn class="mt-5" @click="schoolLogin">Log with 42</v-btn>
        <v-form class='w-100' v-if='promptTwoFaCode' @submit.prevent="auth2fa">
            <v-text-field class='w-100' v-model="googleAuthCode" label="Google Auth Code"></v-text-field>
            <v-btn type="submit">Authenticate</v-btn>
      </v-form>
    </v-container>
</template>