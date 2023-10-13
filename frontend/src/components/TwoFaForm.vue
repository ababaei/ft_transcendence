<script lang="ts">
import { defineComponent } from 'vue';
// import router from '@/router';

    export default defineComponent ({
        name: "twoFaForm",
        data() {
            return {
                otp: ''
            };
        },
        methods: {
            verify2FA() {
                //send user ID and otp to the backend for validation 
                //proceed to login success
            }
        }
    })
</script>

<template>
    <v-container class="pt-10">
        <input v-model="otp" placeholder="Enter OTP" />
        <button @click="verify2FA">Verify 2FA</button>
    </v-container>
</template>