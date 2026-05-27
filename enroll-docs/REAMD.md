# 前端 + 小程序 工作区说明

## GitLab

- 地址：http://111.230.17.41:28929/
- 说明：各子项目（`enroll-app`、`user`、`workflow`、`jwt`、`eav-skill`）为独立 Git 仓库，可单独 clone / push。

---

## 目录总览

```
前端+小程序/
├── enroll-app/              # UniApp 微信小程序（Vue 3，可运行工程）
├── user/                    # 终端用户系统（Java 主实现 + Rust 重写进行中）
├── workflow/                # Java 工作流引擎（Maven 多模块）
├── jwt/                     # JWT 签发/校验 + Appid 多租户网关
├── eav-skills/              # EAV CLI Agent Skill（创建/实现 API、YAML 同步、.http 测试）
├── prototypes/              # 静态 HTML 页面原型（收费/选宿/财务）
├── miniapp-design-spec.md   # 迎新小程序 UI 设计规范
├── student-miniapp-v*.html  # 学生端高保真交互原型（v2/v3/v3_1）
├── staff-miniapp-v1.html    # 教职工端高保真交互原型
└── 高校收费管理系统需求规格说明书_V3.0.md  # 业务需求定稿（V3.0）
```

---

## enroll-app — UniApp 小程序

### 技术栈

| 项 | 版本/选型 |
|----|-----------|
| 框架 | [uni-app](https://uniapp.dcloud.net.cn/) **Vue 3** + Vite 5 |
| UI | `@dcloudio/uni-ui`、`uview-plus` |
| 状态 | Vuex 4（`src/store/common.js`） |
| 构建 | `@dcloudio/vite-plugin-uni`，脚本见 `package.json` |
| 测试 | Vitest |

### 常用命令

```bash
cd enroll-app
npm install
npm run dev:mp-weixin   # 微信小程序开发
npm run dev:h5          # H5 开发
npm run build:mp-weixin # 微信小程序构建
```

### 工程结构（要点）

| 路径 | 说明 |
|------|------|
| `src/pages.json` | 页面路由、TabBar（首页 / 我的） |
| `src/config.js` | API 域名、`tokenStorageKey`、H5/小程序调试开关 |
| `src/common/request.js` | 统一请求，自动附加 `Authorization: Bearer {token}` |
| `src/common/api.js` | 业务 API 封装 |
| `src/pages/login/` | 登录页 |
| `src/pages/dynamic/` | **动态页面引擎**（配置驱动 UI） |
| `src/pages/dynamic/components/dynamic-page/` | 动态页面容器 |
| `src/pages/dynamic/components/dynamic-list/` | 动态列表 + Card 注册表 |
| `src/pages/dynamic/components/dynamic-form/` | 动态表单 |
| `docs/dynamic-page-route-mechanism.md` | 动态路由机制详解 |

### 微信小程序登录方案

**流程概览：**

1. **获取 code**：`uni.login()` 取得微信临时登录凭证。
2. **用户授权**（小程序）：`open-type="getUserInfo"` → `onGetUserInfo` 后携带 code 调后端。
3. **后端登录接口**：
   - 默认：`POST {endpoint}/api/oauth/wxapp/login`
   - 邀请码 / 切换社区：`POST {endpoint}/api/u/login`
4. **请求体**：`{ auth: code, type: 16, app: 1, ...inviteData }`
5. **成功**：写入 `token`（`globalConfig.tokenStorageKey`）、用户信息到 Storage 与 Vuex，跳转首页或 `loginRedirectPage`。
6. **手机号**：`authorizeMobile.vue` 使用 `open-type="getPhoneNumber"` → `api.getPhoneNumber` → `/api/oauth/wxapp/getPhone`。

**平台差异：**

| 环境 | 行为 |
|------|------|
| 微信小程序 | `debugConfig.simulateNewUser = false`，保留登录态 |
| H5 | `simulateNewUser = true` 时可清缓存模拟新用户；支持 `?forceLogin=true` 强制重登 |

**配置：**

- 小程序 AppID：`src/manifest.json` → `mp-weixin.appid`（当前 `wx0723324978613c32`）
- API 根地址：`src/config.js` → `globalConfig.endpoint`（当前 `https://house.cloud.smallsaas.cn`）

### 动态页面机制

后端下发页面 JSON 配置，前端按模块类型渲染：

```
seniorConfig/index.vue
  └── dynamic-page（autoform / autolist / banner / navlist …）
        └── dynamic-list → cardRegistry 加载 40+ 种卡片组件
```

详见 `enroll-app/docs/dynamic-page-route-mechanism.md`。

### 已注册页面（pages.json）

- `pages/home/index` — 首页（自定义导航）
- `pages/login/index` — 登录
- `pages/my/index` — 我的
- `pages/dynamic/order/myGroupPurchase` — 团购订单
- `pages/dynamic/seniorConfig/index` — 管理员配置（动态页入口）

---

## user — 终端用户系统

Maven 工程 `com.jfeat:user:1.0.0`（`Terminal-End-User`），Spring Boot 3 + Java 17；`workflow` 通过依赖 `user-account:1.1.1` 复用本模块能力。

### 双轨实现

| 轨道 | 路径 | 状态 |
|------|------|------|
| **Java（生产）** | `src/main/java/` | 完整业务，可独立启动 `AmApplication` |
| **Rust（重写）** | `src/main.rs`、`tools/rust/`、`Cargo.toml` | Axum + PostgreSQL，服务层已完成，HTTP 路由部分落地 |

### 目录结构

```
user/
├── pom.xml / src/main/java/com/jfeat/
│   ├── AmApplication.java          # 启动类
│   ├── user/                       # 新结构（Controller / Service / Mapper / Entity）
│   │   ├── controller/
│   │   │   ├── auth/               # 账号注册登录、实名认证
│   │   │   ├── oauth/              # 微信 / GitHub / QQ OAuth
│   │   │   ├── user/               # 用户资料、申请记录
│   │   │   ├── admin/              # 管理端用户
│   │   │   ├── password/           # 找回 / 重置密码
│   │   │   └── sms/                # 短信验证码
│   │   ├── service/                # account、oauth、password、sms
│   │   ├── mapper/                 # MyBatis（UserAccount、第三方用户等）
│   │   └── model/entity/UserAccount.java  → 表 t_end_user
│   └── users/                      # 遗留子模块（逐步迁入 user.*）
│       ├── account/                # 账户 CRUD、邀请、申请记录、SMS
│       ├── weChatMiniprogram/      # 微信小程序 OAuth（WeiXinOauthService）
│       ├── resetPwd/               # 找回密码
│       ├── pwd/                    # 密码策略校验
│       ├── qq/、github/            # 第三方登录
│       └── common/                 # 公共工具、短信常量
├── migrations/                     # PostgreSQL 迁移（Rust 侧 schema）
│   ├── 001_create_t_end_user.sql
│   └── 002_add_personal_no_and_thirdparty_user_id.sql
├── src/test/resources/             # .http 联调用例
├── API.md、README.md、SOLUTION.md   # Rust API 文档 / 方案说明
├── docs/                           # 组织逻辑、Java↔Rust 对照、测试报告
└── refactor-migrate.sh             # 旧包 com.jfeat.users → com.jfeat.user 迁移脚本
```

### 核心数据表

主表 **`t_end_user`**（实体 `UserAccount`），多租户字段 `org_id`、`appid`；密码 `md5(md5(pwd)+salt)` 与 Java 历史兼容。

| 迁移 | 内容 |
|------|------|
| `001_create_t_end_user.sql` | 用户主表、JWT 黑名单、验证码表 |
| `002_add_personal_no_and_thirdparty_user_id.sql` | `personal_no`（唯一）、`thirdparty_user_id`（外部系统 ID） |

辅助表：`t_user_token_blacklist`、`t_verification_code`；微信侧 `SysThirdPartyUser` 等见 `mapper/`。

### 主要 HTTP 接口（Java）

| 前缀 | 控制器 | 用途 |
|------|--------|------|
| `/api/oauth/wxapp` | `WeChatOAuthController` | **小程序登录** `POST /login`、**手机号** `POST /getPhone` |
| `/api/oauth/github`、`/api/oauth/qq` | GitHub / QQ OAuth |
| `/api/app/auth/user` | `AppAuthUserController` | 账号密码登录/注册、找回密码 |
| `/api/u/user/accounts` | `ProfileUserAccountController` | 更新资料（如 `updateUserInfo`） |
| `/api/u/users` | `UserController` | 按手机号查用户等 |
| `/api/user/authentication` | `AppEndUserAuthenticationController` | 实名认证、邀请 |
| `/api/adm/user/accounts` | `AdminUserAccountController` | 管理端账户 |
| `/api/pub/user/password` | `RetrievePasswordController` | 公开找回密码 |

**与 enroll-app 对接（经网关 `endpoint`）：**

```http
POST /api/oauth/wxapp/login      # body: { auth, type, app, ... }
POST /api/oauth/wxapp/getPhone   # 微信手机号
POST /api/u/login                # 邀请码 / 切换社区（网关或聚合层路由）
PUT  /api/u/user/accounts/updateUserInfo
```

联调示例：`src/test/resources/users.auth.wxapp.http`。

### 依赖关系

```
user (pom)
  ├── jwt-core:21.0.0    # 终端用户 JWT 签发
  ├── org:21.0.0         # 组织 / 多租户
  └── spring-boot-starter-data-redis
```

### Rust 侧（eav-user-auth）

- 默认端口：`http://localhost:3000`（见 `README.md`）
- 密码、JWT、OAuth 服务在 `tools/rust/`，与 Java 行为对齐见 `docs/java-dependencies-vs-rust.md`
- 运行：`cargo run`；迁移：`sqlx migrate run`

---

## workflow — 工作流引擎

Maven 父工程 `workflow-pack`（`pom.xml`），子模块：

| 模块 | artifactId | 说明 |
|------|------------|------|
| `workflow/` | workflow | **核心**：流程定义、实例、步骤、任务、历史；REST 在 `api/crud/*Endpoint` |
| `workflow-category/` | workflow-category | 流程分类 |
| `workflow-attachment/` | workflow-attachment | 流程附件 |
| `virtualForm/` | virtualForm | 虚拟表单（与 EAV/动态表单联动） |
| `process-task/` | process-processTask | 流程任务扩展，依赖 `user-account` |

**主要 API 类（示例）：**

- `ProcessEndpoint` / `ProcessInstanceEndpoint` / `ProcessStepEndpoint`
- `TaskEndpoint` / `HistoryEndpoint`
- `AppWorkflowEndpoint` / `AppVirtualFormEndpoint` / `EavProcessEndpoint`

**测试用例：**

- `工作流测试用例.http`
- `工作流和eav测试用例.http`
- `终端用户测试用例.http`
- `process-task/测试用例/任务测试用例.http`

**任务跟踪：** `TASKS.md`（数据模型 / 性能 / 监控等优化项）。

---

## jwt-core — 认证与多租户

| 组件 | 说明 |
|------|------|
| `src/` | JWT 签发与解析（`JWTKit` 等），Spring Boot 3 / Java 17 |
| `JWT.md` | 平台用户 vs **终端用户** 两套 secret 与 claim 说明 |
| `appid-gateway/` | OpenResty 网关：路由前缀转发 + 注入 `X-APPID-KEY`，多租户数据隔离 |
| `cli/`、`generate-appid-key.sh` | Appid 密钥生成工具 |
| `skills/appid-key/` | Appid Key 使用说明 |

**终端用户 JWT claim（节选）：** `userId`、`account`、`domainUserId`、`type`、`orgId` 等。  
默认过期：未配置 `jwt.ttl-millis` 时为 **72h**。

---

## 原型与设计文档

### HTML 高保真原型（可浏览器直接打开）

| 文件 | 端 | 说明 |
|------|-----|------|
| `student-miniapp-v3_1.html` | 学生 | 迎新管理系统学生端（最新迭代） |
| `student-miniapp-v3.html` | 学生 | 迎新缴费 v3 |
| `student-miniapp-v2.html` | 学生 | 迎新缴费 v2 |
| `staff-miniapp-v1.html` | 教职工 | 迎新管理教职工端 |

### prototypes/ 静态原型

- `student-home.html`、`student-payment.html`、`student-dormitory-select.html`
- `finance-dashboard.html`、`teacher-dashboard.html`、`admin-config.html`

### 设计规范

- `miniapp-design-spec.md` / `.docx` — 品牌色、字体、间距、圆角（主色 `#2B6CB0`）
- `miniapp_design_spec.html` — 规范可视化预览

### 业务需求

- `高校收费管理系统需求规格说明书_V3.0.md` — 迎新缴费、学费、退费、选宿、补差、消息推送等（**V3.0 定稿**）

---

## eav-skill — EAV API 开发与测试

本目录为 **EAV CLI 的 Agent Skill 包**，供 Cursor / Claude Code 通过 `eav-cli` 或远程代理 **定义实体、配置路由、导入 YAML、管理行数据、执行 `.http` 测试**，是「在 `edu-api-service` 上实现与创建 API 接口」的标准操作手册。

### 安装（可选，全局 Agent 使用）

```bash
# 在 eav-skill 目录或 eav-rust 根目录执行
node eav-skill/scripts/install.js    # 链到 ~/.claude/skills/eav-skill
node eav-skill/scripts/uninstall.js  # 卸载
```

未安装时，Agent 直接读本仓库内 `eav-skill/SKILL.md` 亦可。

### 入口与调用方式

| 项 | 说明 |
|----|------|
| 入口 | [`eav-skill/SKILL.md`](eav-skill/SKILL.md) — 先读此文件，再按任务加载子 Skill |
| 本地 CLI | 若 `eav-cli --help` 可用，优先直接用 `eav-cli` |
| 远程代理 | `node eav-skill/scripts/eav-remote-cli.js <command> ...` |
| 环境 | 在**含 `./.env` 的仓库根**执行，设置 `EAV_PROXY_URL`（如 `http://127.0.0.1:3333`）；脚本自动加载 `.env`，勿用工具读取 `.env` 内容 |

```bash
# 示例：列出实体
node eav-skill/scripts/eav-remote-cli.js cfg entity list

# 查看 YAML 规范
node eav-skill/scripts/eav-remote-cli.js --spec
```

### 子 Skill 一览（实现 API 时按需加载）

| 文件 | 用途 |
|------|------|
| [`cfg-schema.md`](eav-skill/cfg-schema.md) | **核心**：实体 / 属性 / 注解 / **路由 `cfg route`** / **API 服务 `cfg service`** / 自定义 SQL |
| [`yaml-spec.md`](eav-skill/yaml-spec.md) | `*-api-config.yaml` 完整格式（实体、路由、搜索字段等） |
| [`import-export.md`](eav-skill/import-export.md) | `cfg import yaml` / `cfg export yaml`、DDL 导入导出 |
| [`run-yaml-import/SKILL.md`](eav-skill/run-yaml-import/SKILL.md) | 本仓库执行 YAML 同步的策略（本地 `eav-cli` 优先，否则 remote） |
| [`row.md`](eav-skill/row.md) | 行数据增删改查（`row create/update/delete` 等） |
| [`query.md`](eav-skill/query.md) | 预置域查询 `query --domain ...` |
| [`hybrid-cache.md`](eav-skill/hybrid-cache.md) | 原生表、迁移、缓存 |
| [`run-http-test/SKILL.md`](eav-skill/run-http-test/SKILL.md) | 运行仓库内 `*.http` 接口测试（`run-http-test`） |

### 典型 API 开发流程

```
需求 / 原型
  → 编写或修改 *-api-config.yaml（见 yaml-spec.md）
  → cfg import yaml（见 run-yaml-import/SKILL.md）
  → cfg route / cfg service 校验或 CLI 微调（见 cfg-schema.md）
  → row / cfg entity data list 准备或核对测试数据
  → run-http-test 模块/http/xxx.http 验收
  → enroll-app 对接 globalConfig.endpoint
```

**创建 HTTP 接口（EAV 自动暴露 CRUD）：**

```bash
# 路由：/api/v1/{domain}/{path} → 实体
node eav-skill/scripts/eav-remote-cli.js cfg route create students student --domain school

# 自定义查询服务（eav / eav_plus / native）
node eav-skill/scripts/eav-remote-cli.js cfg service create student_list \
  --sql "SELECT id, name FROM student WHERE status = 'active'" --type eav
```

**批量配置（推荐）：** 在 `edu-api-service` 各业务模块维护 `*-api-config.yaml`，用 `cfg import yaml --file ...` 一次性同步实体、属性、路由与服务定义。

### 与前端 / 其它子项目的关系

- **edu-api-service（主仓）**：EAV 运行时；YAML 与 `.http` 通常放在主仓各模块下，执行时 **cwd 设为主仓根**。
- **enroll-app**：消费 `endpoint` 上已发布的 `/api/...`；动态页配置来自 EAV 下发的页面 JSON。
- **user / workflow**：非 EAV 自动生成部分（登录、工作流）仍用各自 Java 接口；与 EAV 路由并存。

---

## 与 edu-api-service 的关系

- 本目录为**前端原型 + 小程序工程 + 认证/工作流依赖库 + EAV Agent Skill** 的聚合工作区。
- 业务 API 由主仓 `edu-api-service`（EAV）提供；**新增或修改 API** 时遵循 `eav-skill/` 中流程（YAML → import → route/service → `.http` 测试）。
- 小程序通过 `config.js` 的 `endpoint` 调用 OAuth / 用户 / 动态配置等接口。
- 开发新页面时：先对照 HTML 原型与需求说明书，再在 `enroll-app` 中基于动态页面或新建静态页实现。

---

## 快速索引

| 需求 | 查阅 |
|------|------|
| 跑起小程序 | `enroll-app/README`（若有）+ 上文命令 |
| 登录联调 | `enroll-app/src/pages/login/index.vue`、`user/.../WeChatOAuthController.java` |
| 终端用户接口 | `user/API.md`、`user/src/test/resources/*.http` |
| 动态列表/表单 | `enroll-app/docs/`、`dynamic-page-route-mechanism.md` |
| 工作流接口 | `workflow/*.http`、`workflow/.../api/` |
| JWT / Appid | `jwt/JWT.md`、`jwt/appid-gateway/README.md` |
| UI 规范 | `unified-ui-spec-v3.1(1).md` |
| 业务规则 | `高校收费管理系统需求规格说明书_V3.0.md` |
| **创建 / 实现 EAV API** | `eav-skill/SKILL.md` → `cfg-schema.md`、`yaml-spec.md` |
| YAML 导入导出 | `eav-skill/run-yaml-import/SKILL.md`、`import-export.md` |
| 跑 `.http` 测试 | `eav-skill/run-http-test/SKILL.md`、`run-http-test` 命令 |
