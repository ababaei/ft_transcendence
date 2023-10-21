<script lang="ts">
import { defineComponent } from 'vue';

    export default defineComponent ({
        name: "appHeader",
        computed: {
            currentUser() {
                const user = localStorage.getItem('currentUser')
                // console.log('APPHEADER', user)
                if(user) {
                    const objUser = JSON.parse(user)
                    return '/profil/' + objUser.id
                }
                return '/login'
            },
        }
    })
</script>

<template>
    <v-app-bar app class="px-10" dark>
        <div class="d-flex align-center">
            <RouterLink to="/">
                <h2>ginpgonp</h2>e .
            </RouterLink>
        </div>
        <v-spacer></v-spacer>
            <RouterLink v-bind:to=currentUser><v-btn color="white">Profil</v-btn></RouterLink>
            <RouterLink to="/chat"><v-btn color="white">Chat</v-btn></RouterLink>
            <RouterLink to="/pong"><v-btn color="white">Pong</v-btn></RouterLink>
    </v-app-bar>
</template>

<style>
header {
    background-color: rgb(255, 255, 255) !important;
}
</style>