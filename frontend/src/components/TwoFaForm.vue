<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

    export default defineComponent ({
        name: "twoFaForm",
        data() {
            return {
                qrcodeSrc: '' as string,
                googleAuthCode: '' as string,
                FActivated: false,
                activation: false,
                wrongCode: false as boolean,
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
        mounted() {
            if (this.profileUser)
            {
                axios.get('/api/users/' + this.profileUser.id)
                .then((res) => {
                    this.FActivated = res.data.twoFaActivated
                })
            }
        },
        methods: {
            async activate2fa() {
                this.activation = true;
                await axios.post('/api/2fa/generate', this.profileUser,
                { headers: {"Authorization" : `Bearer ${ this.jwt_token }`},
                responseType: 'arraybuffer'})
                .then((res) => {
                    const blob = new Blob([res.data], { type: 'image/png' });
                    const dataUrl = URL.createObjectURL(blob);
          
                    this.qrcodeSrc = dataUrl;
                })
            },
            async update2fa(active: boolean) {
                await axios.put('/api/users/' + this.profileUser.id, {active})
                    .then(() => {
                    this.FActivated = active
                })
            },
            async verify2fa() {
                await axios.post('/api/2fa/turn-on',
                {twoFaCode: this.googleAuthCode, user: this.profileUser },
                { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                .then((res) => {
                    const cookies = this.$cookies.get('userData')
                    // console.log('FRONT', cookies)
                    localStorage.setItem('currentUser', JSON.stringify(cookies.user))
                    this.update2fa(true)
                    this.activation = false
                })
                .catch((e) => {
                    this.wrongCode = true;
                    console.error(e);
                })
            },
            async disable2fa() {                
                await axios.get('/api/2fa/disable',
                { headers: {"Authorization" : `Bearer ${ this.jwt_token }`}})
                .then(() => {
                    const cookies = this.$cookies.get('userData');
                    localStorage.setItem('currentUser', JSON.stringify(cookies.user));
                    localStorage.setItem('jwt_token', cookies.token);
                    this.update2fa(false);
                })
            }
        }
    })
</script>

<template>
        <v-btn class="mt-5" @click="activate2fa" v-if="FActivated == false && !activation">Activer 2FA</v-btn>
        <img :src="qrcodeSrc" v-if="activation" class="activation">
        <v-form v-if="activation" id="formActiv" class="activation" @submit.prevent="verify2fa">
            <v-text-field v-model="googleAuthCode" label="Google Auth Code"></v-text-field>
            <v-btn id="btnForm" type="submit">Vérifier</v-btn>
        </v-form>
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
        <v-btn v-if="FActivated" class="mt-5" @click="disable2fa">Désactiver 2FA</v-btn>
</template>

<style scoped>

.activation {
    margin-top: 1vh;
}

#formActiv {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

</style>