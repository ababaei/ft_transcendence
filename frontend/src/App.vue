<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent ({
  name: "app",
  });
</script>

<template>
  <header>
    <nav>
      <v-btn color="white">TOTO</v-btn>
      <RouterLink to="/">Connexion</RouterLink>
      <RouterLink to="/profil">Profil</RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
      <!-- <RouterLink to="/pong">Pong</RouterLink> -->
    </nav>
  </header>

  <RouterView />
</template>

<style scoped></style>