import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginView.vue'
import Profil from '@/views/ProfilView.vue'
import Chat from '@/views/ChatView.vue'
import Pong from '@/views/PongView.vue'
import App from '@/App.vue'
// import Pong from '../views/PongView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'app',
      component: App
    },
    {
      path: '/login',
      name: 'connexion',
      component: Login
    },
    {
      path: '/profil/:id',
      name: 'profil',
      component: Profil
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat
    },
    {
      path: '/pong',
      name: 'pong',
      component: Pong
    },
  ]
})

export default router
