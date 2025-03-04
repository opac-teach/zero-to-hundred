
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast, { type PluginOptions, type POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import './styles/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// Toast configuration
const toastOptions: PluginOptions = {
  position: 'top-right' as POSITION,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
}

app.use(createPinia())
app.use(router)
app.use(Toast, toastOptions)

app.mount('#app')
