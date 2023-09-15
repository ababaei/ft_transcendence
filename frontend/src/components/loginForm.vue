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
    </v-container>
</template>