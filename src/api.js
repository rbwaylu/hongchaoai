import axios from 'axios';

// 从环境变量中获取 baseURL，默认为 ngrok 地址
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL || 'https://c008-27-38-198-65.ngrok-free.app';

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    // 在请求发送之前做一些处理，比如添加 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 对响应数据做一些处理
    return response;
  },
  (error) => {
    // 统一处理错误
    console.error('API 请求出错:', error);
    return Promise.reject(error);
  }
);

export default axios;