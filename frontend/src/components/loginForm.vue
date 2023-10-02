<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

    export default defineComponent ({
        name: "loginForm",
        data() {
            return {
                myForm: {
                    email: "",
                    password: "",
                },
            }
        },
        mounted() {
            const cookies = this.$cookies.get("userData")
            console.log(typeof(cookies));
            console.log(cookies.token);
            console.log(jwt_decode(cookies.token))
                      
        },
        methods: {
            handleSubmit() {
                //do something with axios here i think
                axios.post('/api/auth/signup', {
                    email: this.myForm.email,
                    password: this.myForm.password,
                })
                .then((response) => {console.log("Response: ", response)})
                .catch((error) => {console.error('Error: ', error)})
                console.log(this.myForm);
            },
            schoolLogin() {               
                window.location.href = 'http://localhost:8080/api/auth/42'
                console.log("_____________________TOTO_____________")
                // axios.get('')
                // axios.get('/api/auth/42', {
                //     // withCredentials: true
                // })
                // .then((res) => {console.log("Response: ", res.data)})
                // .catch((err) => {console.error('Error TOTO: ', err)})
            },
        }
    })


</script>

<template>
    <v-container class="pt-10">
        <v-form @submit.prevent="handleSubmit" method="POST"> 
            <v-text-field
                v-model="myForm.email"
                name="email"
                label="Email"
                type="email"
            ></v-text-field>
            <v-text-field
                v-model="myForm.password"
                name="password"
                label="Password"
                type="password"
            ></v-text-field>
            <v-btn type="submit">login</v-btn>
        </v-form>
        <v-btn class="mt-5" @click="schoolLogin">Log with 42</v-btn>
    </v-container>
</template>