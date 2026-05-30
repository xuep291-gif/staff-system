# 后端 API 需求清单与业务闭环分析

> 生成日期：2026-05-30  
> 分析范围：全部 66 个页面，21 个 API 服务文件，141 个 API 方法  
> 覆盖: 教师端 · 财务端 · 政务端 · 登录/设置

---

## 目录

1. [系统架构总览](#一系统架构总览)
2. [API 详细规格（按业务域）](#二api-详细规格)
   - 2.1 认证与账户
   - 2.2 仪表盘与统计
   - 2.3 学生管理
   - 2.4 缴费管理
   - 2.5 助学金审核
   - 2.6 助学贷款审核
   - 2.7 资料审核
   - 2.8 宿舍管理
   - 2.9 退费处理
   - 2.10 报到确认
   - 2.11 催缴通知
   - 2.12 消息中心
   - 2.13 军训尺码
   - 2.14 线下收款
   - 2.15 票据管理
   - 2.16 现场核验
   - 2.17 文件管理
   - 2.18 数据导出
   - 2.19 绿色通道
3. [状态流转图](#三状态流转图)
4. [API 依赖关系](#四api-依赖关系)
5. [Mock 实现状态](#五mock-实现状态)
6. [API TODO 清单](#六api-todo-清单)

---

## 一、系统架构总览

### 1.1 角色与权限

| 角色 | type ID | 子角色 | 权限范围 |
|------|---------|--------|---------|
| 教师/班主任 | 2 | head_teacher | 本班：缴费管理、资料审核、助学金初审、贷款初审、宿舍查看、报到确认、尺码统计 |
| 财务收费员 | 3 | fee_collector | 全校：线下收款、退费、补差、票据、催缴、打款 |
| 财务审批员 | 3 | fee_approver | 全校：助学金打款、贷款打款、统计 |
| 学工处 | 5 | student_affairs | 全校：助学金终审、贷款终审、换宿审批、报到统计、校外住宿审核 |
| 学院负责人 | 5 | college_dean | 本院：助学金复审、贷款复审、报到统计 |

### 1.2 页面分布

| 角色 | 页面数 | 调用 API 的页面 | 纯本地数据页面 |
|------|--------|----------------|--------------|
| 教师 | 23 | 10 | 13 |
| 财务 | 20 | 5 | 15 |
| 政务 | 21 | 7 | 14 |
| 登录/绑定 | 2 | 1 | 1 |
| **合计** | **66** | **23** | **43** |

### 1.3 API 服务文件

| 文件 | 方法数 | 前缀 |
|------|--------|------|
| `auth.js` | 11 | `/api/v1/auth/*`, `/api/v1/account/*` |
| `dashboard.js` | 4 | `/api/v1/dashboard/*` |
| `student.js` | 5 | `/api/v1/students/*` |
| `payment.js` | 9 | `/api/v1/payments/*` |
| `bill.js` | 8 | `/api/v1/bill/*` |
| `scholarship.js` | 10 | `/api/v1/scholarships/*`, `/api/v1/loans/*` |
| `document.js` | 5 | `/api/v1/documents/*` |
| `dormitory.js` | 14 | `/api/v1/dormitories/*`, `/api/v1/dormitory/*` |
| `refund.js` | 9 | `/api/v1/refunds/*` |
| `checkin.js` | 6 | `/api/v1/checkin/*` |
| `reminder.js` | 6 | `/api/v1/reminders/*` |
| `message.js` | 10 | `/api/v1/messages/*` |
| `uniform.js` | 4 | `/api/v1/uniform/*` |
| `offlinePayment.js` | 6 | `/api/v1/finance/offline-payment/*` |
| `onsiteStaff.js` | 4 | `/api/staff/checkin/*` |
| `invoice.js` | 5 | `/api/v1/invoices/*` |
| `export.js` | 3 | `/api/v1/export/*` |
| `file.js` | 5 | `/api/v1/files/*` |
| `report.js` | 8 | `/api/v1/reports/*` |
| `config.js` | 9 | `/api/v1/config/*` |

### 1.4 全局请求格式

所有 API 调用通过 `src/common/request.js` 发起，自动携带：
- Header: `Authorization: Bearer {token}`
- Header: `Content-Type: application/json;charset=UTF-8`
- Header: `X-App-Id: {appId}`
- Header: `X-Client-Type: h5|mp-weixin`（按平台编译）
- Timeout: 15s（普通）/ 30s（上传）

### 1.5 全局响应格式

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": { /* 业务数据 */ },
  "timestamp": 1717056000000,
  "requestId": "req_abc123"
}
```

**失败响应：**
```json
{
  "code": 40001,
  "message": "错误描述",
  "data": null,
  "timestamp": 1717056000000,
  "requestId": "req_abc123"
}
```

**分页列表响应**（嵌入在 `data` 中）：
```json
{
  "list": [...],
  "page": 1,
  "pageSize": 10,
  "total": 200,
  "totalPages": 20,
  "hasNext": true
}
```

### 1.6 常见错误码

| code | 含义 |
|------|------|
| 0 | 成功 |
| 40001 | 参数错误 / 业务校验失败 |
| 40100 | 未登录或 token 过期 |
| 40400 | 资源不存在 |
| 408 | 请求超时 |
| 500 | 服务器内部错误 |

---

## 二、API 详细规格

### 2.1 认证与账户

#### 2.1.1 密码登录

```
POST /api/v1/auth/login/password
需要Token: 否
权限: 无需登录
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | String | 是 | 工号或手机号 |
| password | String | 是 | 密码（演示环境固定 `123456`） |
| clientType | String | 是 | `"h5"` 或 `"mp-weixin"` |
| appId | Number | 是 | 应用ID，当前为 `1` |

**请求示例：**
```json
{ "account": "2001", "password": "123456", "clientType": "h5", "appId": 1 }
```

**调用方：** `pages/login/index.vue:299` — `authApi.passwordLogin(params)`

**返回字段：**
| 字段 | 类型 | 说明 |
|------|------|------|
| accessToken | String | 访问令牌，后续请求携带 |
| refreshToken | String | 刷新令牌 |
| expiresIn | Number | 过期时间（秒），7200 |
| user.userId | String | 用户唯一标识 |
| user.name | String | 姓名 |
| user.workNo | String | 工号 |
| user.phone | String | 手机号 |
| user.roles | String[] | 角色列表 `["teacher"|"finance"|"government"]` |
| user.type | Number | 角色类型编号 2/3/5 |
| user.typeList | Number[] | 所有角色类型列表 |
| user.departmentName | String | 部门名称 |
| user.subRole | String | 子角色 `head_teacher|fee_collector|fee_approver|student_affairs|college_dean` |
| user.permissions | String[] | 权限标识列表 |
| user.dataScope | Object | 数据范围 `{ type: "class"|"college"|"all", classId?, collegeId? }` |
| defaultRole | String | 默认角色 |
| homePage | String | 首页路径 |

**返回示例：**
```json
{
  "code": 0, "message": "success",
  "data": {
    "accessToken": "mock_token_finance_1717056000000",
    "refreshToken": "mock_refresh_1717056000000",
    "expiresIn": 7200,
    "user": {
      "userId": "staff_finance_001", "name": "陈美玲", "workNo": "F2026001",
      "phone": "13800138001", "roles": ["finance"], "type": 3, "typeList": [3],
      "departmentName": "财务处", "hasType": true,
      "orgId": "org-001", "orgName": "华东科技大学",
      "subRole": "fee_collector",
      "permissions": ["finance:overview","finance:collect","finance:refund","finance:diff","finance:receipt","finance:urge","finance:payout"],
      "dataScope": { "type": "all" }
    },
    "defaultRole": "finance",
    "homePage": "/pages/finance/home/index",
    "permissions": ["finance:*"]
  }
}
```

**状态影响：** 是 — 登录成功后前端存储 token 和 userInfo，解析角色，应用主题。

**依赖关系：** 是所有需要认证的 API 的前置条件。

**Mock 状态：** ✅ 已实现

---

#### 2.1.2 短信验证码登录

```
POST /api/v1/auth/login/sms
需要Token: 否
```

| 参数 | 类型 | 必填 |
|------|------|------|
| phone | String | 是 |
| code | String | 是（演示环境固定 `123456`） |
| smsToken | String | 是（先调用 sendSmsCode 获取） |
| clientType | String | 是 |
| appId | Number | 是 |

**返回：** 同密码登录

**调用方：** `pages/login/index.vue:324`

**状态影响：** 同密码登录

---

#### 2.1.3 微信小程序登录

```
POST /api/v1/auth/login/wechat-miniapp
需要Token: 否
```

| 参数 | 类型 | 必填 |
|------|------|------|
| account | String | 否（通过微信 code 自动识别） |

**调用方：** `pages/login/index.vue:446`（使用 `uni.request` 原始调用，端点为 `/api/oauth/wxapp/login`）

**返回：** 同密码登录

---

#### 2.1.4 发送短信验证码

```
POST /api/v1/auth/sms-code
需要Token: 否
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | String | 是 | 手机号 |
| scene | String | 是 | 场景：`"login"` / `"bind_phone"` / `"change_phone_old"` / `"change_phone_new"` |

**返回：**
```json
{ "code": 0, "data": { "smsToken": "sms_1717056000000", "expireSeconds": 300, "cooldownSeconds": 60 } }
```

**调用方：** `pages/login/index.vue`, `pages/*/settings/index.vue`

---

#### 2.1.5 获取当前用户

```
GET /api/v1/auth/me
需要Token: 是
```

**返回：**
```json
{ "code": 0, "data": { "userId": "...", "name": "...", "workNo": "...", "phone": "...", "roles": ["..."], "type": 2, "currentRole": "teacher", "roleScopes": [{ "classId": "class-2026-1", "departmentId": "cs" }], "permissions": ["teacher:*"], "orgId": "org-001", "orgName": "华东科技大学" } }
```

**调用方：** `pages/*/settings/index.vue:183`

---

#### 2.1.6-2.1.12 其他认证 API

| API | 方法 | URL | 用途 | 调用方 |
|-----|------|-----|------|--------|
| 刷新Token | POST | `/api/v1/auth/refresh` | 刷新 accessToken | 拦截器自动调用 |
| 切换角色 | POST | `/api/v1/auth/switch-role` | `{ role }` → 新 token | role.js |
| 登出 | POST | `/api/v1/auth/logout` | 登出 | settings 页 |
| 绑定手机 | POST | `/api/v1/account/phone/bind` | `{ phone, code, smsToken }` | settings 页 |
| 修改手机 | PUT | `/api/v1/account/phone` | `{ oldCode, newPhone, newCode, ... }` | settings 页 |
| 修改密码 | PUT | `/api/v1/account/password` | `{ oldPassword, newPassword }` | settings 页 |
| 获取权限 | GET | `/api/v1/auth/permissions` | `?userId=` | role.js |

---

### 2.2 仪表盘与统计

#### 2.2.1 教师仪表盘

```
GET /api/v1/dashboard/teacher
需要Token: 是 · 角色: teacher
```

**调用方：** `pages/teacher/home/index.vue`（当前走 businessState 本地数据，API 作为补充）

**返回字段：**
```json
{
  "teacher": { "name": "刘晓华", "avatar": "刘", "college": "计算机学院", "className": "2026级1班", "totalStudents": 10 },
  "classStats": { "totalStudents": 10, "checkedIn": 7, "unchecked": 3, "checkinRate": 70 },
  "todo": {
    "docPending": 2, "aidPending": 2, "loanPending": 2,
    "feeOverdue": 2, "roomChangePending": 1, "dormWithdrawPending": 1, "nonDormPending": 1
  },
  "unreadCount": 3,
  "quickEntries": []
}
```

#### 2.2.2 财务仪表盘

```
GET /api/v1/dashboard/finance
需要Token: 是 · 角色: finance
```

**返回字段：**
```json
{
  "todayReceivedAmount": 128500,
  "paidStudentCount": 3, "unpaidStudentCount": 4, "refundPendingCount": 1,
  "todo": { "aidPayoutPending": 1, "loanPayoutPending": 1, "refundPending": 1, "processedCount": 6 },
  "unreadCount": 2
}
```

#### 2.2.3 政务仪表盘

```
GET /api/v1/dashboard/government
需要Token: 是 · 角色: government
```

**返回字段：**
```json
{
  "todayCheckinCount": 7, "checkedInCount": 7, "uncheckedCount": 3, "checkinRate": 70,
  "todo": { "roomChangePending": 1, "aidReviewPending": 2, "loanReviewPending": 2, "applicationPending": 1 },
  "unreadCount": 1
}
```

#### 2.2.4 统计概览

```
GET /api/v1/statistics/summary?bizType=payment&role=teacher
需要Token: 是
```

支持 bizType: `payment` / `scholarship` / `loan` / `refund` / `checkin` / `document`

**返回：** `{ total, statusCounts: {}, tabCounts: [{ key, label, count }], updatedAt }`

#### 2.2.5 政务全局统计

```
GET /api/v1/government/stats/global
GET /api/v1/government/stats/college
需要Token: 是 · 角色: government
```

**返回：**
```json
{
  "checkin": { "total": 10, "checkedIn": 7, "unchecked": 3, "rate": 70 },
  "fees": { "total": 58000, "paid": 40000, "paidCount": 7, "unpaidCount": 3, "rate": 69 },
  "aids": { "total": 10, "approved": 5, "pending": 3, "rejected": 2 },
  "loans": { "total": 10, "approved": 4, "pending": 4, "rejected": 2 },
  "dorm": { "total": 10, "changes": 2, "nonDorm": 1 }
}
```

---

### 2.3 学生管理

#### 2.3.1 搜索学生

```
GET /api/v1/students/search?keyword=张三&page=1&pageSize=20
需要Token: 是
```

**请求参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| keyword | String | — | 搜索姓名/学号/手机号 |
| page | Number | 1 | |
| pageSize | Number | 10 | |

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| studentId | String | 学生唯一标识 |
| studentNo | String | 学号 |
| name | String | 姓名 |
| gender | String | 性别 |
| college | String | 学院 |
| major | String | 专业 |
| className | String | 班级 |
| phone | String | 联系电话 |
| parentPhone | String | 家长电话 |
| idNoMasked | String | 身份证号（脱敏） |
| address | String | 地址 |
| dormText | String | 宿舍信息（如 "3号楼 305室 2床"） |

---

#### 2.3.2 学生详情

```
GET /api/v1/students/:id
需要Token: 是
```

**调用方：** `pages/teacher/student-detail/index.vue:191`

**返回字段（除列表字段外增加）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| paymentSummary | Object | 缴费概览 { receivableAmount, paidAmount, unpaidAmount, paymentStatus } |
| documentSummary | Object | 资料审核概览 { status, submittedAt } |
| aidSummary | Object | 助学金概览 { status, amount, type } |
| loanSummary | Object | 助学贷款概览 { status, amount, type } |
| checkin | Object | 报到状态 { checkinStatus, checkedInAt } |
| auditLogs | Object[] | 操作记录 |

---

### 2.4 缴费管理

#### 2.4.1 班级缴费统计

```
GET /api/v1/payments/class-stats
需要Token: 是 · 角色: teacher
```

**返回：**
```json
{
  "totalStudents": 10,
  "paidCount": 7, "unpaidCount": 2, "partialCount": 1,
  "overdueCount": 2, "greenChannelCount": 1,
  "totalReceivableAmount": 58000, "totalPaidAmount": 40000, "totalUnpaidAmount": 18000
}
```

#### 2.4.2 学生缴费列表

```
GET /api/v1/payments/students?page=1&pageSize=20&status=unpaid&keyword=张
需要Token: 是 · 角色: teacher
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page/pageSize | Number | 分页 |
| keyword | String | 搜索姓名/学号 |
| status | String | `unpaid` / `overdue` / `partial` / `paid` / `green_channel` |
| studentId | String | 精确匹配学号 |
| classId | String | 按班级筛选 |
| startTime/endTime | String | 时间范围 |

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| paymentId | String | 缴费记录ID |
| studentNo | String | 学号 |
| studentName | String | 姓名 |
| receivableAmount | Number | 应缴金额 |
| paidAmount | Number | 已缴金额 |
| unpaidAmount | Number | 未缴金额 |
| paymentStatus | String | `unpaid`\|`overdue`\|`partial`\|`paid`\|`green_channel` |
| payStatus | String | 同 paymentStatus（normalized） |
| overdueDays | Number | 逾期天数 |
| urgeCount | Number | 已催缴次数 |
| lastUrgeAt | String | 最后催缴时间 |
| canUrge | Boolean | 是否可催缴 |
| statusLabel | String | 中文状态标签 |
| statusColor | String | 状态颜色 `ok`\|`wa`\|`er`\|`in`\|`pu` |

#### 2.4.3 学生缴费详情

```
GET /api/v1/payments/students/:studentId
需要Token: 是
```

**返回：**
```json
{
  "student": { "name": "...", "studentNo": "...", "college": "..." },
  "summary": { "receivableAmount": 5800, "paidAmount": 0, "unpaidAmount": 5800, "paymentStatus": "unpaid" },
  "bills": [{ "billId": "...", "itemName": "学费", "receivableAmount": 5000, "paidAmount": 0, "unpaidAmount": 5000, "priority": 1, "dueDate": "2026-05-20", "status": "unpaid" }],
  "records": [],
  "reminders": [],
  "refunds": [],
  "invoices": []
}
```

**调用方：** `pages/teacher/student-detail/index.vue:192`

#### 2.4.4 学生账单明细 / 缴费记录

```
GET /api/v1/payments/students/:studentId/bills
GET /api/v1/payments/students/:studentId/records
```

**业务闭环：** 学生详情页展示账单和缴费流水，班主任可据此判断是否需要催缴。

---

### 2.5 助学金审核

**涉及页面：**
- 教师端 `teacher/aid-review` — 初审 (pending → first_pass)
- 政务端 `government/aid-review` — 学院复审 (first_pass → review_pass)
- 政务端 `government/aid-final-review` — 学工处终审 (review_pass → final_pass)
- 财务端 `finance/aid-review` — 打款确认 (payment_pending → completed)

**状态流转：**
```
学生提交 → pending → [教师初审] → first_pass → [学院复审] → review_pass → [学工处终审] → final_pass/payment_pending → [财务打款] → completed
                                                                                                                            ↓
                                                                                                                        rejected（任意节点可驳回）
```

#### 2.5.1 助学金列表

```
GET /api/v1/scholarships?page=1&pageSize=20&tab=todo&role=teacher
需要Token: 是
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page/pageSize | Number | 分页 |
| keyword | String | 搜索 studentNo/studentName/name/applicationNo |
| status | String | 精确状态筛选 |
| tab | String | `todo`(pending) / `processing`(first_pass~payment_pending) / `done`(rejected/paid/completed) |
| role | String | 决定 tab 状态映射（teacher/government/finance） |
| studentId | String | 按学生筛选 |
| classId | String | 按班级筛选 |

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| scholarshipId | String | 申请ID |
| uid | String | 业务统一ID |
| applicationNo | String | 申请编号 |
| studentNo/studentName/name | String | 学生信息 |
| type | String | `国家助学金`\|`特殊困难助学金`\|`学校困难补助`\|`社会助学金` |
| amount | Number | 申请金额 |
| approvedAmount | Number\|null | 批准金额（pending 时为 null） |
| status | String | 状态值（见流转图） |
| submittedAt | String | 提交时间 |
| currentNode | String | 当前审批节点名称 |
| materials | Object[] | 佐证材料 [{ fileId, fileName, fileType, url, previewUrl }] |
| auditLogs | Object[] | 审核记录 [{ node, result, time, remark }] |
| payout | Object | 打款信息 { payoutRecordId, amount, payoutMethod, paidAt, operatorName } |
| statusLabel | String | 中文状态 |
| badgeColor | String | 状态色 `wa`\|`in`\|`pu`\|`ok`\|`er` |

#### 2.5.2 助学金详情

```
GET /api/v1/scholarships/:id
需要Token: 是
```

**返回：** 单条完整记录（含学生信息、材料、审核日志等所有字段）

**调用方：** 所有 4 个审核页 onLoad 时调用

#### 2.5.3 助学金批准

```
POST /api/v1/scholarships/:id/approve
需要Token: 是 · 角色: teacher/government
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| approvedAmount | Number | 否 | 批准金额，默认等于申请金额 |
| opinion | String | 否 | 审核意见 |
| remark | String | 否 | 审核备注（opinion 的别名） |
| targetStatus | String | 否 | 指定目标状态（政府端传 `REVIEW_STATUS.REVIEW_PASS` 或 `REVIEW_STATUS.FINAL_PASS`） |

**状态自动流转规则：**（不传 targetStatus 时）
- `pending` → `first_pass`（教师初审）
- `first_pass` → `review_pass`（学院复审）
- `review_pass` → `payment_pending`（学工处终审）

**返回：**
```json
{
  "bizType": "scholarship", "bizId": "aid-1",
  "oldStatus": "pending", "newStatus": "first_pass",
  "updatedAt": "2026-05-30T10:00:00.000Z",
  "auditLog": { "node": "教师初审", "result": "通过", "remark": "同意", "time": "..." },
  "statistics": { "total": 10, "statusCounts": {...}, "tabCounts": [...] }
}
```

**状态影响：** ✅ 是 — 状态推进，影响后续角色可看到该记录

**调用方：** 教师/政务/学工共 4 个审核页的 submit 方法

#### 2.5.4 助学金驳回

```
POST /api/v1/scholarships/:id/reject
需要Token: 是
```

**请求参数：**
| 参数 | 类型 | 必填 |
|------|------|------|
| rejectReason | String | 是 |

**返回：** 同批准结构，`newStatus: "rejected"`

#### 2.5.5 助学金打款

```
POST /api/v1/scholarships/:id/disburse
需要Token: 是 · 角色: finance
```

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| amount | Number | 否 | 打款金额，默认 approvedAmount |
| payoutMethod | String | 否 | 打款方式，默认 `"bank_transfer"` |
| remark | String | 否 | 备注 |

**返回：** 同批准结构 + `payoutRecordId`, `paidAt`, `messageSent: true`

**状态影响：** ✅ 是 — `payment_pending` → `completed`

---

### 2.6 助学贷款审核

**API 结构与助学金完全一致，端点前缀为 `/api/v1/loans/*`**

差异点：
- 贷款特有字段：`loanType`(`campus`\|`origin_place`), `receiptNo`, `receiptVerified`
- 打款后状态：`paid`（助学金为 `completed`）
- 标识符：`loanId`（助学金为 `scholarshipId`）

**API 清单：**
| API | 方法 | URL |
|-----|------|-----|
| 贷款列表 | GET | `/api/v1/loans` |
| 贷款详情 | GET | `/api/v1/loans/:id` |
| 贷款批准 | POST | `/api/v1/loans/:id/approve` |
| 贷款驳回 | POST | `/api/v1/loans/:id/reject` |
| 贷款打款 | POST | `/api/v1/loans/:id/disburse` |

**调用方：** `teacher/loan-review`, `government/loan-review`, `government/loan-final-review`, `finance/loan-review`

---

### 2.7 资料审核

**涉及页面：** `teacher/doc-review`（一次性审核，无多级流转）

**状态：** `pending` → `first_pass`（通过）/ `rejected`（驳回）

#### 2.7.1 资料审核列表

```
GET /api/v1/documents/reviews?page=1&pageSize=20&tab=pending
需要Token: 是 · 角色: teacher
```

**请求参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| page/pageSize | Number | 分页 |
| keyword | String | 搜索 studentNo/studentName/name |
| tab | String | `pending` / `passed` / `rejected` |

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| documentReviewId | String | 审核ID |
| uid | String | 统一ID |
| studentNo/studentName/name | String | 学生信息 |
| status | String | `pending`\|`first_pass`\|`department_review`\|`final_pass`\|`rejected` |
| submittedAt | String | 提交时间 |
| materialTags | String[] | 材料标签 `["身份证","录取通知书","户口本","证件照"]` |
| materials | Object[] | 材料文件 [{ fileId, fileName, fileType, url, previewUrl }] |
| rejectReason | String\|null | 驳回原因 |
| auditLogs | Object[] | 审核记录 |

#### 2.7.2 资料审核详情

```
GET /api/v1/documents/reviews/:id
```

#### 2.7.3 资料审核通过

```
POST /api/v1/documents/reviews/:id/approve
请求: { opinion?: string }
返回: { oldStatus, newStatus: "first_pass", auditLog }
```

#### 2.7.4 资料审核驳回

```
POST /api/v1/documents/reviews/:id/reject
请求: { rejectReason?: string }
返回: { oldStatus, newStatus: "rejected", auditLog }
```

---

### 2.8 宿舍管理

**涉及页面：**
- 教师端 `teacher/dorm-home` — 查看选宿情况
- 教师端 `teacher/dorm-detail` — 学生宿舍详情
- 教师端 `teacher/room-change-review` — 换宿初审
- 政务端 `government/dorm-review` — 换宿审批
- 政务端 `government/non-dorm-review` — 校外住宿审批

#### 2.8.1 换宿申请列表

```
GET /api/v1/dormitory/room-change-applications?page=1&pageSize=20
需要Token: 是
```

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| applicationId | String | 申请ID |
| uid | String | 统一ID |
| studentNo/studentName/name | String | 学生信息 |
| phone | String | 联系电话 |
| className | String | 班级 |
| oldDorm | String | 原宿舍（如 "3号楼 308室 4床"） |
| targetDorm | String | 目标宿舍 |
| reason | String | 换宿原因 |
| status | String | `pending`\|`approved`\|`rejected` |
| applyTime | String | 申请时间 |
| auditLogs | Object[] | 审核记录 |

#### 2.8.2 换宿申请详情

```
GET /api/v1/dormitory/room-change-applications/:id
```

#### 2.8.3 换宿批准/驳回

```
POST /api/v1/dormitory/room-change-applications/:id/approve
POST /api/v1/dormitory/room-change-applications/:id/reject
请求: { remark?: string }
返回: { applicationId, dormitoryChanged, diffOrderId, oldStatus, newStatus }
```

#### 2.8.4 退宿/校外住宿 API

退宿和校外住宿 API 结构与换宿相同，URL 前缀分别为：
- `/api/v1/dormitory/withdraw-applications/*`
- `/api/v1/dormitory/non-dorm-applications/*`

#### 2.8.5 宿舍分配相关

```
GET  /api/v1/dormitories/students              # 学生选宿列表
GET  /api/v1/dormitories/students/:studentId   # 学生选宿详情
GET  /api/v1/dormitories/buildings             # 楼栋列表
GET  /api/v1/dormitories/buildings/:id/rooms   # 房间列表
POST /api/v1/dormitory/assign                  # 分配宿舍
GET  /api/v1/dormitory/stats                   # 选宿统计
```

---

### 2.9 退费处理

**涉及页面：** `finance/refund` — 退费列表, `finance/refund-review` — 退费审核

**状态：** `pending` → `processing`（财务确认）→ `success`（退款到账）/ `failed`（退款失败）

#### 2.9.1 退费列表

```
GET /api/v1/refunds?page=1&pageSize=20&status=pending
需要Token: 是 · 角色: finance
```

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| refundId | String | 退费ID |
| uid | String | 统一ID |
| refundNo | String | 退费编号 |
| studentNo/studentName/name | String | 学生信息 |
| feeType/type | String | 退费类型 `退住宿费`\|`退教材费`\|`退军训服费` |
| reason | String | 退费原因 |
| amount | Number | 退费金额 |
| refundableAmount | Number | 可退金额上限 |
| status | String | `pending`\|`processing`\|`success`\|`failed` |
| applyTime | String | 申请时间 |
| failureReason | String\|null | 失败原因 |
| auditLogs | Object[] | 处理记录 |

#### 2.9.2 退费详情

```
GET /api/v1/refunds/:id
```

**调用方：** `finance/refund-review:153`

#### 2.9.3 退费操作

```
POST /api/v1/refunds/:id/approve   # 确认退费 → processing
POST /api/v1/refunds/:id/reject    # 驳回 → failed
POST /api/v1/refunds/:id/execute   # 执行退费 → success
POST /api/v1/refunds/:id/retry     # 重试退费 → processing
```

#### 2.9.4 补差退款

```
GET    /api/v1/refunds/diff              # 补差退款列表
POST   /api/v1/refunds/diff/:id/confirm  # 确认补差退款
```

**返回：** 退费字段 + `diffRefundId`, `diffOrderNo`, `oldDormFee`, `newDormFee`, `diffAmount`

#### 2.9.5 已处理记录

```
GET /api/v1/finance/processed-records?page=1&pageSize=20
需要Token: 是 · 角色: finance
```

**返回：** 助学金打款 + 贷款打款 + 退费处理 的汇总列表

---

### 2.10 报到确认

**涉及页面：** `teacher/checkin`, `finance/checkin`, `government/checkin`, `finance/verify`

**状态：** `pending` ↔ `checked_in` / `delayed` / `blocked`

#### 2.10.1 报到统计

```
GET /api/v1/checkin/statistics
返回: { total, checkedIn, unchecked, todayCheckedIn, checkinRate }
```

#### 2.10.2 报到学生列表

```
GET /api/v1/checkin/students?page=1&pageSize=20&keyword=张
```

**返回字段（列表每项）：**
| 字段 | 类型 | 说明 |
|------|------|------|
| checkinId | String | 报到记录ID |
| studentId/studentNo/studentName | String | 学生信息 |
| className | String | 班级 |
| paymentStatus | String | 缴费状态 |
| documentStatus | String | 资料审核状态 |
| dormText | String | 宿舍信息 |
| checkinStatus | String | `pending`\|`checked_in`\|`delayed`\|`blocked` |
| checkedInAt | String | 报到时间 |
| lastStatus | String | 显示用：`待报到`\|`已报到`\|`延期`\|`阻塞` |

#### 2.10.3 报到操作

```
POST /api/v1/checkin/students/:studentId/confirm    # 确认报到
POST /api/v1/checkin/students/:studentId/cancel     # 取消报到
POST /api/v1/checkin/students/:studentId/delay       # 延期报到
POST /api/v1/checkin/students/:studentId/block       # 阻塞报到

请求: { reason?: string, remark?: string, expectedCheckinDate?: string }
返回: { studentId, checkinStatus, checkedInAt, operatorName, statistics, oldStatus, newStatus }
```

---

### 2.11 催缴通知

**涉及页面：** `teacher/fee-home` — 批量催缴, `teacher/checkin` — 单个催缴

#### 2.11.1 发送催缴 / 批量催缴

```
POST /api/v1/reminders/send
请求: { studentId, billIds?, channels?: ['site','sms'], templateCode? }
返回: { reminderId, sentAt, sendResults: [{ channel, status }], urgeCount }

POST /api/v1/reminders/batch
请求: { studentIds: string[], channels?: ['site','sms'], scope?: string }
返回: { taskId, total, accepted, skipped, skippedReasons: [] }
```

#### 2.11.2 催缴任务列表 / 催缴记录

```
GET /api/v1/reminders/tasks?page=1&pageSize=20
GET /api/v1/reminders/records?page=1&pageSize=20
```

---

### 2.12 消息中心

```
GET    /api/v1/messages?role=teacher&page=1&pageSize=20     # 消息列表
GET    /api/v1/messages/unread-count?role=teacher            # 未读数
PUT    /api/v1/messages/:id/read                             # 标记已读
PUT    /api/v1/messages/read-all                              # 全部已读
DELETE /api/v1/messages/:id                                   # 删除单条
DELETE /api/v1/messages?role=teacher                          # 清空
GET    /api/v1/messages/templates                              # 模板列表
POST   /api/v1/messages/send                                  # 发送通知
```

**消息对象结构：**
```json
{ "messageId": "t-1", "type": "催缴提醒", "title": "...", "content": "...", "read": false, "bizType": "payment", "bizId": "pay-1", "createdAt": "2026-05-24 09:00" }
```

---

### 2.13 军训尺码

```
GET /api/v1/uniform/sizes?page=1&pageSize=50
GET /api/v1/uniform/sizes/:studentId
GET /api/v1/uniform/sizes/statistics
GET /api/v1/supplies/distribution-records?page=1&pageSize=20
```

**尺码记录：**
```json
{ "studentId": "stu-001", "studentNo": "2026010001", "studentName": "王明辉", "gender": "男", "className": "2026级1班", "clothingSize": "XL", "shoeSize": 43, "height": 178, "weight": 72, "remark": "", "status": "filled" }
```

---

### 2.14 线下收款

```
GET  /api/v1/finance/offline-payment/search-student?keyword=2026010001    # 搜索学生账单
GET  /api/v1/finance/offline-payment/student-bill?studentNo=2026010001    # 学生账单详情
POST /api/v1/finance/offline-payment/register                             # 登记线下收款
GET  /api/v1/finance/offline-payment/list?page=1&pageSize=20              # 线下收款列表
POST /api/v1/finance/offline-payment/confirm                              # 确认收款 { id, collectionType, remark, confirmedBy }
POST /api/v1/finance/offline-payment/void                                 # 作废收款 { id }
```

**线下收款记录：**
```json
{ "offlinePaymentId": "off-1", "studentNo": "2026010001", "studentName": "王明辉", "amount": 5800, "method": "现金缴纳", "location": "收款台1", "status": "pending", "statusLabel": "待确认", "badgeColor": "wa", "confirmTime": "", "receiptNo": "" }
```

**状态影响：** ✅ 是 — confirm 后学生缴费状态更新，void 后回退金额

---

### 2.15 票据管理

```
GET  /api/v1/invoices?page=1&pageSize=20
GET  /api/v1/invoices/:id
POST /api/v1/invoices                          # 开具票据
POST /api/v1/invoices/:id/reprint              # 补打票据
POST /api/v1/invoices/:id/void                 # 作废票据
```

**票据记录：**
```json
{ "invoiceId": "inv-001", "invoiceNo": "INV20260516001", "studentNo": "2026010001", "studentName": "王明辉", "itemName": "学费", "amount": 5800, "status": "issued", "issuedAt": "2026-05-16 09:00" }
```

---

### 2.16 现场核验

```
GET  /api/staff/checkin/payment/verify?keyword=2026010001     # 缴费核验
POST /api/staff/checkin/payment/verify-log                     # 记录核验日志
POST /api/staff/checkin/offline-payment                        # 现场收款登记
GET  /api/staff/checkin/payment/verify-logs?page=1&pageSize=20 # 核验日志查询
```

**核验结果：**
```json
{ "studentName": "王明辉", "studentNo": "2026010001", "receivableAmount": 5800, "paidAmount": 0, "unpaidAmount": 5800, "paymentStatus": "unpaid", "clearance": { "allowed": false, "label": "不允许放行", "color": "er", "reason": "未缴费" }, "checkedIn": false }
```

---

### 2.17 文件管理

```
POST /api/v1/files/upload         # 上传文件（multipart）
GET  /api/v1/files/:id/preview    # 预览文件
GET  /api/v1/files/:id/download   # 下载文件
POST /api/v1/files/package       # 批量打包
GET  /api/v1/materials/:bizType/:bizId   # 获取业务材料列表
```

---

### 2.18 数据导出

```
POST /api/v1/export/tasks                # 创建导出任务 { exportType }
GET  /api/v1/export/tasks/:taskId        # 查询任务进度
GET  /api/v1/export/tasks/:taskId/download # 下载导出文件
```

**报表 API：**
```
GET /api/v1/reports/payment/progress      # 缴费进度报表
GET /api/v1/reports/payment/transactions  # 缴费交易报表
GET /api/v1/reports/payment/methods       # 支付方式报表
GET /api/v1/reports/payment/trend         # 缴费趋势报表
GET /api/v1/reports/payment/arrears       # 欠费报表
GET /api/v1/reports/refunds               # 退费报表
GET /api/v1/reports/diff-refunds          # 补差退款报表
GET /api/v1/reports/dashboard             # 迎新大屏数据
```

---

### 2.19 绿色通道

绿色通道不是一个独立 API，而是缴费状态的一种特殊值。

**状态值：** `green_channel`（服务端原始值）→ `channel`（前端标准化后）

**涉及页面：**
- `teacher/fee-home` — 缴费列表第 4 个 tab "绿色通道"
- `teacher/student-detail` — 学生详情显示绿通标签（紫色 `pu`）
- `finance/verify` — 报到核验时绿通学生允许放行

**业务规则：**
- 绿通学生 `paidAmount` 视为已缴全额
- `dueAmount` = 0
- 报到核验 `clearance.allowed = true`（不需要实际缴费即可报到）
- Tab 颜色：`pu`（紫色）

**所需 API：** 使用标准缴费 API（`/api/v1/payments/*`），状态字段 `paymentStatus: "green_channel"`

---

## 三、状态流转图

### 3.1 助学金/贷款审核流程

```
┌─────────┐   教师审批    ┌────────────┐   学院复审    ┌─────────────┐   学工处终审   ┌──────────────────┐   财务打款    ┌─────────┐
│ pending │ ──────────> │ first_pass │ ──────────> │ review_pass │ ───────────> │ final_pass /      │ ──────────> │ paid /   │
│ (待审批) │             │ (初审通过)  │             │ (复审通过)   │              │ payment_pending   │             │ completed │
└────┬────┘             └─────┬──────┘             └──────┬──────┘              └────────┬─────────┘             └─────────┘
     │                        │                          │                              │
     └──────── 驳回 ──────────┴──────── 驳回 ────────────┴────────── 驳回 ──────────────┘
                                        ↓
                                   ┌──────────┐
                                   │ rejected │
                                   │ (已驳回)  │
                                   └──────────┘
```

### 3.2 宿舍申请流程

```
┌─────────┐   审批    ┌──────────┐
│ pending │ ───────> │ approved │
│ (待审核) │          │ (已通过)  │
└────┬────┘          └──────────┘
     │ 驳回
     ↓
┌──────────┐
│ rejected │
│ (已驳回)  │
└──────────┘
```

### 3.3 退费流程

```
┌─────────┐   确认退费    ┌────────────┐   执行退费    ┌─────────┐
│ pending │ ──────────> │ processing │ ──────────> │ success │
│ (待审核) │              │ (处理中)    │              │ (已退费)  │
└────┬────┘              └─────┬──────┘              └─────────┘
     │ 驳回                    │ 失败
     ↓                         ↓
┌──────────┐              ┌─────────┐
│ rejected │              │ failed  │
│ (已驳回)  │              │ (失败)   │──retry──> processing
└──────────┘              └─────────┘
```

### 3.4 报到状态

```
┌─────────┐   confirm   ┌────────────┐
│ pending │ ──────────> │ checked_in │
│ (待报到) │  <───────   │ (已报到)    │
└────┬────┘   cancel    └────────────┘
     │ delay
     ↓
┌─────────┐
│ delayed │
│ (延期)   │
└─────────┘
     │ block
     ↓
┌─────────┐
│ blocked │
│ (阻塞)   │
└─────────┘
```

### 3.5 缴费状态

```
┌─────────┐              ┌─────────┐              ┌─────────┐
│ unpaid  │ ─── 缴费 ──> │ partial │ ─── 缴清 ──> │  paid   │
│ (未缴)   │              │ (部分未缴)│              │ (已缴)   │
└────┬────┘              └─────────┘              └─────────┘
     │ 超期
     ↓
┌─────────┐
│ overdue │
│ (逾期)   │
└─────────┘

┌──────────────┐
│ green_channel │  ← 独立状态，无需缴费
│   (绿色通道)   │
└──────────────┘
```

---

## 四、API 依赖关系

### 4.1 登录依赖链

```
登录 → auth/me → resolveRole → applyTheme → 各端首页
                                ↓
                        后续 API 携带 token
```

### 4.2 审核详情页依赖链

```
审核列表页 → 点击记录 → navigateTo review 页
                         ↓
              onLoad: getDetail(id) ─── API
              onLoad: getReviewItem(id) ─── 本地兜底
                         ↓
              显示审核信息 + 进度条 + 操作按钮
                         ↓
              submit: approve/reject API ─── 异步
              updateReview ─── 本地立即更新
                         ↓
              navigateBack → 列表页 onShow 刷新
```

### 4.3 多角色审核依赖链

```
教师 approve → status: first_pass
                    ↓
学院负责人 刷新列表 → 可见 first_pass 记录 → approve → status: review_pass
                    ↓
学工处 刷新列表 → 可见 review_pass 记录 → approve → status: payment_pending
                    ↓
财务 刷新列表 → 可见 payment_pending 记录 → disburse → status: completed
```

### 4.4 数据同步依赖

```
mock API mutation → mock state 更新 (API 返回)
                  → businessState 更新 (本地立即同步)
                  → business-state-change 事件
                  → 其他页面 onShow 刷新
```

---

## 五、Mock 实现状态

### 5.1 已完全实现的 API

| 业务域 | API 数量 | 实现状态 |
|--------|---------|---------|
| 认证 | 11/11 | ✅ 密码/短信/微信登录，角色识别，权限返回 |
| 仪表盘 | 4/4 | ✅ 三端仪表盘 + 统计概览 |
| 学生 | 5/5 | ✅ 搜索/详情/班级列表 |
| 缴费 | 9/9 | ✅ 统计/列表/详情/账单/记录 |
| 助学金 | 5/5 | ✅ CRUD + 状态流转 + 打款 |
| 贷款 | 5/5 | ✅ CRUD + 状态流转 + 打款 |
| 资料审核 | 5/5 | ✅ CRUD + 材料预览 |
| 宿舍 | 14/14 | ✅ 分配/换宿/退宿/校外住宿 |
| 退费 | 9/9 | ✅ 审核/执行/重试/补差 |
| 报到 | 6/6 | ✅ 统计/列表/操作 |
| 催缴 | 6/6 | ✅ 发送/批量/记录 |
| 消息 | 10/10 | ✅ CRUD + 模板 |
| 校服 | 4/4 | ✅ 列表/详情/统计 |
| 线下收款 | 6/6 | ✅ 搜索/登记/确认/作废 |
| 票据 | 5/5 | ✅ CRUD |
| 现场核验 | 4/4 | ✅ 核验/日志 |
| 文件 | 5/5 | ✅ 上传/预览/下载 |
| 导出 | 3/3 | ✅ 异步任务模式 |
| 报表 | 8/8 | ✅ 7 种报表 |
| 账单 | 8/8 | ✅ CRUD |
| 配置 | 9/9 | ✅ 费项/标准管理 |
| **合计** | **141/141** | **✅ 全部实现** |

### 5.2 跨角色同步

Mock mutation 已同步写入 businessState（2026-05-30 改造完成）：

```
approveReview → bsUpdateReview()
rejectReview → bsUpdateReview()
disburse → bsMarkPayment()
mutateDormApplication → bsUpdateReview()
mutateRefund → bsUpdateRefund() + bsSyncRefund()
confirmOffline → bsConfirmOffline()
voidOffline → bsVoidOffline()
```

---

## 六、API TODO 清单

### 6.1 必须真实对接（优先级 P0 — 阻塞业务）

| # | API | 涉及页面数 | 原因 |
|---|-----|----------|------|
| 1 | `POST /api/v1/auth/login/password` | 1（登录页） | 无法登录则全部功能不可用 |
| 2 | `GET /api/v1/auth/me` | 4（3 个 settings + App.vue） | 角色识别、权限判断 |
| 3 | `GET /api/v1/scholarships` | 5（教师+政务+财务列表页） | 助学金审核流核心 |
| 4 | `GET /api/v1/scholarships/:id` | 4（审核详情页） | 查看申请详情 |
| 5 | `POST /api/v1/scholarships/:id/approve` | 4 | 审核流推进 |
| 6 | `POST /api/v1/scholarships/:id/reject` | 4 | 驳回操作 |
| 7 | `POST /api/v1/scholarships/:id/disburse` | 1 | 财务打款 |
| 8 | `GET /api/v1/loans` | 5 | 贷款审核流核心 |
| 9 | `GET /api/v1/loans/:id` | 4 | 查看申请详情 |
| 10 | `POST /api/v1/loans/:id/approve` | 4 | 审核流推进 |
| 11 | `POST /api/v1/loans/:id/reject` | 4 | 驳回操作 |
| 12 | `POST /api/v1/loans/:id/disburse` | 1 | 财务打款 |
| 13 | `GET /api/v1/documents/reviews` | 1 | 资料审核列表 |
| 14 | `GET /api/v1/documents/reviews/:id` | 1 | 资料审核详情 |
| 15 | `POST /api/v1/documents/reviews/:id/approve` | 1 | 资料审核通过 |
| 16 | `POST /api/v1/documents/reviews/:id/reject` | 1 | 资料审核驳回 |
| 17 | `GET /api/v1/dormitory/room-change-applications` | 2 | 换宿审核列表 |
| 18 | `GET /api/v1/dormitory/room-change-applications/:id` | 2 | 换宿审核详情 |
| 19 | `POST /api/v1/dormitory/room-change-applications/:id/approve` | 2 | 换宿批准 |
| 20 | `POST /api/v1/dormitory/room-change-applications/:id/reject` | 2 | 换宿驳回 |
| 21 | `GET /api/v1/checkin/students` | 3 | 报到管理 |
| 22 | `POST /api/v1/checkin/students/:id/confirm` | 3 | 确认报到 |
| 23 | `GET /api/v1/refunds` | 1 | 退费列表 |
| 24 | `GET /api/v1/refunds/:id` | 1 | 退费详情 |
| 25 | `POST /api/v1/refunds/:id/approve` | 1 | 确认退费 |
| 26 | `POST /api/v1/refunds/:id/reject` | 1 | 驳回退费 |
| 27 | `GET /api/v1/payments/students` | 2 | 缴费管理 |
| 28 | `GET /api/v1/payments/class-stats` | 1 | 缴费统计 |
| 29 | `GET /api/v1/students/:id` | 1 | 学生详情 |
| 30 | `GET /api/v1/dashboard/teacher` | 1 | 教师首页 |
| 31 | `GET /api/v1/dashboard/finance` | 1 | 财务首页 |
| 32 | `GET /api/v1/dashboard/government` | 1 | 政务首页 |

### 6.2 建议真实对接（优先级 P1 — 影响体验）

| # | API | 原因 |
|---|-----|------|
| 33 | `POST /api/v1/reminders/batch` | 批量催缴 |
| 34 | `POST /api/v1/reminders/send` | 单个催缴 |
| 35 | `GET /api/v1/messages` | 消息中心 |
| 36 | `GET /api/v1/messages/unread-count` | 消息未读数（首页红点） |
| 37 | `PUT /api/v1/messages/read-all` | 消息全部已读 |
| 38 | `GET /api/v1/uniform/sizes` | 尺码管理 |
| 39 | `GET /api/v1/finance/offline-payment/list` | 线下收款列表 |
| 40 | `POST /api/v1/finance/offline-payment/confirm` | 确认线下收款 |
| 41 | `POST /api/v1/finance/offline-payment/void` | 作废线下收款 |
| 42 | `GET /api/v1/refunds/diff` | 补差退款列表 |
| 43 | `POST /api/v1/refunds/diff/:id/confirm` | 确认补差退款 |
| 44 | `GET /api/v1/finance/processed-records` | 已处理记录 |
| 45 | `GET /api/v1/government/stats/global` | 全局统计 |
| 46 | `POST /api/v1/export/tasks` | 数据导出 |

### 6.3 可选后端实现（优先级 P2 — 增强功能）

| # | API | 原因 |
|---|-----|------|
| 47 | 认证辅助（refresh/switch/logout/sms/bind/changePassword/changePhone） | 设置中心功能 |
| 48 | 宿舍分配（buildings/rooms/assign/stats） | 宿舍管理后台 |
| 49 | 退宿/校外住宿（withdraw/non-dorm API） | 少数场景 |
| 50 | 文件上传/预览/下载 | 佐证材料管理 |
| 51 | 票据管理（invoices） | 财务票据 |
| 52 | 报表（reports 7 种） | 数据大屏 |
| 53 | 配置管理（config） | 费项标准配置 |
| 54 | 账单管理（bill） | 账单 CRUD |
| 55 | 现场核验（onsiteStaff） | 报到现场扫码 |

### 6.4 对按时需注意的关键点

1. **状态自动流转规则**必须与前端一致：
   - `pending → first_pass → review_pass → payment_pending → completed/paid`
   - 文档审核直接 `pending → first_pass`（无多级流转）
   - 宿舍申请 `pending → approved/rejected`（无中间状态）

2. **角色权限校验**：approve/disburse 需验证角色
   - 教师只能推进到 first_pass
   - 学院负责人只能推进到 review_pass
   - 学工处才能推进到 final_pass/payment_pending
   - 财务才能执行 disburse

3. **跨角色状态同步**：前端列表页使用 `businessState` 本地存储作为数据源，后端需保证 API 返回的状态与前端本地一致（当前 mock 已实现双写）

4. **分页规范**：所有列表 API 需支持 `page/pageSize` 和 `keyword`，返回格式 `{ list, total, page, pageSize }`

5. **Student 信息嵌入**：审核详情 API 需内嵌学生基本信息（姓名、学号、班级、学院、电话），前端不做二次查询

6. **审核日志**：每次状态变更需返回 `auditLog { node, result, time, remark }`
