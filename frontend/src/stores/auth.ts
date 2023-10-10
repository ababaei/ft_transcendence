import { defineStore, mapStores } from "pinia"

const baseUrl = "api/users"

const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        user: null,
        returnUrl: null
    })
})

export default {
    computed: {
        ...mapStores(useAuthStore)
    }
}