import { createRouter, createWebHistory } from 'vue-router';

// 动态导入组件
const Home = () => import(/* webpackChunkName: "home" */ '@/views/Home.vue');
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');
const Search = () => import(/* webpackChunkName: "search" */ '@/views/Search.vue');

const routes = [
  { path: '/', component: Home }, // 首页
  { path: '/about', component: About }, // 关于页面
  { path: '/search', component: Search }, // 搜索页面
];

const router = createRouter({
  history: createWebHistory(), // 使用 HTML5 历史模式
  routes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 在这里可以添加权限检查逻辑
  next();
});

export default router;