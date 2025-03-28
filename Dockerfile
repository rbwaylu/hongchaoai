# 构建阶段：使用本地 Ubuntu 镜像安装 Node.js 并构建前端
FROM my_local_ubuntu:latest AS build-stage

# 更新包列表并安装 curl 和 Node.js 18
RUN apt-get update && apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 并安装所有依赖
COPY package*.json ./
RUN npm ci

# 复制项目文件并构建
COPY . .
RUN npm run build

# 生产阶段：使用本地 Nginx 镜像部署静态文件
FROM my_local_nginx:alpine AS production-stage

# 从构建阶段复制构建结果到 Nginx 的静态文件目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 创建证书目录（用于挂载 Let's Encrypt 证书）
RUN mkdir -p /etc/nginx/ssl

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口（HTTP 和 HTTPS）
EXPOSE 80
EXPOSE 443

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]