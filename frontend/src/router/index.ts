import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginView.vue'
import Profil from '@/views/ProfilView.vue'
import Chat from '@/views/NewChatView.vue'
import Pong from '@/views/PongView.vue'
import Private from '@/views/PrivateGame.vue'
import NotFound from '@/views/NotFound.vue'
// import Pong from '../views/PongView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'connexion',
      component: Login,
      alias: '/',
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
    {
      path: '/private/:gameID',
      name: 'private',
      component: Private,
      meta: { requiresAuth: true}
    },
    {
      path: '/:pathMatch(.*)*',
      component: NotFound
    },
  ]
});

router.beforeEach((to, from, next) => {
  const isAuth = localStorage.getItem('isAuthenticated');
  // console.log('beforeeach isAuth: ', isAuth);

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (isAuth === 'false') {
      // console.log('GET REDIREKTED BITCH')
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