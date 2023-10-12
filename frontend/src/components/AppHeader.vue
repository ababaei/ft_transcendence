<script lang="ts">
import { defineComponent } from 'vue';

    export default defineComponent ({
        name: "appHeader",
        data() {
            return {
                    profilUser: '' as string,
            }
        },
        computed: {
            currentUser() {
                const user = localStorage.getItem('currentUser')
                console.log(user)
                if(user) {
                    const objUser = JSON.parse(user)
                    return '/profil/' + objUser.id
                }
                return '/login'
            }
        }
    })
</script>

<template>
    <v-app-bar app color="primary" class="px-10" dark>
        <div class="d-flex align-center">
            <RouterLink to="/">
                <h2>ginpgonp</h2>
            </RouterLink>
        </div>
        <v-spacer></v-spacer>

            <RouterLink to="/login"><v-btn color="white">Login</v-btn></RouterLink>
            <!-- <RouterLink to="/profil"><v-btn color="white">Profil</v-btn></RouterLink> -->
            <RouterLink v-bind:to=currentUser><v-btn color="white">Profil</v-btn></RouterLink>
            <RouterLink to="/chat"><v-btn color="white">Chat</v-btn></RouterLink>
            <RouterLink to="/pong"><v-btn color="white">Pong</v-btn></RouterLink>
        <!-- <RouterLink to="/pong">Pong</RouterLink> -->
    </v-app-bar>
</template>