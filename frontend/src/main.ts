import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { createPinia, setMapStoreSuffix } from 'pinia'
import router from './router'
import axios from 'axios';

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import VueCookies from 'vue-cookies';

const vuetify = createVuetify({
  components,
  directives
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
setMapStoreSuffix('')

app.use(VueCookies, { expires: '7d'})
app.use(vuetify)
app.use(router)

app.mount('#app')