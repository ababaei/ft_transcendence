<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';
import axios from 'axios';

    export default defineComponent ({
        name: "loginForm",
        data() {
            return {
                promptTwoFaCode: false as boolean,
                googleAuthCode: '' as string,
                wrongCode: false as boolean,
                forceUpdateKey: 0
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
                if (twoFaActivated && !this.profileUser.isAuthenticated) {
                    localStorage.setItem('isAuthenticated', 'true')
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
            forceUpdate() {
                this.forceUpdateKey += 1;
            },
            schoolLogin() {        
                window.location.href = '/front/api/auth/42'
            },
            auth2fa() {
                // console.log('AUTHUSER', this.profileUser)
                axios.post('/api/2fa/authenticate',
                    {twoFaCode: this.googleAuthCode, user: this.profileUser },
                    { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                    .then(() => {
                        const cookies = this.$cookies.get('userData');
                        // console.log('2FAAUTH', cookies);
                        localStorage.setItem('jwt_token', cookies.token);
                        localStorage.setItem('isAuthenticated', 'true');
                        this.forceUpdate();
                        router.push('/profil/' + cookies.user.id)
                    })
                    .catch(() => {
                        this.wrongCode = true;
                        // console.log('ERROR', err.response);
                    })
            }
        }
    })
</script>

<template>
    <v-btn rounded="xl" size="x-large" variant="outlined" @click="schoolLogin" id="connect">Log with 42</v-btn>

    <v-dialog
        v-model="promptTwoFaCode"
        :scrim="false"
        persistent
        width="30vw"
    >
        <v-card
          color="white"
        >
            <v-card-text id="authenticator">
                <v-form class='w-100' @submit.prevent="auth2fa">
                    <v-text-field class='w-100' v-model="googleAuthCode" label="Google Auth Code"></v-text-field>
                    <v-btn class="w-100" type="submit" @click="promptTwoFaCode = false">Authenticate</v-btn>
                </v-form>
            </v-card-text> 
        </v-card>
    </v-dialog>
    <v-dialog
        v-model="wrongCode"
        width="auto"
    >
        <v-card>
            <v-card-text>
                Oups, il semblerait que tu aies rentré un mauvais code de vérification. 😩
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click="wrongCode = false">Fermer</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<style scoped>


#connect, #connect span {
    color: whitesmoke;
}
</style>
