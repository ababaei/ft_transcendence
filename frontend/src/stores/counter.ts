import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios';

interface User {
  id: number,
  username: string,
}

interface Userstate {
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
      }  
    }
  }
})
