import { createApp } from 'vue'; // 引入 Vue 的 createApp 方法
import App from './App.vue';     // 引入根组件 App.vue
import { ElButton, ElInput, ElMessage } from 'element-plus'; // 按需引入组件
import 'element-plus/dist/index.css';   // 引入 Element Plus 的样式

const app = createApp(App); // 创建 Vue 应用实例

// 按需注册组件
app.component(ElButton.name, ElButton);
app.component(ElInput.name, ElInput);

// 挂载全局方法
app.config.globalProperties.$message = ElMessage;

app.mount('#app'); // 将应用挂载到 DOM 中的 #app 元素