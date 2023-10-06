<script lang="ts">
  import { defineComponent } from 'vue';
  import appHeader from '@/components/AppHeader.vue'

  export default defineComponent ({
    components: {
      appHeader
    },
    name: "app",
  });
</script>

<template>
  <v-app>
    <appHeader></appHeader>
    <RouterView />
  </v-app>
</template>

<!-- <style scoped></style> -->