// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        logLevel: 'debug', // 启用详细的代理日志
        onProxyReq: (proxyReq, req, res) => {
          console.log(`Proxying request: ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log(`Received response: ${proxyRes.statusCode} from ${req.url}`);
        },
        onError: (err, req, res) => {
          console.error(`Proxy error: ${err.message}`);
        },
      },
      '/auth': {
        target: 'https://auth.deepseek.com',
        changeOrigin: true,
        pathRewrite: { '^/auth': '' },
        logLevel: 'debug', // 启用详细的代理日志
      },
    },
    client: {
      logging: 'verbose', // 启用详细的客户端日志
      overlay: {
        warnings: true,
        errors: true,
      },
    },
    hot: true, // 启用热模块替换
    open: true, // 启动后自动打开浏览器
    port: 8080, // 指定开发服务器端口
    https: false, // 是否启用 HTTPS
  },
  configureWebpack: {
    devtool: 'source-map', // 启用源映射以便更好地调试
  },
  lintOnSave: process.env.NODE_ENV === 'development', // 仅在开发模式下启用 lint
};