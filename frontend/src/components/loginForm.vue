<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

    export default defineComponent ({
        setup() {
            const userStore = useUserStore()
            return { userStore }
        },
        name: "loginForm",
        data() {},
        mounted() {
            const cookies = this.$cookies.get("userData")
            console.log(cookies);
            if (cookies) {
                this.userStore.logIn(cookies);
                // this.userStore.userToken = cookies.token;
                // this.userStore.currentUser = cookies.user;
            } else {
                this.userStore.currentUser = null;
            }
            console.log("OBJ :", {cookies});
            console.log(cookies.token);
            console.log(jwt_decode(cookies.token))
        },
        methods: {
            schoolLogin() {               
                window.location.href = 'http://localhost:8080/api/auth/42'
                console.log("_____________________TOTO_____________")
            },
        }
    })
</script>

<template>
    <v-container class="pt-10">
        <v-btn class="mt-5" @click="schoolLogin">Log with 42</v-btn>
    </v-container>
</template>