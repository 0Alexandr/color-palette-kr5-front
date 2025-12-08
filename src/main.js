import './assets/main.css' // Подключаем глобальные стили

import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Импортируем роутер

const app = createApp(App)

app.use(router) // Говорим приложению использовать роутер

app.mount('#app')