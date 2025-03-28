import { createRouter, createWebHistory } from 'vue-router';

// 路由采用动态导入并启用预加载
const Home = () => import(/* webpackChunkName: "home", webpackPrefetch: true */ '@/views/Home.vue');
const About = () => import(/* webpackChunkName: "about", webpackPrefetch: true */ '@/views/About.vue');
const Search = () => import(/* webpackChunkName: "search", webpackPrefetch: true */ '@/views/Search.vue');

const routes = [
  { path: '/', component: Home },    // 首页
  { path: '/about', component: About },  // 关于页面
  { path: '/search', component: Search }, // 搜索页面
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 页面切换时始终回到顶部
  scrollBehavior() {
    return { top: 0 };
  }
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 此处可以添加权限检查逻辑
  next();
});

export default router;
