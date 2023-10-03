import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

interface User {
  id: number,
  username: string,
}

export interface Userstate {
  users: null | User[],
  currentUser: null | User,
  loading: boolean,
  error: null | string,
}

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),
  getters: {
    getUserById: (state) => {
      return (userId: number) => state.users.filter((user: User) => user.id === userId )
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
    async fetchUser(this: Userstate, id: number) {
      this.currentUser = null;
      this.loading = true;

      try {
        this.currentUser = await axios.get('api/users/' + id)
      } catch(error: any) {
        this.error = error
      } finally {
        this.loading = false
      }
    }
  }
})
