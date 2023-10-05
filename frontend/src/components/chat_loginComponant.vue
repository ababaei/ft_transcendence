<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';

    export default defineComponent ({
        name: "chat_BetaloginForm",
        data() {
            return {
                nameForm: {
                    name: "",
                },
            }
        },
        methods: {
            handleSubmit() {
                //do something with axios here i think
                axios.post('/api/chat/setUsername', {
                    username: this.nameForm.name,
                })
                .then((response) => {console.log("Response: ", response)})
                .catch((error) => {console.error('Error: ', error)})
                console.log(this.nameForm);
            }
        }
    })
</script>

<template>
    <v-container class="pt-10">
        <v-form @submit.prevent="handleSubmit" method="POST"> 
            <v-text-field
                v-model="nameForm.name"
                name="name"
                label="Name"
            ></v-text-field>
            <v-btn type="submit">login</v-btn>
        </v-form>
    </v-container>
</template>