<script lang="ts">
import { defineComponent } from 'vue';
import router from '@/router';

import axios from 'axios';
import jwt_decode from "jwt-decode";
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { mapStores } from 'pinia';

    export default defineComponent ({
        name: "loginForm",
        data() {
            return {
                profilUser: '' as string
            }
        },
        mounted() {
            const cookies = this.$cookies.get("userData")
            const tmpUser = JSON.stringify(cookies.user)
            console.log("USERID", tmpUser);
            if (cookies) {
                localStorage.setItem('isAuthenticated', 'true')
                localStorage.setItem('currentUser', tmpUser)
                localStorage.setItem('jwt_token', cookies.token)
            }
            // if (localStorage.getItem('isAuthenticated') == 'true') {
            //     router.push('/profil/' + cookies.user.id)
            // }
        },
        methods: {
            schoolLogin() {               
                window.location.href = 'http://localhost:8080/api/auth/42'
            },
        }
    })
</script>

<template>
    <v-container class="pt-10">
        <v-btn class="mt-5" @click="schoolLogin">Log with 42</v-btn>
    </v-container>
</template>