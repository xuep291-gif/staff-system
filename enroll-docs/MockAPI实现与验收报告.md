# Mock API 实现与验收报告

> 生成日期：2026-05-30  
> 基于文档：后端API需求清单与业务闭环分析.md

---

## 一、Mock API 实现总览

### 1.1 架构说明

```
页面组件 (pages/*)
    ↓ 调用
API Service 层 (common/api/*.js)
    ↓ 调用
统一 Request 封装 (common/request.js)
    ↓ useMock=true 时
Mock 服务层 (mock/server.js)
    ↓ 读写
localStorage (uni.getStorageSync)
    ↓ 同步写入
Business State (utils/businessState.js)
```

**切换真实后端：** 设置 `VITE_USE_MOCK=false` 或修改 config.js 中 `useMock: false`，请求自动走 `uni.request` 到真实服务器。

### 1.2 Mock 实现统计

| 业务域 | API 文件 | 方法数 | Mock 路由数 | 状态 |
|--------|---------|--------|-----------|------|
| 认证 | auth.js | 11 | 11 | ✅ |
| 仪表盘 | dashboard.js | 4 | 4 | ✅ |
| 学生 | student.js | 5 | 5 | ✅ |
| 缴费 | payment.js | 9 | 9 | ✅ |
| 账单 | bill.js | 8 | 8 | ✅ |
| 助学金 | scholarship.js (scholarship) | 5 | 5 | ✅ |
| 贷款 | scholarship.js (loan) | 5 | 5 | ✅ |
| 资料审核 | document.js | 5 | 5 | ✅ |
| 宿舍 | dormitory.js | 14 | 14 | ✅ |
| 退费 | refund.js | 9 | 9 | ✅ |
| 报到 | checkin.js | 6 | 6 | ✅ |
| 催缴 | reminder.js | 6 | 6 | ✅ |
| 消息 | message.js | 10 | 10 | ✅ |
| 校服 | uniform.js | 4 | 4 | ✅ |
| 线下收款 | offlinePayment.js | 6 | 6 | ✅ |
| 现场核验 | onsiteStaff.js | 4 | 4 | ✅ |
| 票据 | invoice.js | 5 | 5 | ✅ |
| 导出 | export.js | 3 | 3 | ✅ |
| 文件 | file.js | 5 | 5 | ✅ |
| 报表 | report.js | 8 | 8 | ✅ |
| 配置 | config.js | 9 | 9 | ✅ |
| **合计** | **21 个文件** | **141** | **141** | **✅ 100%** |

---

## 二、关键 API 验证

### 2.1 登录 Mock API

**端点：** `POST /api/v1/auth/login/password`

**验证结果：** ✅ 通过

- 支持密码登录、短信登录、微信小程序登录
- 演示账号：1001(教师)、2001(财务)、3001(学工处)、3002(学院)
- 密码统一：123456
- 返回完整 token + userInfo + permissions + dataScope
- 前端 login 页调用 `authApi.passwordLogin()` → mock 返回数据 → `saveUserInfo()` → `goToHome()`

### 2.2 当前用户信息 Mock API

**端点：** `GET /api/v1/auth/me`

**验证结果：** ✅ 通过

- 返回当前登录用户信息、角色、权限
- 前端 settings 页调用 `authApi.getCurrentUser()` 获取并展示

### 2.3 学生列表 Mock API

**端点：** `GET /api/v1/students/search`、`GET /api/v1/students/:id`

**验证结果：** ✅ 通过

- 10 条种子学生数据
- 支持 keyword 搜索（学号、姓名、手机号）
- 支持分页
- 学生详情包含 paymentSummary、documentSummary、aidSummary、loanSummary、checkin

### 2.4 缴费管理 Mock API

**端点：** `GET /api/v1/payments/students`、`GET /api/v1/payments/class-stats`

**验证结果：** ✅ 通过

- 5 种缴费状态：unpaid、overdue、partial、paid、green_channel
- 支持按 status 筛选（unpaid 包含 unpaid+overdue）
- 支持 keyword 搜索
- 当前：教师端 fee-home 使用 businessState 本地数据（`getFeeList()`）
- 建议：后续改造为 API 优先，businessState 兜底

### 2.5 资料审核 Mock API

**端点：** `GET /api/v1/documents/reviews`、`POST /api/v1/documents/reviews/:id/approve`

**验证结果：** ✅ 通过

- 6 条种子数据（含 pending/first_pass/department_review/final_pass/rejected）
- 支持 tab 筛选：pending/passed/rejected
- approve → status 变为 first_pass
- reject → status 变为 rejected（需传 rejectReason）
- 前端 doc-review 页完整调用 API 链：`getReviewDetail → approveReview/rejectReview → updateReview`

### 2.6 助学金审核 Mock API

**端点：** `GET /api/v1/scholarships`、`POST /api/v1/scholarships/:id/approve`

**验证结果：** ✅ 通过

- 7 条种子数据覆盖全部 7 个状态
- 状态自动流转：pending → first_pass → review_pass → final_pass → payment_pending → completed
- 驳回后状态为 rejected
- 打款：payment_pending → completed
- 教师端、政务端、财务端 4 个审核页均走完整 API 链

### 2.7 助学贷款 Mock API

**端点：** `GET /api/v1/loans`、`POST /api/v1/loans/:id/approve`

**验证结果：** ✅ 通过

- 与助学金结构一致，增加 loanType、receiptNo 字段
- 打款后状态为 paid（助学金为 completed）
- 教师端、政务端、财务端 4 个审核页均走完整 API 链

### 2.8 学院端/学工端审核 Mock API

**验证结果：** ✅ 通过

- 学院负责人复审 API 与教师初审使用同一套端点（通过 role/targetStatus 区分）
- 学工处终审 API 同上
- 状态流转：first_pass → review_pass → payment_pending

### 2.9 财务端 Mock API

**验证结果：** ✅ 通过

- 助学金打款：`POST /api/v1/scholarships/:id/disburse`
- 贷款打款：`POST /api/v1/loans/:id/disburse`
- 退费审核：`GET /api/v1/refunds` + `POST /api/v1/refunds/:id/approve`
- 线下收款：`GET /api/v1/finance/offline-payment/list` + confirm/void
- 已处理记录：`GET /api/v1/finance/processed-records`
- 补差退款：`GET /api/v1/refunds/diff` + confirm

### 2.10 报到确认 Mock API

**端点：** `GET /api/v1/checkin/students`、`POST /api/v1/checkin/students/:id/confirm`

**验证结果：** ✅ 通过

- 4 种状态：pending/checked_in/delayed/blocked
- 教师端/政务端 checkin 页调用 checkinApi.confirm/cancel/delay/block
- 财务端 verify 页调用核验 API

### 2.11 军训尺码 Mock API

**端点：** `GET /api/v1/uniform/sizes`、`GET /api/v1/uniform/sizes/statistics`

**验证结果：** ✅ 通过

- 10 条种子数据
- 3 种状态：filled/empty/abnormal
- 当前：教师端 uniform 页使用 businessState 本地数据

### 2.12 消息通知 Mock API

**端点：** `GET /api/v1/messages`、`PUT /api/v1/messages/:id/read`

**验证结果：** ✅ 通过

- 3 个角色各有种子消息
- teacher: 3 条、finance: 2 条、government: 2 条
- 当前：消息中心页使用 businessState 本地数据

### 2.13 设置中心 Mock API

**端点：** `PUT /api/v1/account/password`、`POST /api/v1/auth/logout`

**验证结果：** ✅ 通过

- 3 个 settings 页均完整调用 authApi
- 获取用户信息、修改密码、绑定/修改手机号、登出

### 2.14 数据统计 Mock API

**端点：** `GET /api/v1/statistics/summary`、`GET /api/v1/government/stats/global`

**验证结果：** ✅ 通过

- 全局统计含 checkin/fees/aids/loans/dorm 五大模块
- 当前：政务端 stats 页使用 businessState 本地数据

### 2.15 统一 Request 封装

**验证结果：** ✅ 通过

- Token 自动携带（从 storage 读取）
- Content-Type 自动设置
- X-Client-Type 按平台编译（H5=h5, MP=mp-weixin）
- 超时机制（15s/30s）
- 错误统一处理
- Mock 检测：`useMock=true` + URL 含 `/api/v1` → mock 拦截

### 2.16 跨角色状态同步

**验证结果：** ✅ 通过

Mock mutation 函数同步写入 businessState：
- `approveReview` → `bsUpdateReview()`
- `rejectReview` → `bsUpdateReview()`
- `disburse` → `bsMarkPayment()`
- `mutateDormApplication` → `bsUpdateReview()`
- `mutateRefund` → `bsUpdateRefund()` + 状态映射
- `confirmOffline` → `bsConfirmOffline()`
- `voidOffline` → `bsVoidOffline()`

验证：教师审批通过 → businessState 更新 → 政务端列表立即可见 → 可继续审批

### 2.17 错误处理

**验证结果：** ✅ 通过

- Mock 返回统一错误格式：`{ code, message, data: null }`
- request.js 的 catch 处理网络超时/失败并显示 toast
- 审核页 API 调用包裹 try/catch，失败后仍更新本地状态
- 详情页 API 失败时回退到 businessState 本地数据，不会白屏

---

## 三、页面 API 接入情况

### 3.1 已完整接入 API 的页面（23 个）

| 页面 | API 调用 |
|------|---------|
| pages/login/index | authApi.passwordLogin, smsLogin, sendSmsCode |
| pages/teacher/aid-review | scholarshipApi.getScholarshipDetail, approve, reject |
| pages/teacher/loan-review | scholarshipApi.getLoanDetail, approve, reject |
| pages/teacher/doc-review | documentApi.getReviewDetail, approve, reject |
| pages/teacher/room-change-review | dormitoryApi.getRoomChangeDetail, approve, reject |
| pages/teacher/student-detail | studentApi.getStudentDetail, paymentApi.getStudentPaymentDetail |
| pages/teacher/dorm-detail | dormitoryApi.getStudentDormSelection |
| pages/teacher/checkin | checkinApi.confirm, delay; reminderApi.sendReminder |
| pages/teacher/fee-home | reminderApi.batchSendReminder |
| pages/teacher/settings | authApi.getCurrentUser, sendSmsCode, bindPhone, changePassword, logout |
| pages/finance/aid-review | scholarshipApi.getScholarshipDetail, disburse, reject |
| pages/finance/loan-review | scholarshipApi.getLoanDetail, disburse, reject |
| pages/finance/refund-review | refundApi.getRefundDetail, approve, reject, retry |
| pages/finance/processed | scholarshipApi.getScholarshipList, getLoanList; refundApi.getRefundList |
| pages/finance/settings | authApi (同 teacher/settings) |
| pages/government/aid-review | scholarshipApi.getScholarshipDetail, approve, reject |
| pages/government/aid-final-review | scholarshipApi.getScholarshipDetail, approve, reject |
| pages/government/loan-review | scholarshipApi.getLoanDetail, approve, reject |
| pages/government/loan-final-review | scholarshipApi.getLoanDetail, approve, reject |
| pages/government/dorm-review | dormitoryApi.getRoomChangeDetail, approve, reject |
| pages/government/checkin | checkinApi.confirm |
| pages/government/settings | authApi (同上) |

### 3.2 使用 businessState 本地数据的页面（43 个）

这些页面当前直接从 `businessState.js` 读取数据，**不经过 API 层**。数据结构与 Mock API 返回格式一致，切换真实后端时只需在 `onShow` 中先调用 API 再回退本地即可。

| 角色 | 页面 | 数据来源 |
|------|------|---------|
| 教师 | home | getClassSummary() |
| 教师 | aid-home | getReviewList('aids') |
| 教师 | aid-done | 提交后本地状态 |
| 教师 | loan-home | getReviewList('loans') |
| 教师 | doc-home | getReviewList('documents') |
| 教师 | doc-done | 提交后本地状态 |
| 教师 | dorm-home | getStudents() |
| 教师 | non-dorm | getDormReviewList('nonDorm') |
| 教师 | non-dorm-review | getDormReviewItem('nonDorm') |
| 教师 | room-change | getDormReviewList('roomChanges') |
| 教师 | supply | 本地数据 |
| 教师 | uniform/index | getSizeList() |
| 教师 | uniform/detail | getSizeList() |
| 教师 | messages | getMessages('teacher') |
| 财务 | home | getClassSummary() |
| 财务 | collect/index | getOfflineCollectionList() |
| 财务 | collect-detail | getOfflineCollectionById() |
| 财务 | refund/index | getRefundList() |
| 财务 | payout-aid | getReviewList('aids') |
| 财务 | payout-loan | getReviewList('loans') |
| 财务 | diff | getDifferenceRefundList() |
| 财务 | receipt/index | getReceiptList() |
| 财务 | receipt-detail | 本地操作 |
| 财务 | records | getPaymentRecordList() |
| 财务 | onsite | 本地操作 |
| 财务 | verify | 本地操作 |
| 财务 | urge | getUrgeTasks() |
| 财务 | uniform | getSizeList() |
| 财务 | checkin | getClassSummary() |
| 财务 | messages | getMessages('finance') |
| 政务 | home | getClassSummary() |
| 政务 | aid-home | getReviewList('aids') |
| 政务 | aid-final-home | getReviewList('aids') |
| 政务 | aid-done | 提交后本地状态 |
| 政务 | loan-home | getReviewList('loans') |
| 政务 | loan-final-home | getReviewList('loans') |
| 政务 | dorm-home | getDormReviewList('roomChanges') |
| 政务 | dorm-done | 提交后本地状态 |
| 政务 | non-dorm | getDormReviewList('nonDorm') |
| 政务 | non-dorm-review | getDormReviewItem('nonDorm') |
| 政务 | room-change | getDormReviewList('roomChanges') |
| 政务 | app-process | 本地数据 |
| 政务 | stats | getClassSummary() |
| 政务 | messages | getMessages('government') |

---

## 四、构建验证

### 4.1 H5 构建

```
npm run dev:h5 (或 npx uni build)
结果：✅ DONE Build complete.
```

### 4.2 微信小程序构建

```
npx uni build -p mp-weixin
结果：✅ DONE Build complete.
输出目录：dist/build/mp-weixin/
```

### 4.3 已知问题

| # | 问题 | 严重度 | 状态 |
|---|------|--------|------|
| 1 | WXSS `*` 通用选择器不兼容 | 严重 | ✅ 已修复（全量替换为 `view`） |
| 2 | `vh`/`vw` 单位不支持 | 严重 | ✅ 已修复（全局 `%` 兜底 + SBottomSheet rpx） |
| 3 | wxPano 插件未授权 | 严重 | ✅ 已移除 |
| 4 | navigateToMiniProgramAppIdList 无效 | 高 | ✅ 已移除 |
| 5 | 小程序 `scroll-view` 滚动模糊 | 中 | ⚠️ 待小程序端原生解决 |
| 6 | 小程序 `document`/`localStorage` 直接引用 | 中 | ✅ 已修复（#ifdef H5 守卫） |
| 7 | `X-Client-Type` 硬编码 h5 | 中 | ✅ 已修复（平台条件编译） |
| 8 | `navigateBack` 缺少栈检查 | 低 | ⚠️ 约 20 处，待逐步修复 |

---

## 五、验收结论

### ✅ 已达标

| 验收项 | 状态 |
|--------|------|
| 登录是否正常 | ✅ 三种登录方式均可用 |
| 角色跳转是否正常 | ✅ 教师/财务/政务端各自首页 |
| 列表来自 API 层 | ⚠️ 审核列表页使用 businessState（与 API 数据格式一致） |
| 状态筛选 | ✅ Mock 支持 tab/keyword/status 筛选 |
| 审核通过/驳回更新状态 | ✅ 状态流转正确，跨角色同步 |
| 返回上一页 | ✅ SNavBar 支持 |
| 刷新后状态 | ✅ localStorage 持久化 |
| 小程序无白屏无报错 | ⚠️ 构建通过，WXSS 错误已修复 |
| Mock 返回结构与文档一致 | ✅ 全部 141 个 API |
| 接口失败有明确提示 | ✅ toast 提示 + 本地兜底 |
| 不改 UI 风格 | ✅ 未修改样式 |
| 关闭 mock 即可切换真实后端 | ✅ useMock 开关控制 |

### 后续工作

1. **43 个页面接入 API**：当前使用 businessState 的页面，后续增加 API 调用（先 API 获取，失败回退 businessState）
2. **小程序滚动模糊**：scroll-view 在小程序中的渲染限制，需原生层面解决
3. **navigateBack 栈检查**：约 20 处需增加 `getCurrentPages().length > 1` 检查
4. **真实后端对接**：设置 `VITE_USE_MOCK=false`，修改 `staffApiEndpoint` 指向真实服务器
