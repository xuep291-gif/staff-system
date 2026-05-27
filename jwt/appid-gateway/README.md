# Appid Gateway - OpenResty

基于 OpenResty + Lua 的 API 网关，用于业务层数据隔离。通过路由前缀转发请求并注入 `X-APPID-KEY` header，实现多租户数据隔离。

## 功能特性

- ✅ **路由前缀转发**: `/app-a/api/health` → `/api/health`
- ✅ **X-APPID-KEY 注入**: 自动生成并注入认证头
- ✅ **动态配置**: 支持 JSON 配置文件
- ✅ **高性能**: 基于 OpenResty，单机可支撑 10万+ QPS
- ✅ **热重载**: `nginx -s reload` 无缝更新配置
- ✅ **健康检查**: `/health` 端点
- ✅ **管理 API**: `/admin/appids` 管理 appid 配置

## 目录结构

```
appid-gateway/
├── conf/
│   ├── appid-config.example.json  # 配置模板
│   └── appid-config.json          # Appid 配置文件（需创建）
├── lua/
│   ├── appid_config.lua           # Appid 配置管理模块
│   └── proxy.lua                  # 代理和 X-APPID-KEY 生成模块
├── logs/                          # 日志目录
├── nginx.conf                     # Nginx 配置文件
├── Dockerfile                     # Docker 镜像构建
├── docker-compose.yml             # Docker Compose 配置
├── Makefile                       # 项目管理命令
├── test-gateway.sh                # 测试脚本
├── CONFIG_GUIDE.md                # 配置指南
└── README.md                      # 本文档
```

## 快速开始

### 1. 使用 Makefile（推荐）

```bash
# 查看所有可用命令
make help

# 初始化配置文件
make init-config

# 编辑配置文件
vim conf/appid-config.json

# 启动服务
make up

# 查看日志
make logs
```

### 2. 使用 Docker Compose

```bash
# 构建镜像
docker build -t appid-gateway:latest .

# 运行容器
docker run -d \
  -p 8081:8081 \
  -v $(pwd)/nginx.conf:/usr/local/openresty/nginx/conf/nginx.conf:ro \
  -v $(pwd)/lua:/app/lua:ro \
  -v $(pwd)/conf:/app/conf:ro \
  -v $(pwd)/logs:/app/logs \
  --name appid-gateway \
  appid-gateway:latest
```

## 配置说明

> 📖 **详细配置指南**: 查看 [CONFIG_GUIDE.md](./CONFIG_GUIDE.md) 了解完整的配置说明、示例和最佳实践。

### Appid 配置文件 (`conf/appid-config.json`)

```json
{
  "app-a": {
    "appid": "app-a",
    "secret": "app-a-secret-key-12345",
    "validity_days": 365,
    "routes": ["app-a", "tenant-a"]
  }
}
```

**字段说明**:
- `appid`: 应用标识（必填）
- `secret`: 密钥（必填，建议使用强密码）
- `validity_days`: 有效期（天），0 表示永久有效
- `routes`: 路由前缀列表，匹配这些前缀时使用对应的 appid

### 路由规则

| 请求路径 | 转发路径 | X-APPID-KEY |
|---------|---------|-------------|
| `/app-a/api/health` | `/api/health` | app-a 的 key |
| `/app-b/api/users` | `/api/users` | app-b 的 key |
| `/health` | `/health` | 无 |

## API 使用

### 健康检查

```bash
curl http://localhost:8081/health
# 返回: Appid Gateway is running
```

### 路由转发

```bash
# 访问 app-a 的 API
curl http://localhost:8081/app-a/api/health

# 访问 app-b 的 API
curl http://localhost:8081/app-b/api/users

# 查看注入的 header
curl -v http://localhost:8081/app-a/api/health
```

### 管理 API

```bash
# 获取所有 appid 配置
curl http://localhost:8081/admin/appids

# 添加 appid 配置
curl -X POST http://localhost:8081/admin/appids \
  -H "Content-Type: application/json" \
  -d '{
    "appid": "app-c",
    "secret": "app-c-secret",
    "validity_days": 30
  }'

# 删除 appid 配置
curl -X DELETE "http://localhost:8081/admin/appids?appid=app-c"
```

## X-APPID-KEY 格式

```
{appid_hash}.{timestamp}.{signature}
```

- **appid_hash**: HMAC-SHA256(appid, 固定派生密钥) 的前 16 个字符
- **timestamp**: 时间戳（毫秒）
- **signature**: HMAC-SHA256(secret, "appid.timestamp")

**注意**: 固定派生密钥必须与 Java 代码 (`AppidKeyResolver.java`) 保持一致。

## 与后端集成

后端服务通过 `JWTKit.getAppid()` 获取 appid 进行数据隔离：

```java
// 获取当前请求的 appid
String appid = JWTKit.getAppid();

// 使用 appid 进行数据过滤
List<User> users = userService.listByAppid(appid);
```

## 日志

日志文件位于 `logs/` 目录：

- `access.log`: 访问日志
- `error.log`: 错误日志

查看实时日志：

```bash
tail -f logs/access.log
tail -f logs/error.log
```

## 性能调优

### Nginx 配置

```nginx
# 调整工作进程数
worker_processes auto;

# 调整连接数
events {
    worker_connections 4096;
}

# 启用 keepalive
upstream backend {
    server 127.0.0.1:8080;
    keepalive 64;
}
```

### Lua 配置

```lua
-- 调整共享内存大小
lua_shared_dict appid_cache 50m;
lua_shared_dict appid_locks 5m;

-- 启用代码缓存
lua_code_cache on;
```

## 安全建议

1. **密钥管理**: 使用强密码，定期轮换密钥
2. **HTTPS**: 生产环境使用 SSL/TLS
3. **访问控制**: 限制管理 API 的访问
4. **日志审计**: 记录所有访问日志
5. **限流**: 配置请求限流防止 DDoS

## 故障排查

### 无法启动

```bash
# 检查配置文件
docker-compose config

# 查看日志
docker-compose logs appid-gateway
```

### X-APPID-KEY 无效

```bash
# 检查 appid 配置
curl http://localhost:8081/admin/appids

# 查看错误日志
tail -f logs/error.log
```

### 后端无法获取 appid

1. 确认 X-APPID-KEY 已注入：`curl -v http://localhost:8081/app-a/api/health`
2. 检查后端 `AppidKeyResolver` 配置
3. 确认派生密钥一致

## 参考资料

- [配置指南](./CONFIG_GUIDE.md) - 详细的配置说明和示例
- [OpenResty 官方文档](https://openresty.org/)
- [lua-resty-http](https://github.com/ledgetech/lua-resty-http)
- [JWT 核心模块](../src/main/java/com/jfeat/am/core/jwt/)

## 许可证

MIT License
