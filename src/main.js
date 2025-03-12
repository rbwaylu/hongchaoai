import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'  // 引入 Element Plus
import 'element-plus/dist/index.css'  // 引入 Element Plus 的样式

const app = createApp(App)
app.use(ElementPlus)  // 使用 Element Plus
app.mount('#app')