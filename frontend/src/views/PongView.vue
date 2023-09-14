<template>
    <main>
        <v-btn color="success" v-on:click="load">Trouver une partie</v-btn>
        <div :class="{ invisible: !loading }" id="loading">
          <iframe src="https://giphy.com/embed/3o7bu3XilJ5BOiSGic" width="30" height="30" frameBorder="0" class="gif"></iframe>
        </div>
    </main>
  </template>
  
  <script lang="ts">
  import { RouterLink, RouterView } from 'vue-router'
  import { defineComponent } from 'vue';
  import { io } from 'socket.io-client';
  
  export default defineComponent({
    name: 'PongView',
    components: ({}),
    data() {
      return {
        socket: io('http://localhost:3000'),
        key: 'aucune',
        context: {},
        position: {
          x: 0,
          y: 0
        },
        loading: false
      }
    },
    mounted() {
      window.addEventListener('keydown', this.KeypressEvt);
      this.socket.on('KeyPressed', (data: string) => {
        this.key = data;
      })
    },
    methods: {
      KeypressEvt(event: KeyboardEvent) {
        this.socket.emit('keypress', event.key);
      },
      load() {
        if (this.loading == false)
          this.loading = true;
        else
          this.loading = false;
      }
    }
  })
  </script>
