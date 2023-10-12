<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
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
            console.log(cookies);
            if (cookies) {
                localStorage.setItem('isAuthenticated', 'true')
                localStorage.setItem('currentUser', cookies.user)
                localStorage.setItem('jwt_token', cookies.token)
            }
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
        CURRENT USER: {{ profilUser.name }}
    </v-container>
</template>