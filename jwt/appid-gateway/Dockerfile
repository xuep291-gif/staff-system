# Appid Gateway - OpenResty Dockerfile
FROM openresty/openresty:alpine

# 安装系统依赖
RUN apk add --no-cache \
    curl \
    openssl \
    luarocks \
    gcc \
    make \
    libc-dev \
    openssl-dev

# 创建应用目录
RUN mkdir -p /app/lua /app/conf /app/logs

# 复制配置文件
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf
COPY lua/ /app/lua/
COPY conf/ /app/conf/

# 安装 Lua 依赖
RUN luarocks install lua-resty-http && \
    luarocks install lua-resty-redis && \
    luarocks install lua-resty-string && \
    luarocks install lua-resty-openssl && \
    luarocks install lua-cjson

# 设置权限
RUN chmod -R 755 /app

# 暴露端口
EXPOSE 8081

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/health || exit 1

# 启动 OpenResty
CMD ["/usr/local/openresty/bin/openresty", "-g", "daemon off;"]
