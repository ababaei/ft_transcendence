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

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faUserSecret } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faUserSecret)

const vuetify = createVuetify({
  components,
  directives
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
setMapStoreSuffix('')

app.component("font-awesome-icon", FontAwesomeIcon)
app.use(VueCookies, { expires: '7d'})
app.use(vuetify)
app.use(router)
app.mount('#app')