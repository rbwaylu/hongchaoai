module.exports = {
  transpileDependencies: [], // 显式定义为空数组，避免 Babel 插件报错
  devServer: {
    allowedHosts: "all", // 允许所有外部访问，包括 ngrok
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 目标 API 地址
        changeOrigin: true, // 允许跨域
        pathRewrite: { '^/api': '' }, // 去掉 /api 前缀
        logLevel: 'debug', // 启用详细日志
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
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: { '^/auth': '' },
        logLevel: 'debug',
      },
    },
    client: {
      webSocketURL: 'wss://1cdb-27-38-198-65.ngrok-free.app/ws', // 强制使用安全 WebSocket
      logging: 'verbose',
      overlay: {
        warnings: true,
        errors: true,
      },
    },
    hot: false, // 关闭 HMR
    liveReload: true, // 启用 Live Reload
    open: true, // 启动后自动打开浏览器
    port: 8080, // 开发服务器端口
    https: false, // 本地不开启 HTTPS
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 生产环境关闭 source map 提升加载速度
      config.devtool = false;
      // 引入 gzip 压缩插件以减少传输资源体积
      const CompressionWebpackPlugin = require('compression-webpack-plugin');
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 10240,
          minRatio: 0.8,
        })
      );
      // 启用 SplitChunks 优化，减少重复代码加载
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendors: {
              name: 'chunk-vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              chunks: 'initial'
            },
            common: {
              name: 'chunk-common',
              minChunks: 2,
              priority: -20,
              chunks: 'initial',
              reuseExistingChunk: true
            }
          }
        },
        runtimeChunk: 'single'
      };
    } else {
      // 开发环境保留 source map 便于调试
      config.devtool = 'source-map';
    }
  },
  lintOnSave: process.env.NODE_ENV === 'development',
  chainWebpack: config => {
    // 图片资源处理
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        options = options || {};
        options.limit = 10000;
        return options;
      });
    // 判断 preload 插件是否存在后再进行配置
    if (config.plugins.has('preload')) {
      config.plugin('preload').tap(args => {
        args[0].fileBlacklist = args[0].fileBlacklist || [];
        args[0].fileBlacklist.push(/\.map$/, /hot-update\.js$/);
        return args;
      });
    }
  },
};