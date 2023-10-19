<script lang="ts">
  import loginForm from "@/components/loginForm.vue";

  export default {
    components: {
      loginForm
    }
  }

</script>

<template>
  <v-main class="notLogged">
    <loginForm />
  </v-main>
</template>

<style>

.notLogged {
  background: linear-gradient(to bottom right, rgb(34, 24, 36), rgb(178, 143, 206))
}
</style>
  <!-- <v-responsive>
    <v-container fluid>  
      <v-main class='w-100'>
        <v-row class="w-100">
          <v-col cols="4" offset="4">
            <loginForm />
          </v-col>
        </v-row>
      </v-main>
    </v-container>
  </v-responsive>
</template> -->
