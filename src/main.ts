import './assets/main.css'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { useHighlightStore } from './state'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
export const store = useHighlightStore()
app.mount('#app')
