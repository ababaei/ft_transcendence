<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

    export default defineComponent ({
        name: "twoFaForm",
        data() {
            return {
                qrcodeSrc: '' as string,
                googleAuthCode: '' as string,
                twoFaActivated: false as boolean,
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
        methods: {
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
                    this.twoFaActivated = true;
                })
                .catch((e) => {
                    console.error(e);
                })
            },
            disable2fa() {
              //steps for 2fa to be disabled:
              //-send a GET request to /api/2fa/disable
              //-then get the cookie from the response
              //-update currentUser with the one in the cookie
              //-pass this.twoFaActivated to false
              //-set localstorage jwt_token to the new 2fa disabled token.
            }
        }
    })
</script>

<template>
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
</template>