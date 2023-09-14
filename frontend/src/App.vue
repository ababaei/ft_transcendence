<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent ({
  name: "app",
  });
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Connexion</RouterLink>
      <RouterLink to="/profil">Profil</RouterLink>
      <RouterLink to="/chat">Chat</RouterLink>
      <RouterLink to="/pong">Pong</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped></style>