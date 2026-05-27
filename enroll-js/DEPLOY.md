# enroll-js 部署说明

## 前置条件

- Node.js >= 18
- PostgreSQL 已在 129.204.59.156:15432 运行

## 部署步骤

### 1. 解压

```bash
tar -xzf enroll-js.tar.gz
cd enroll-js
```

### 2. 修改 .env 数据库地址

如果在 **129.204.59.156 服务器本机**运行，将 .env 改为：

```
DATABASE_URL=postgresql://postgres:sandbox@localhost:15432/enroll?sslmode=disable&connect_timeout=30
```

如果在其他机器运行，保持现有配置即可。

### 3. 安装依赖

```bash
npm install
```

### 4. 初始化测试数据 (可选，建议执行)

```bash
psql -h localhost -p 15432 -U postgres -d enroll -f scripts/seed-test-data.sql
```

### 5. 启动服务

```bash
# 开发模式（自动重载）
npm run dev

# 后台运行
nohup npm run dev > app.log 2>&1 &
```

### 6. 验证

```bash
curl http://localhost:3100/health
# 返回: {"status":"ok","database":"connected"}

curl http://localhost:3100/api/student/scholarship/types
# 返回: {"code":0,"message":"success","data":{...}}
```

## 前端对接

基础 URL: `http://129.204.59.156:3100`  
完整 API 文档: `./js-API.md`

## 目录结构

```
enroll-js/
├── src/
│   ├── index.ts              # 入口
│   ├── lib/
│   │   ├── jwt.ts            # JWT 工具
│   │   ├── response.ts       # 响应格式
│   │   └── eav.ts            # EAV 查询辅助
│   ├── routes/
│   │   ├── health.ts         # 健康检查
│   │   ├── entities.ts       # EAV 实体
│   │   ├── rooms.ts          # 宿舍管理
│   │   ├── teachers.ts       # 教师管理
│   │   └── student/          # 学生端 50 个业务 API
│   │       ├── auth.ts       # 认证
│   │       ├── orientation.ts # 迎新
│   │       ├── dorm.ts       # 宿舍
│   │       ├── bill.ts       # 账单支付
│   │       ├── refund.ts     # 退费
│   │       ├── scholarship.ts # 助学金
│   │       ├── loan.ts       # 贷款
│   │       ├── messages.ts   # 消息
│   │       ├── checkin.ts    # 签到
│   │       ├── prepay.ts     # 预缴费
│   │       ├── address.ts    # 地址
│   │       ├── orgs.ts       # 院系
│   │       ├── feedback.ts   # 评价
│   │       ├── upload.ts     # 上传
│   │       └── config.ts     # 配置公告
│   ├── db/                   # 数据库连接
│   └── schema/               # Drizzle schema
├── scripts/
│   └── seed-test-data.sql    # 测试数据
├── .env                      # 数据库配置
├── package.json
├── js-API.md                 # API 文档
└── DEPLOY.md                 # 本文件
```
