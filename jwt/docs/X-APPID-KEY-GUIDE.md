# X-APPID-KEY 功能使用指南

## 概述

X-APPID-KEY 是一种基于 HMAC-SHA256 签名的应用认证机制，允许第三方应用通过在 HTTP Header 中携带 `X-APPID-KEY` 来标识自己的身份。

### 格式

```
X-APPID-KEY: {appid}.{timestamp}.{signature}
```

示例：
```
X-APPID-KEY: school-001.1712345678900.a3f8c2d1e4b5f6a7...
```

---

## 快速开始

### 方式一：使用脚本（推荐，无需编译 jar）

**Linux/macOS:**
```bash
./generate-appid-key.sh <appid> [过期日期|天数]
```

**Windows PowerShell:**
```powershell
.\generate-appid-key.ps1 <appid> [过期日期|天数]
```

**示例：**
```bash
# 指定过期日期
./generate-appid-key.sh xuexi-songto 2027-01-01

# 指定有效天数
./generate-appid-key.sh xuexi-songto 90

# 使用默认 30 天
./generate-appid-key.sh xuexi-songto
```

### 方式二：使用 Java 命令（需要编译 jar）

```bash
# 自动生成密钥 + 配置 + 生成 X-APPID-KEY
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli <appid> [过期日期|天数]
```

**示例：**
```bash
# 指定过期日期
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto 2027-01-01

# 指定有效天数
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto 90

# 使用默认 30 天
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto
```

输出：
```
✓ Appid config added:
    Appid:    xuexi-songto
    Secret:   dGhpc2lzYXV0b2dlbmVyYXRlZHNlY3JldGtleWZvcnlvdQ==
    Validity: 2027-01-01

✓ X-APPID-KEY generated:
    xuexi-songto.1712345678900.a3f8c2d1e4b5f6a7...
```

---

### 1. 配置方式一：application.yml（推荐）

```yaml
jwt:
  appid-key:
    configs:
      school-001:
        secret: "school-001-secret-key"
        validity-days: 30
      school-002:
        secret: "school-002-secret-key"
        expire-date: "2027-01-01"
      school-003:
        secret: "school-003-secret-key"
        # 未指定有效期时使用默认值 30 天
```

**有效期配置说明：**
- `validity-days`: 指定有效天数（如 `30`、`90`）
- `expire-date`: 指定过期日期（格式 `yyyy-MM-dd`，如 `2027-01-01`）
- 两者同时配置时，`expire-date` 优先级更高
- 都不配置时使用默认值 `30` 天

### 2. 配置方式二：使用 CLI 工具

#### 推荐方式：直接模式（自动生成密钥）

```bash
# 方式一：指定过期日期
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto 2027-01-01

# 方式二：指定有效天数
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto 90

# 方式三：使用默认 30 天
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto
```

输出示例：
```
✓ Appid config added:
    Appid:    xuexi-songto
    Secret:   dGhpc2lzYXV0b2dlbmVyYXRlZHNlY3JldGtleWZvcnlvdQ==
    Validity: 2027-01-01

✓ X-APPID-KEY generated:
    xuexi-songto.1712345678900.a3f8c2d1e4b5f6a7...
```

#### 传统方式：交互式命令

```bash
# 启动 CLI 工具
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli

# 添加 appid 配置（secret 可省略，自动生成）
appid-key> add school-001 mySecretKey 30
appid-key> add school-002 30                    # 自动生成密钥

# 生成 X-APPID-KEY（appid 不存在时自动添加）
appid-key> generate school-001

# 验证 Key
appid-key> verify school-001.1712345678900.a3f8c2d1...
```

### 3. 第三方应用使用

第三方应用只需在请求中携带生成的 X-APPID-KEY：

```javascript
// JavaScript/Fetch
fetch('/api/data', {
  headers: {
    'X-APPID-KEY': 'school-001.1712345678900.a3f8c2d1...'
  }
});

// cURL
curl -H "X-APPID-KEY: school-001.1712345678900.a3f8c2d1..." http://your-api/api/data
```

---

## CLI 工具命令

### 直接模式（推荐）

| 命令 | 说明 | 示例 |
|------|------|------|
| `<appid> [expire\|days]` | 自动添加配置并生成 X-APPID-KEY | `xuexi-songto 2027-01-01` |

**参数说明：**
- `expire` - 过期日期，格式 `YYYY-MM-DD`（如 `2027-01-01`）
- `days` - 有效天数（如 `30`、`90`、`365`）
- 省略参数时默认 30 天

### 交互式命令

| 命令 | 说明 | 示例 |
|------|------|------|
| `generate <appid> [expired:DATE]` | 生成 X-APPID-KEY（自动添加不存在的 appid） | `generate school-001` |
| `add <appid> [secret] [days\|expired:DATE]` | 添加配置（secret 可省略，自动生成） | `add school-001 30` |
| `remove <appid>` | 移除配置 | `remove school-001` |
| `list` | 列出所有配置 | `list` |
| `verify <key>` | 验证 Key | `verify school-001.123...` |
| `help` | 显示帮助 | `help` |
| `exit/quit` | 退出程序 | `exit` |

**新增功能说明：**
- **自动生成密钥**：`add` 命令的 `secret` 参数可选，省略时自动生成安全的随机密钥
- **过期日期配置**：支持 `expired:YYYY-MM-DD` 格式指定过期日期（优先级高于天数）
- **智能添加**：`generate` 命令在 appid 不存在时自动添加配置

### 非交互模式

```bash
# 直接模式
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli xuexi-songto 2027-01-01

# 传统命令
java -cp jwt-core.jar com.jfeat.am.core.jwt.AppidKeyCli generate school-001
```

---

## 代码集成

### 获取 AppidKeyResolver

```java
@Autowired
private AppidKeyResolver appidKeyResolver;

// 生成 Key
String key = appidKeyResolver.generateKey("school-001");

// 验证 Key
String appid = appidKeyResolver.resolveAppid(key);

// 添加配置（指定天数）
appidKeyResolver.addConfig("school-001", "secret-key", 30);

// 添加配置（指定过期日期）
appidKeyResolver.addConfig("school-001", "secret-key", "2027-01-01");
```

### JWTKit 自动解析

`JWTKit.getAppid()` 会自动从 `X-APPID-KEY` header 解析 appid：

```java
// 在业务代码中直接使用
String appid = JWTKit.getAppid(); // 自动处理 X-APPID-KEY
```

---

## 配置说明

### application.yml 配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `jwt.appid-key.configs.<appid>.secret` | 指定 appid 的密钥 | 自动生成 |
| `jwt.appid-key.configs.<appid>.validity-days` | 指定 appid 的有效期（天） | `30` |
| `jwt.appid-key.configs.<appid>.expire-date` | 指定 appid 的过期日期（格式 `yyyy-MM-dd`） | - |

**有效期配置优先级：** `expire-date` > `validity-days` > 默认值（30 天）

### CLI 配置参数

| 参数格式 | 说明 | 示例 |
|----------|------|------|
| `[天数]` | 有效天数（数字） | `30`、`90`、`365` |
| `[expired:YYYY-MM-DD]` | 过期日期 | `expired:2027-01-01` |
| `[YYYY-MM-DD]` | 直接模式指定过期日期 | `2027-01-01` |

**注意：** `expired:YYYY-MM-DD` 格式优先级高于天数配置

---

## 安全建议

1. **密钥管理**：
   - 生产环境必须修改默认密钥，建议长度 ≥ 32 字符
   - CLI 自动生成的密钥使用 `SecureRandom` + Base64 编码，安全性有保障
2. **定期轮换**：建议每 90 天轮换密钥
3. **最小权限**：敏感应用设置较短有效期（如 7 天）或指定具体过期日期
4. **HTTPS**：生产环境必须使用 HTTPS 传输
5. **审计日志**：记录所有 X-APPID-KEY 的使用情况

---

## 故障排查

### Key 验证失败

- 检查 appid 是否已配置且启用
- 检查密钥是否正确
- 检查 Key 是否已过期
- 检查 Key 格式是否正确

### 查看日志

```yaml
logging:
  level:
    com.jfeat.am.core.jwt.AppidKeyResolver: DEBUG
```

---

## 架构说明

```
┌─────────────────────────────────────────────────────────┐
│                   第三方应用                             │
│  持有已分发的 X-APPID-KEY                                │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Header: X-APPID-KEY
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   jwt-core                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ AppidKeyResolver.resolveAppid()                 │   │
│  │ 1. 解析格式: appid.timestamp.signature          │   │
│  │ 2. 获取配置: 从内存/配置文件查找                 │   │
│  │ 3. 验证签名: HMAC-SHA256(secret, payload)       │   │
│  │ 4. 验证过期: timestamp + validity_days          │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ JWTKit.getAppid()                               │   │
│  │ 优先从 X-APPID-KEY header 解析                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```
