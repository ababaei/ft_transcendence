import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import Login from '@/views/LoginView.vue'
import Profil from '@/views/ProfilView.vue'
import Chat from '@/views/NewChatView.vue'
import Pong from '@/views/PongView.vue'
// import Pong from '../views/PongView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   name: 'app',
    //   component: App
    // },
    {
      path: '/login',
      name: 'connexion',
      component: Login,
      alias: '/'
    },
    {
      path: '/profil/:id',
      name: 'profil',
      component: Profil,
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat,
      meta: { requiresAuth: true }
    },
    {
      path: '/pong',
      name: 'pong',
      component: Pong,
      meta: { requiresAuth: true }
    },
  ]
});

router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('isAuthenticated');
  console.log('beforeeach isAuth: ', isAuth);

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (isAuth === 'false') {
      next({
        path: '/login',
        params: { nextUrl: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
})

export default router