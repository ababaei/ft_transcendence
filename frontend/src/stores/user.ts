import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';
import { RouterView, routeLocationKey, useRoute } from 'vue-router';
import router from '@/router';
// import App from './App.vue'

interface User {
  id: number,
  username: string,
}

export interface Userstate {
  users: User[],
  currentUser: null | User,
  userToken: null | string,
  loading: boolean,
  error: null | string,
}

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    users: [],
    currentUser: null,
    userToken: null,
    loading: false,
    error: null
  }),
  getters: {
    getUserById: (state) => {
      return (userId: number) => state.users.filter((user: User) => user.id === userId )
    },
    isAuthenticate() {
      if (this.currentUser) {
        return true;
      } else {
        return false;
      }
    }
  },
  actions: {
    async fetchUsers(this: Userstate) {
      this.users = [];
      this.loading = true;
      
      try {
        this.users = await axios.get('api/users')
      } catch(error: any) {
        this.error = error
      } finally {
        this.loading = false
      }
    },

    async fetchUser(this: Userstate, id: string) {
      this.currentUser = null;
      this.loading = true;
      
      console.log(id);
      try {
        this.currentUser = await axios.get('api/users/' + id)
      } catch(error: any) {
        this.error = error
      } finally {
        this.loading = false
      }
      console.log(this.currentUser)
    },

    logIn(this: Userstate, cookie: any) {
      const userExist = this.users.filter((user) => user.id === cookie.user.id)
      const userStore = useUserStore();
      if (userExist) {
        this.currentUser = cookie.user;
        this.userToken = cookie.token;
      } else {
        userStore.fetchUsers();
        this.currentUser = cookie.user;
        this.userToken = cookie.token;
      }
    },
    
    logOut(this: Userstate) {
      this.currentUser = null;
      this.userToken = null;
      router.push("/login");
    }
  }
})
