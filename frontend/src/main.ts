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

const app = createApp(App)

setMapStoreSuffix('')

app.use(VueCookies, { expires: '7d'})
app.use(vuetify)
app.use(router).use(createPinia())

app.mount('#app')