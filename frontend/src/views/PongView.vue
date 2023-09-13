<!-- <template>
    <main>
        <h2>Key pressed :</h2>
        <h3>{{ key }}</h3>
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
        }
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
      }
    }
  })
  </script> -->