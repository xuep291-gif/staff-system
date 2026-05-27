# Appid-Gateway 配置说明

本文档详细说明如何为指定应用配置 appid-gateway。

## 目录

- [配置文件概述](#配置文件概述)
- [配置参数说明](#配置参数说明)
- [配置示例](#配置示例)
- [管理 API 使用](#管理-api-使用)
- [Java 后端集成](#java-后端集成)
- [常见问题](#常见问题)

---

## 配置文件概述

配置文件位于 `conf/appid-config.json`，采用 JSON 格式。每个应用配置包含以下信息：

```json
{
  "应用标识": {
    "appid": "应用标识",
    "secret": "密钥",
    "validity_days": 有效天数,
    "routes": ["路由前缀列表"]
  }
}
```

---

## 配置参数说明

### appid（必填）

- **类型**: String
- **说明**: 应用唯一标识符
- **格式**: 建议使用小写字母、数字、连字符，如 `app-a`, `school-001`, `tenant-prod`
- **用途**:
  - 用于生成 X-APPID-KEY
  - 后端通过 `JWTKit.getAppid()` 获取此值进行数据隔离

### secret（必填）

- **类型**: String
- **说明**: 应用密钥，用于签名 X-APPID-KEY
- **安全要求**:
  - 建议长度至少 16 个字符
  - 包含大小写字母、数字、特殊字符
  - 定期轮换更新
- **生成方式**:
  ```bash
  # 使用 openssl 生成随机密钥
  openssl rand -base64 32

  # 或使用 uuid
  uuidgen | tr -d '-'
  ```

### validity_days（可选）

- **类型**: Integer
- **说明**: X-APPID-KEY 的有效期（天）
- **默认值**: 365（一年）
- **特殊值**:
  - `0` 或不设置: 永久有效（仅用于 `root` 和 `none`）
- **建议**:
  - 生产环境: 30-90 天
  - 开发环境: 365 天
  - 测试环境: 7-30 天

### routes（可选）

- **类型**: Array[String]
- **说明**: 路由前缀列表，匹配这些前缀时使用对应的 appid
- **用途**:
  - 一个 appid 可以关联多个路由前缀
  - 支持别名配置
- **示例**:
  ```json
  "routes": ["app-a", "tenant-a", "client-a"]
  ```
  这样 `/app-a/api/...`、`/tenant-a/api/...`、`/client-a/api/...` 都会使用同一个 appid

---

## 配置示例

### 示例 1: 基础应用配置

```json
{
  "app-a": {
    "appid": "app-a",
    "secret": "app-a-secret-key-12345",
    "validity_days": 365,
    "routes": ["app-a"]
  }
}
```

**说明**:
- 应用标识: `app-a`
- 路由前缀: `/app-a/*`
- 有效期: 1 年

**使用方式**:
```bash
# 访问 app-a 的 API
curl http://gateway:8081/app-a/api/users

# 后端获取 appid
String appid = JWTKit.getAppid(); // 返回 "app-a"
```

---

### 示例 2: 多租户配置

```json
{
  "school-001": {
    "appid": "school-001",
    "secret": "school-001-secret-key-abcde12345",
    "validity_days": 90,
    "routes": ["school-001", "s001"]
  },
  "school-002": {
    "appid": "school-002",
    "secret": "school-002-secret-key-fghij67890",
    "validity_days": 90,
    "routes": ["school-002", "s002"]
  }
}
```

**说明**:
- 两个学校租户，各自独立的数据隔离
- 支持简短路由别名（`s001`, `s002`）
- 90 天有效期（适合学期制）

**使用方式**:
```bash
# 学校 001 的 API
curl http://gateway:8081/school-001/api/students
curl http://gateway:8081/s001/api/students  # 使用别名

# 学校 002 的 API
curl http://gateway:8081/school-002/api/students
```

---

### 示例 3: 环境隔离配置

```json
{
  "myapp-prod": {
    "appid": "myapp-prod",
    "secret": "prod-secret-key-change-regularly-xyz",
    "validity_days": 30,
    "routes": ["myapp", "prod"]
  },
  "myapp-staging": {
    "appid": "myapp-staging",
    "secret": "staging-secret-key-test-abc",
    "validity_days": 90,
    "routes": ["staging", "stage"]
  },
  "myapp-dev": {
    "appid": "myapp-dev",
    "secret": "dev-secret-key-local-def",
    "validity_days": 365,
    "routes": ["dev", "local"]
  }
}
```

**说明**:
- 同一应用的不同环境使用不同的 appid
- 生产环境密钥更强，有效期更短
- 开发环境有效期较长，方便开发

---

### 示例 4: 永久 Appid（开发/管理）

```json
{
  "root": {
    "appid": "root",
    "secret": "root-admin-secret-key",
    "validity_days": 0,
    "routes": ["root", "admin"]
  },
  "none": {
    "appid": "none",
    "secret": "none-public-secret-key",
    "validity_days": 0,
    "routes": ["none", "public"]
  }
}
```

**说明**:
- `root`: 管理员/超级用户，返回 `null` appid（无数据过滤）
- `none`: 公共访问，返回 `null` appid（无数据过滤）
- 仅用于开发/测试环境，生产环境谨慎使用

---

### 示例 5: 完整生产配置

```json
{
  "root": {
    "appid": "root",
    "secret": "CHANGE-THIS-ROOT-SECRET-IN-PRODUCTION",
    "validity_days": 0,
    "routes": ["root", "admin"]
  },
  "none": {
    "appid": "none",
    "secret": "CHANGE-THIS-NONE-SECRET-IN-PRODUCTION",
    "validity_days": 0,
    "routes": ["none", "public"]
  },
  "tenant-prod-001": {
    "appid": "tenant-prod-001",
    "secret": "t-p1-k8J9mN2pQ5rS8tV1wY4zX7",
    "validity_days": 60,
    "routes": ["tenant-prod-001", "tp1"]
  },
  "tenant-prod-002": {
    "appid": "tenant-prod-002",
    "secret": "t-p2-b3N6mP9qR2tU5wY8zX1vA4",
    "validity_days": 60,
    "routes": ["tenant-prod-002", "tp2"]
  },
  "app-frontend": {
    "appid": "app-frontend",
    "secret": "fe-c4D7gF0jM3pS6vV9yY2bB5",
    "validity_days": 90,
    "routes": ["frontend", "web", "www"]
  },
  "app-mobile": {
    "appid": "app-mobile",
    "secret": "mb-e5G8hJ1kN4qT7wZ0zC3cD6",
    "validity_days": 90,
    "routes": ["mobile", "api", "m"]
  }
}
```

---

## 管理 API 使用

### 获取所有 Appid 配置

```bash
curl http://localhost:8081/admin/appids
```

**响应示例**:
```json
[
  {
    "appid": "app-a",
    "validity_days": 365,
    "routes": ["app-a"],
    "is_permanent": false
  }
]
```

### 添加新 Appid

```bash
curl -X POST http://localhost:8081/admin/appids \
  -H "Content-Type: application/json" \
  -d '{
    "appid": "app-new",
    "secret": "new-secret-key-12345",
    "validity_days": 30
  }'
```

### 删除 Appid

```bash
curl -X DELETE "http://localhost:8081/admin/appids?appid=app-new"
```

### 重载配置

```bash
# 方式1: 使用 Makefile
make reload

# 方式2: 直接执行
docker-compose exec appid-gateway \
  /usr/local/openresty/bin/openresty -s reload
```

---

## Java 后端集成

### application.yml 配置

```yaml
jwt:
  appid-key:
    configs:
      app-a:
        secret: "app-a-secret-key-12345"
        validity-days: 365
      app-b:
        secret: "app-b-secret-key-67890"
        validity-days: 365
      root:
        secret: "root-secret-key"
      none:
        secret: "none-secret-key"
```

### Java 代码使用

```java
// 获取当前请求的 appid
String appid = JWTKit.getAppid();

// 使用 appid 进行数据过滤
@Service
public class UserService {
    public List<User> listUsers() {
        String appid = JWTKit.getAppid();
        if (appid != null) {
            return userRepository.findByAppid(appid);
        }
        // root/none appid 返回 null，返回所有数据
        return userRepository.findAll();
    }
}
```

### 数据隔离示例

```java
// MyBatis-Plus 示例
@Service
public class OrderService {
    public List<Order> getOrders() {
        String appid = JWTKit.getAppid();
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        if (appid != null) {
            wrapper.eq(Order::getAppid, appid);
        }
        return orderMapper.selectList(wrapper);
    }
}

// JPA 示例
@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("SELECT u FROM User u WHERE (:appid IS NULL OR u.appid = :appid)")
    List<User> findByAppid(@Param("appid") String appid);
}
```

---

## 常见问题

### Q1: 如何生成安全的密钥？

```bash
# 方式1: OpenSSL（推荐）
openssl rand -base64 32

# 方式2: UUID
uuidgen | tr -d '-'

# 方式3: 随机字符串
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

### Q2: 密钥泄露怎么办？

1. **立即更换密钥**:
   ```bash
   # 生成新密钥
   NEW_SECRET=$(openssl rand -base64 32)

   # 更新网关配置
   curl -X POST http://localhost:8081/admin/appids \
     -H "Content-Type: application/json" \
     -d "{\"appid\":\"app-a\",\"secret\":\"$NEW_SECRET\",\"validity_days\":30}"

   # 重载配置
   make reload
   ```

2. **同步更新 Java 后端配置**
3. **监控异常请求**

### Q3: 如何验证 X-APPID-KEY 是否正确？

```bash
# 查看注入的 header
curl -v http://localhost:8081/app-a/api/health 2>&1 | grep -i "x-appid-key"

# 使用 Java CLI 工具验证
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli app-a
```

### Q4: 路由匹配优先级？

- 路由按前缀匹配，最长前缀优先
- 未匹配路由的请求直接转发，不注入 X-APPID-KEY
- 示例:
  - `/app-a/api/health` → 匹配 `app-a`
  - `/health` → 不匹配，直接转发

### Q5: 如何支持多级路由？

配置 `routes` 数组即可：

```json
{
  "app-a": {
    "appid": "app-a",
    "secret": "...",
    "validity_days": 365,
    "routes": ["app-a", "api/app-a", "v1/app-a"]
  }
}
```

使用:
```bash
curl http://gateway:8081/app-a/api/users
curl http://gateway:8081/api/app-a/users
curl http://gateway:8081/v1/app-a/users
```

### Q6: 生产环境安全建议？

1. **密钥管理**:
   - 使用密钥管理服务（如 HashiCorp Vault）
   - 定期轮换密钥（30-90 天）
   - 不同环境使用不同密钥

2. **访问控制**:
   - 限制管理 API 访问（仅内网）
   - 启用 HTTPS/TLS
   - 配置防火墙规则

3. **监控审计**:
   - 记录所有访问日志
   - 监控异常请求
   - 定期审计 appid 使用情况

4. **网络隔离**:
   - 网关部署在 DMZ
   - 后端服务在内网
   - 使用 VPC 网络隔离

---

## 配置检查清单

部署前请确认：

- [ ] 所有 appid 都配置了强密钥
- [ ] 生产环境密钥与开发环境不同
- [ ] validity_days 设置合理（生产 30-90 天）
- [ ] routes 配置正确，无冲突
- [ ] Java 后端配置同步更新
- [ ] 管理 API 访问已限制
- [ ] 日志监控已配置
- [ ] 密钥轮换计划已制定

---

## 参考资源

- [README.md](./README.md) - 项目总体说明
- [AppidKeyResolver.java](../src/main/java/com/jfeat/am/core/jwt/AppidKeyResolver.java) - Java 实现
- [JWTKit.java](../src/main/java/com/jfeat/am/core/jwt/JWTKit.java) - 后端集成
- [OpenResty 文档](https://openresty.org/)
