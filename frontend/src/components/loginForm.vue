<script lang="ts">
import { defineComponent } from 'vue';

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