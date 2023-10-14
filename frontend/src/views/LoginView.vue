<script lang="ts">
  import loginForm from "@/components/loginForm.vue";

  export default {
    components: {
      loginForm
    }
  }

</script>

<template>
  <v-main>
    <loginForm />
  </v-main>
</template>

<style>

.v-main {
  background: linear-gradient(to bottom right, rgb(34, 24, 36), rgb(178, 143, 206))
}
</style>