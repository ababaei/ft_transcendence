<script lang="ts">
  import { defineComponent } from 'vue';
  import appHeader from '@/components/AppHeader.vue'
import { io } from 'socket.io-client';
  import axios from 'axios';

  export default defineComponent ({
    components: {
      appHeader
    },
    name: "app",
    created() {
      const isAuth = localStorage.getItem('isAuthenticated');
      if (!isAuth) {
        localStorage.setItem('isAuthenticated', 'false')
      }
    },

  });
</script>

<template>
  <v-app>
    <appHeader v-show="$route.name == 'profil' || $route.name == 'chat' || $route.name == 'pong' || $route.name == 'private'"></appHeader>
    <RouterView/>
  </v-app>
</template>

<!-- <style scoped></style> -->