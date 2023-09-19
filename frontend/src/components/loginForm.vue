<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

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
                axios.get('/api/auth/42', {
                    withCredentials: true
                })
                .then((res) => {console.log("Response: ", res.data)})
                .catch((err) => {console.error('Error: ', err)})
            }
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