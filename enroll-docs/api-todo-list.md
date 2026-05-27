# API 需求清单（教职工端）

本文档基于当前项目的页面路由、组件、store、service、mock/businessState 与 `enroll-docs` 需求文档整理，目标是给后端/API 同学讨论教职工端（教师端、财务端、政务端）迎新收费管理系统接口设计。当前前端中一部分页面已存在 `/api/v1/*` service 雏形，另一部分页面仍使用本地模拟数据；本文按完整业务闭环补齐接口需求。

## 1. 总体约定

### 1.1 baseURL 建议

- 管理端业务 API：`https://{host}/api/v1`
- 文件资源 API：`https://{host}/api/v1/files`
- 导出任务 API：`https://{host}/api/v1/export`
- 鉴权 API：`https://{host}/api/v1/auth`

当前项目配置中 `globalConfig.endpoint` 指向 `https://house.cloud.smallsaas.cn`，现有旧接口包含 `/api/oauth/wxapp/login`、`/api/u/login` 等。建议新教师/财务/政务端统一迁移到 `/api/v1`。

### 1.2 鉴权方式

- 使用 JWT Bearer Token。
- 登录成功后返回 `accessToken`、`refreshToken`、过期时间、用户信息、角色列表。
- 前端已有 `tokenStorageKey: "token"`，请求封装默认从本地存储读取 token 并放入 `Authorization`。
- 后端需要在 JWT claims 或 `/auth/me` 中返回 `type`、`typeList`/`roles`，用于自动识别角色跳转。

### 1.3 token 传递方式

```http
Authorization: Bearer <accessToken>
```

刷新 token：

- access token 过期返回 `401` 与明确错误码。
- 前端调用刷新接口成功后重放原请求。
- refresh token 过期或失效时跳转登录页。

### 1.4 通用请求头

| Header | 必填 | 说明 |
| --- | --- | --- |
| `Authorization` | 登录后必填 | `Bearer <accessToken>` |
| `Content-Type` | 是 | JSON 请求为 `application/json;charset=UTF-8`；文件上传为 `multipart/form-data` |
| `X-Request-Id` | 否 | 前端生成链路 ID，后端也可返回 |
| `X-App-Id` | 是 | 应用 ID，当前配置为 `1` |
| `X-Client-Type` | 是 | `h5`、`mp-weixin`、`pc` |
| `X-Role` | 否 | 当前使用角色，取值见角色枚举；多角色切换时建议传递 |

### 1.5 通用返回结构

建议统一 `code=0` 表示成功；若兼容旧接口 `code=200`，需由网关或前端适配层统一。

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1710000000000,
  "requestId": "req_xxx"
}
```

### 1.6 通用分页结构

请求参数建议统一：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `pageNum` | number | 否 | 页码，从 1 开始 |
| `pageSize` | number | 否 | 每页数量，默认 20 |
| `keyword` | string | 否 | 学号、姓名、手机号等模糊搜索 |
| `sortBy` | string | 否 | 排序字段 |
| `sortOrder` | string | 否 | `asc`、`desc` |

返回结构：

```json
{
  "items": [],
  "pageNum": 1,
  "pageSize": 20,
  "total": 100,
  "pages": 5,
  "hasNext": true
}
```

### 1.7 通用错误结构

```json
{
  "code": 40001,
  "message": "参数错误",
  "error": {
    "type": "VALIDATION_ERROR",
    "details": [
      {
        "field": "studentId",
        "reason": "不能为空"
      }
    ]
  },
  "timestamp": 1710000000000,
  "requestId": "req_xxx"
}
```

常见错误码建议：

| code | 含义 |
| --- | --- |
| `0` | 成功 |
| `40001` | 参数校验失败 |
| `40100` | 未登录或 token 失效 |
| `40300` | 无角色/数据权限 |
| `40400` | 资源不存在 |
| `40900` | 状态冲突，例如重复审批、状态已变化 |
| `42900` | 操作过于频繁，例如验证码或催缴 |
| `50000` | 服务端异常 |

### 1.8 角色枚举

| 前端角色 | 后端 type 建议 | 说明 | 默认首页 |
| --- | --- | --- | --- |
| `student` | `1` | 学生 | 学生端，不在本教职工端范围内 |
| `teacher` | `2` | 班主任/教师 | `/pages/teacher/home/index` |
| `finance` | `3` | 财务职工 | `/pages/finance/home/index` |
| `admin` | `4` | 管理员 | 当前前端临时跳财务首页 |
| `government` | `5` | 政务/学工审批人员 | `/pages/government/home/index` |

多角色用户返回 `roles` 或 `typeList`，前端按 `government > admin > finance > teacher > student` 默认识别，也需要支持用户手动切换角色。

### 1.9 状态枚举

#### 缴费状态 `paymentStatus`

| 值 | 说明 |
| --- | --- |
| `unpaid` | 未缴 |
| `partial` | 部分未缴 |
| `paid` | 已缴清 |
| `overdue` | 逾期 |
| `green_channel` | 绿色通道 |
| `refunded` | 已退款/有退款 |

#### 通用审批状态 `reviewStatus`

| 值 | 说明 |
| --- | --- |
| `pending` | 待初审 |
| `first_pass` | 初审通过 |
| `review_pass` | 复审通过 |
| `final_pass` | 终审通过 |
| `payment_pending` | 待财务打款/发放 |
| `paid` | 已打款 |
| `completed` | 已完成 |
| `rejected` | 已驳回 |

#### 资料状态 `materialStatus`

| 值 | 说明 |
| --- | --- |
| `pending` | 待审核 |
| `first_pass` | 初审通过 |
| `department_review` | 院系/政务复审中 |
| `final_pass` | 已通过 |
| `rejected` | 已退回 |

#### 住宿审批状态 `dormReviewStatus`

| 值 | 说明 |
| --- | --- |
| `pending` | 待审核 |
| `approved` | 已通过 |
| `rejected` | 已驳回 |

#### 退款状态 `refundStatus`

| 值 | 说明 |
| --- | --- |
| `pending` | 待财务审核 |
| `approved` | 已通过/待执行 |
| `processing` | 退款处理中 |
| `refunded` | 已退款 |
| `failed` | 退款失败，仅财务可见失败原因 |
| `rejected` | 已驳回 |

#### 消息状态 `messageStatus`

| 值 | 说明 |
| --- | --- |
| `unread` | 未读 |
| `read` | 已读 |
| `deleted` | 用户侧删除 |

### 1.10 文件资源访问方式

- 文件上传统一使用 `POST /files/upload`，返回 `fileId`、`url`、`previewUrl`。
- 页面预览材料不应直接依赖永久公网 URL，建议先通过 `GET /files/{fileId}/preview-token` 获取短期签名 URL。
- 下载通过 `GET /files/{fileId}/download`，后端返回文件流或 302 到签名 URL。
- 文件权限必须按业务对象校验，例如教师只能预览本班学生材料，财务只能看打款/退款相关材料。

### 1.11 导出接口返回方式

导出建议使用异步任务，避免大数据量超时。

1. `POST /export/tasks` 创建导出任务，返回 `taskId`。
2. `GET /export/tasks/{taskId}` 查询进度。
3. `GET /export/tasks/{taskId}/download` 下载导出文件。

小数据量可支持同步导出，但仍建议返回：

```json
{
  "taskId": "exp_001",
  "status": "finished",
  "fileId": "file_001",
  "downloadUrl": "https://...",
  "expiresAt": "2026-05-24T12:00:00+08:00"
}
```

## 2. 登录鉴权与角色跳转

### 2.1 密码登录

`POST /auth/login/password`

用于教师、财务、政务账号密码登录。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `account` | string | 是 | 工号、手机号、用户名 |
| `password` | string | 是 | 密码 |
| `clientType` | string | 是 | `h5`、`mp-weixin` |
| `appId` | number/string | 是 | 应用 ID |

返回字段 `data`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `accessToken` | string | 访问 token |
| `refreshToken` | string | 刷新 token |
| `expiresIn` | number | access token 有效秒数 |
| `user` | object | 当前用户信息 |
| `user.userId` | string | 用户 ID |
| `user.name` | string | 姓名 |
| `user.avatar` | string | 头像 URL |
| `user.phone` | string | 手机号 |
| `user.workNo` | string | 工号 |
| `user.roles` | array | `teacher`、`finance`、`government` 等 |
| `user.typeList` | array | 兼容前端已有 typeList |
| `user.orgId` | string | 学校/机构 ID |
| `user.orgName` | string | 学校/机构名称 |
| `user.departmentId` | string | 部门/院系 ID |
| `user.departmentName` | string | 部门/院系名称 |
| `defaultRole` | string | 后端建议默认角色 |
| `homePage` | string | 建议跳转页面 |
| `permissions` | array | 按钮/数据权限码 |

### 2.2 发送短信验证码

`POST /auth/sms-code`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `phone` | string | 是 | 手机号 |
| `scene` | string | 是 | `login`、`bind_phone`、`change_phone_old`、`change_phone_new` |
| `captchaToken` | string | 否 | 图形/行为验证码结果 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `smsToken` | string | 本次验证码会话 token |
| `expireSeconds` | number | 过期秒数 |
| `cooldownSeconds` | number | 再次发送冷却时间 |

### 2.3 短信登录

`POST /auth/login/sms`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `phone` | string | 是 | 手机号 |
| `code` | string | 是 | 验证码 |
| `smsToken` | string | 否 | 发送验证码返回的 token |
| `clientType` | string | 是 | 客户端类型 |
| `appId` | number/string | 是 | 应用 ID |

返回同密码登录。

### 2.4 微信小程序登录

`POST /auth/login/wechat-miniapp`

兼容当前旧接口 `/api/oauth/wxapp/login`。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | `uni.login` 返回 code |
| `appId` | number/string | 是 | 应用 ID |
| `inviteCode` | string | 否 | 邀请码 |
| `orgId` | string | 否 | 机构 ID |
| `clientType` | string | 是 | `mp-weixin` |

返回同密码登录，额外返回 `openId`、`unionId`。

### 2.5 获取当前用户与角色权限

`GET /auth/me`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `userId` | string | 用户 ID |
| `name` | string | 姓名 |
| `avatar` | string | 头像 |
| `phone` | string | 手机号，脱敏可另给 `maskedPhone` |
| `workNo` | string | 工号 |
| `roles` | array | 可用角色 |
| `currentRole` | string | 当前角色 |
| `roleScopes` | array | 角色数据范围，如班级、院系 |
| `permissions` | array | 权限码 |
| `orgId` | string | 机构 ID |
| `departmentId` | string | 部门 ID |

### 2.6 切换当前角色

`POST /auth/switch-role`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role` | string | 是 | 目标角色 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `accessToken` | string | 可选，新 token 中写入当前角色 |
| `currentRole` | string | 当前角色 |
| `homePage` | string | 跳转首页 |
| `permissions` | array | 当前角色权限 |

### 2.7 登出

`POST /auth/logout`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `refreshToken` | string | 否 | 后端用于拉黑 refresh token |

返回 `true`。

### 2.8 刷新 Token

`POST /auth/refresh`

用于 access token 过期后的无感续期，刷新成功后前端使用新 `accessToken` 重放原请求。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `refreshToken` | string | 是 | 登录或上次刷新返回的 refresh token |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `accessToken` | string | 新访问 token |
| `refreshToken` | string | 可选，新 refresh token；若后端不轮换可返回原值 |
| `expiresIn` | number | access token 有效秒数 |

### 2.9 绑定/修改手机号、修改密码

`POST /account/phone/bind`、`PUT /account/phone`、`PUT /account/password`

绑定手机号请求：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `phone` | string | 是 | 新手机号 |
| `code` | string | 是 | 验证码 |
| `smsToken` | string | 否 | 验证码会话 |

修改手机号请求：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `oldCode` | string | 是 | 当前手机号验证码 |
| `newPhone` | string | 是 | 新手机号 |
| `newCode` | string | 是 | 新手机号验证码 |
| `oldSmsToken` | string | 否 | 当前手机号验证码会话 |
| `newSmsToken` | string | 否 | 新手机号验证码会话 |

修改密码请求：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `oldPassword` | string | 是 | 原密码 |
| `newPassword` | string | 是 | 新密码 |

## 3. 工作台与状态统计

### 3.1 教师端首页

`GET /dashboard/teacher`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `classId` | string | 否 | 班级 ID，不传取当前教师默认班级 |
| `termId` | string | 否 | 学年/批次 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `teacher` | object | 教师姓名、头像、院系、班级、工号 |
| `classStats.totalStudents` | number | 班级总人数 |
| `classStats.checkedIn` | number | 已报到 |
| `classStats.unchecked` | number | 未报到 |
| `classStats.checkinRate` | number | 报到率 |
| `todo.docPending` | number | 资料待初审 |
| `todo.aidPending` | number | 助学金待处理 |
| `todo.loanPending` | number | 助学贷款待处理 |
| `todo.feeOverdue` | number | 缴费逾期 |
| `todo.roomChangePending` | number | 换宿待审 |
| `todo.dormWithdrawPending` | number | 退宿待审 |
| `todo.nonDormPending` | number | 校外住宿待审 |
| `unreadCount` | number | 未读消息数 |
| `quickEntries` | array | 首页快捷入口，含 `key`、`label`、`url`、`count` |

### 3.2 财务端首页

`GET /dashboard/finance`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `termId` | string | 否 | 学年/批次 |
| `date` | string | 否 | 统计日期，默认今天 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `todayReceivedAmount` | number | 今日实收金额 |
| `paidStudentCount` | number | 已缴人数 |
| `unpaidStudentCount` | number | 未缴人数 |
| `refundPendingCount` | number | 退款待审 |
| `todo.aidPayoutPending` | number | 待打款助学金 |
| `todo.loanPayoutPending` | number | 待打款助学贷款 |
| `todo.refundPending` | number | 退款待处理 |
| `todo.processedCount` | number | 已处理记录 |
| `unreadCount` | number | 未读消息数 |

### 3.3 政务端首页

`GET /dashboard/government`

请求参数同财务端。

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `todayCheckinCount` | number | 今日报到人数 |
| `checkedInCount` | number | 已报到 |
| `uncheckedCount` | number | 待报到 |
| `checkinRate` | number | 报到率 |
| `todo.roomChangePending` | number | 换房审批待处理 |
| `todo.aidReviewPending` | number | 助学金复审待处理 |
| `todo.loanReviewPending` | number | 助学贷款复审待处理 |
| `todo.applicationPending` | number | 综合申请待处理 |
| `unreadCount` | number | 未读消息数 |

### 3.4 通用状态统计

`GET /statistics/summary`

用于页面状态统计、Tab 数量、审批处理后刷新。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bizType` | string | 是 | `payment`、`document`、`scholarship`、`loan`、`refund`、`room_change`、`dorm_withdraw`、`non_dorm`、`checkin`、`uniform` |
| `role` | string | 否 | 当前角色 |
| `classId` | string | 否 | 班级 |
| `departmentId` | string | 否 | 院系 |
| `termId` | string | 否 | 学年/批次 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `total` | number | 总数 |
| `statusCounts` | object | 按状态计数 |
| `tabCounts` | array | 前端 Tab 使用，含 `key`、`label`、`count` |
| `updatedAt` | string | 统计更新时间 |

## 4. 学生与班级基础数据

### 4.1 搜索学生

`GET /students/search`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `keyword` | string | 否 | 学号、姓名、手机号 |
| `classId` | string | 否 | 班级 |
| `departmentId` | string | 否 | 院系 |
| `paymentStatus` | string | 否 | 缴费状态 |
| `checkinStatus` | string | 否 | 报到状态 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]` 字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `studentId` | string | 学生 ID |
| `studentNo` | string | 学号 |
| `name` | string | 姓名 |
| `gender` | string | 性别 |
| `college` | string | 学院 |
| `major` | string | 专业 |
| `classId` | string | 班级 ID |
| `className` | string | 班级名称 |
| `phone` | string | 手机号 |
| `parentPhone` | string | 家长手机号 |
| `idNoMasked` | string | 脱敏身份证号 |
| `dormText` | string | 宿舍显示 |
| `paymentStatus` | string | 缴费状态 |
| `checkinStatus` | string | 报到状态 |

### 4.2 获取班级学生列表

`GET /classes/{classId}/students`

请求参数同搜索，默认限制为当前教师有权限的班级。

返回同学生搜索。

### 4.3 学生详情

`GET /students/{studentId}`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `studentId`、`studentNo`、`name` | string | 基础身份 |
| `gender`、`idNoMasked`、`phone`、`parentPhone` | string | 联系与身份 |
| `college`、`major`、`className` | string | 学籍 |
| `address` | string | 家庭住址 |
| `dormitory` | object | 宿舍楼、房间、床位 |
| `paymentSummary` | object | 应缴、已缴、欠费、状态、催缴次数 |
| `documentSummary` | object | 资料提交与审核状态 |
| `aidSummary` | object | 助学金状态 |
| `loanSummary` | object | 助学贷款状态 |
| `checkin` | object | 报到状态、报到时间、确认人 |
| `auditLogs` | array | 关键业务流水 |

## 5. 缴费管理 / 催缴

### 5.1 班级缴费统计

`GET /payments/class-stats`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `classId` | string | 否 | 默认当前教师班级 |
| `termId` | string | 否 | 学年/批次 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `totalStudents` | number | 总人数 |
| `paidCount` | number | 已缴 |
| `unpaidCount` | number | 未缴 |
| `partialCount` | number | 部分未缴 |
| `overdueCount` | number | 逾期 |
| `greenChannelCount` | number | 绿色通道 |
| `totalReceivableAmount` | number | 应收 |
| `totalPaidAmount` | number | 已收 |
| `totalUnpaidAmount` | number | 欠费 |

### 5.2 学生缴费列表

`GET /payments/students`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `classId` | string | 否 | 班级 |
| `status` | string | 否 | `all`、`paid`、`unpaid`、`partial`、`overdue`、`green_channel` |
| `keyword` | string | 否 | 学号/姓名 |
| `onlyUrgeable` | boolean | 否 | 是否只看可催缴 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `studentId` | string | 学生 ID |
| `studentNo` | string | 学号 |
| `name` | string | 姓名 |
| `className` | string | 班级 |
| `receivableAmount` | number | 应缴金额 |
| `paidAmount` | number | 已缴金额 |
| `unpaidAmount` | number | 未缴金额 |
| `paymentStatus` | string | 缴费状态 |
| `statusLabel` | string | 状态文案 |
| `dueDate` | string | 截止日期 |
| `overdueDays` | number | 逾期天数 |
| `urgeCount` | number | 已催缴次数 |
| `lastUrgeAt` | string | 最近催缴时间 |
| `canUrge` | boolean | 是否可催缴 |

### 5.3 学生缴费详情

`GET /payments/students/{studentId}`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `student` | object | 学生基础信息 |
| `summary` | object | 应缴、已缴、减免、欠费、状态 |
| `bills` | array | 账单明细 |
| `records` | array | 缴费记录 |
| `reminders` | array | 催缴记录 |
| `refunds` | array | 退款记录 |
| `invoices` | array | 票据记录 |

`bills[]` 字段：`billId`、`billNo`、`itemName`、`itemType`、`receivableAmount`、`paidAmount`、`discountAmount`、`unpaidAmount`、`priority`、`dueDate`、`status`。

`records[]` 字段：`recordId`、`paymentNo`、`amount`、`method`、`channel`、`paidAt`、`operatorName`、`invoiceId`、`sourceType`。

### 5.4 账单明细

`GET /payments/students/{studentId}/bills`

用于学生详情中的账单明细单独刷新。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `termId` | string | 否 | 学年/批次 |
| `status` | string | 否 | 账单状态 |

返回字段同 `bills[]`。

### 5.5 缴费记录

`GET /payments/students/{studentId}/records`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `termId` | string | 否 | 学年/批次 |
| `startDate`/`endDate` | string | 否 | 支付时间范围 |

返回字段同 `records[]`。

### 5.6 发送单个催缴

`POST /reminders/send`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `studentId` | string | 是 | 学生 ID |
| `billIds` | array | 否 | 指定账单，不传则催缴全部欠费 |
| `channels` | array | 否 | `sms`、`wechat`、`site` |
| `templateCode` | string | 否 | 模板编码 |
| `remark` | string | 否 | 操作备注 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `reminderId` | string | 催缴记录 ID |
| `sentAt` | string | 发送时间 |
| `sendResults` | array | 各渠道发送结果 |
| `urgeCount` | number | 学生/账单累计催缴次数 |

### 5.7 批量催缴

`POST /reminders/batch`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `studentIds` | array | 是 | 学生 ID 列表 |
| `scope` | string | 否 | `selected`、`all_unpaid`、`current_filter` |
| `filter` | object | 否 | 使用当前筛选条件批量发送时传递 |
| `channels` | array | 是 | 通知渠道 |
| `templateCode` | string | 否 | 模板 |
| `remark` | string | 否 | 备注 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `taskId` | string | 批量催缴任务 ID |
| `total` | number | 目标数 |
| `accepted` | number | 已受理 |
| `skipped` | number | 跳过数，例如已缴、绿色通道、频控 |
| `skippedReasons` | array | 跳过原因 |

### 5.8 催缴任务列表

`GET /reminders/tasks`

请求参数：`status`、`creatorId`、`startDate`、`endDate`、分页。

返回 `items[]`：`taskId`、`taskName`、`channels`、`targetCount`、`sentCount`、`failedCount`、`status`、`createdBy`、`createdAt`、`finishedAt`。

### 5.9 催缴记录

`GET /reminders/records`

请求参数：`studentId`、`billId`、`taskId`、`channel`、`sendStatus`、分页。

返回 `items[]`：`reminderId`、`studentId`、`studentNo`、`studentName`、`billId`、`amount`、`channel`、`templateCode`、`sendStatus`、`failureReason`、`sentAt`、`operatorName`。

## 6. 财务收款、退款、补差、票据

### 6.1 待确认线下收款列表

`GET /payments/offline/pending`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | string | 否 | `pending`、`confirmed`、`rejected` |
| `keyword` | string | 否 | 学号/姓名/流水号 |
| `startDate`/`endDate` | string | 否 | 提交时间 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `offlinePaymentId` | string | 线下收款 ID |
| `studentId`、`studentNo`、`studentName` | string | 学生信息 |
| `amount` | number | 金额 |
| `method` | string | `cash`、`bank_transfer`、`pos` |
| `location` | string | 收款地点/窗口 |
| `submittedAt` | string | 提交时间 |
| `voucherFiles` | array | 凭证文件 |
| `status` | string | 状态 |

### 6.2 确认线下收款

`POST /payments/offline/{offlinePaymentId}/confirm`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `confirmedAmount` | number | 是 | 确认金额 |
| `billAllocations` | array | 否 | 分配到账单明细，空则后端按优先级分配 |
| `remark` | string | 否 | 备注 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `paymentRecordId` | string | 缴费记录 ID |
| `paymentStatus` | string | 学生最新缴费状态 |
| `billStatuses` | array | 账单最新状态 |
| `invoiceId` | string | 自动生成票据 ID |

### 6.3 退款列表

`GET /refunds`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | string | 否 | `pending`、`approved`、`processing`、`refunded`、`failed`、`rejected` |
| `keyword` | string | 否 | 学号/姓名/退款单号 |
| `feeType` | string | 否 | 费用类型 |
| `startDate`/`endDate` | string | 否 | 申请时间 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `refundId` | string | 退款申请 ID |
| `refundNo` | string | 退款单号 |
| `studentId`、`studentNo`、`studentName` | string | 学生 |
| `feeType` | string | 费用类型 |
| `reason` | string | 申请原因 |
| `amount` | number | 退款金额 |
| `refundableAmount` | number | 可退上限 |
| `status` | string | 退款状态 |
| `applyTime` | string | 申请时间 |
| `failureReason` | string | 失败原因，仅财务可见 |

### 6.4 退款详情

`GET /refunds/{refundId}`

返回字段：退款申请、学生信息、原缴费记录、关联账单、凭证材料、审批/执行日志、第三方退款流水、失败原因。

### 6.5 退款审批/执行/重试

- `POST /refunds/{refundId}/approve`
- `POST /refunds/{refundId}/reject`
- `POST /refunds/{refundId}/execute`
- `POST /refunds/{refundId}/retry`

审批请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `opinion` | string | 否 | 审批意见 |
| `approvedAmount` | number | 通过时必填 | 审批金额 |
| `rejectReason` | string | 驳回时必填 | 驳回原因 |

执行/重试请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `refundMethod` | string | 否 | `original_route`、`offline_transfer` |
| `accountInfo` | object | 否 | 线下转账账户信息 |
| `remark` | string | 否 | 备注 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `refundId` | string | 退款 ID |
| `status` | string | 最新状态 |
| `billStatusChanged` | boolean | 是否联动账单 |
| `messageSent` | boolean | 是否发送通知 |
| `updatedAt` | string | 更新时间 |

### 6.6 补差退款列表与确认

- `GET /refunds/diff`
- `POST /refunds/diff/{diffRefundId}/confirm`

列表请求参数：`status`、`studentId`、`keyword`、`dormChangeId`、分页。

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `diffRefundId` | string | 补差退款 ID |
| `diffOrderNo` | string | 补差单号 |
| `studentNo`、`studentName` | string | 学生 |
| `oldDormFee` | number | 原住宿费 |
| `newDormFee` | number | 新住宿费 |
| `diffAmount` | number | 差额，负数表示应退 |
| `refundAmount` | number | 应退金额 |
| `status` | string | 状态 |
| `deadline` | string | 补缴截止日期，如适用 |

确认请求参数：`refundMethod`、`remark`、`accountInfo`。

### 6.7 已处理记录

`GET /finance/processed-records`

用于财务端“已处理记录”聚合助学金打款、贷款打款、退款处理。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bizType` | string | 否 | `scholarship`、`loan`、`refund` |
| `startDate`/`endDate` | string | 否 | 处理时间 |
| `keyword` | string | 否 | 学号/姓名/单号 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：`recordId`、`bizType`、`bizId`、`studentNo`、`studentName`、`amount`、`status`、`processedAt`、`operatorName`、`summary`。

### 6.8 票据列表、详情、补打、作废

- `GET /invoices`
- `GET /invoices/{invoiceId}`
- `POST /invoices`
- `POST /invoices/{invoiceId}/reprint`
- `POST /invoices/{invoiceId}/void`

列表请求参数：`studentId`、`invoiceNo`、`status`、`startDate`、`endDate`、分页。

票据字段：`invoiceId`、`invoiceNo`、`studentNo`、`studentName`、`amount`、`paymentMethod`、`issuedAt`、`status`、`reprintCount`、`fileId`、`verifyQrCodeUrl`。

作废请求参数：`reason`、`operatorPassword` 或 `smsCode`。

## 7. 资料审核与材料预览

### 7.1 资料审核列表

`GET /documents/reviews`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `status` | string | 否 | `pending`、`first_pass`、`department_review`、`final_pass`、`rejected` |
| `tab` | string | 否 | `pending`、`passed`、`rejected` |
| `classId` | string | 否 | 班级 |
| `keyword` | string | 否 | 学号/姓名 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `documentReviewId` | string | 审核记录 ID |
| `studentId`、`studentNo`、`studentName` | string | 学生 |
| `className`、`college`、`major` | string | 学籍 |
| `status` | string | 资料状态 |
| `statusLabel` | string | 状态文案 |
| `submittedAt` | string | 提交时间 |
| `materialTags` | array | 已提交材料类型 |
| `rejectReason` | string | 退回原因 |

### 7.2 资料审核详情

`GET /documents/reviews/{documentReviewId}`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `documentReviewId` | string | 审核 ID |
| `student` | object | 学生完整信息 |
| `status` | string | 当前状态 |
| `materials` | array | 材料文件列表 |
| `materials[].materialType` | string | `id_card`、`admission_notice`、`household_register`、`photo` 等 |
| `materials[].fileId` | string | 文件 ID |
| `materials[].fileName` | string | 文件名 |
| `materials[].previewable` | boolean | 是否可预览 |
| `materials[].downloadable` | boolean | 是否可下载 |
| `auditLogs` | array | 审核流水 |
| `canApprove` | boolean | 当前用户是否可通过 |
| `canReject` | boolean | 当前用户是否可驳回 |

### 7.3 资料审核通过/驳回

- `POST /documents/reviews/{documentReviewId}/approve`
- `POST /documents/reviews/{documentReviewId}/reject`

通过请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `opinion` | string | 否 | 审核意见 |
| `targetStatus` | string | 否 | 不传由后端按流程推进，例如 `first_pass` |

驳回请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `rejectReason` | string | 是 | 退回原因 |
| `rejectMaterialTypes` | array | 否 | 需重传材料类型 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `documentReviewId` | string | 审核 ID |
| `oldStatus` | string | 原状态 |
| `newStatus` | string | 新状态 |
| `auditLog` | object | 本次操作日志 |
| `statistics` | object | 最新状态统计，用于审批后刷新 |
| `messageSent` | boolean | 是否通知学生 |

### 7.4 材料包预览

`GET /materials/{bizType}/{bizId}`

用于助学金、贷款、资料审核、校外住宿等“预览材料”入口。

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `includePreviewUrl` | boolean | 否 | 是否返回短期预览 URL |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `bizType` | string | 业务类型 |
| `bizId` | string | 业务 ID |
| `files` | array | 文件列表 |
| `files[].fileId` | string | 文件 ID |
| `files[].fileName` | string | 文件名 |
| `files[].fileType` | string | MIME 或业务类型 |
| `files[].size` | number | 字节 |
| `files[].previewUrl` | string | 短期预览 URL |
| `files[].downloadUrl` | string | 短期下载 URL |
| `files[].uploadedAt` | string | 上传时间 |

## 8. 助学金审核

### 8.1 助学金申请列表

`GET /scholarships`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role` | string | 否 | `teacher`、`government`、`finance` |
| `status` | string | 否 | 通用审批状态 |
| `tab` | string | 否 | `todo`、`processing`、`done` |
| `keyword` | string | 否 | 学号/姓名 |
| `classId` | string | 否 | 班级 |
| `departmentId` | string | 否 | 院系 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scholarshipId` | string | 申请 ID |
| `studentId`、`studentNo`、`studentName` | string | 学生 |
| `type` | string | 助学金类型 |
| `amount` | number | 申请金额 |
| `approvedAmount` | number | 已审批金额 |
| `status` | string | 状态 |
| `statusLabel` | string | 状态文案 |
| `submittedAt` | string | 申请时间 |
| `currentNode` | string | 当前节点 |
| `canProcess` | boolean | 当前用户是否可处理 |

### 8.2 助学金详情

`GET /scholarships/{scholarshipId}`

返回字段：申请基础信息、学生信息、家庭经济情况、申请说明、材料列表、审批进度、审批日志、打款信息、可操作按钮。

核心字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scholarshipId` | string | ID |
| `applicationNo` | string | 申请编号 |
| `student` | object | 学生信息 |
| `type` | string | 类型 |
| `amount` | number | 申请金额 |
| `approvedAmount` | number | 审批金额 |
| `status` | string | 状态 |
| `materials` | array | 材料文件 |
| `progressSteps` | array | 前端进度条 |
| `auditLogs` | array | 审批日志 |
| `payout` | object | 打款状态、时间、操作人 |

### 8.3 助学金审批动作

- `POST /scholarships/{scholarshipId}/approve`
- `POST /scholarships/{scholarshipId}/reject`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `opinion` | string | 否 | 审批意见 |
| `approvedAmount` | number | 通过时可选 | 审批金额，默认申请金额 |
| `targetStatus` | string | 否 | 后端通常按角色自动推进：教师 `first_pass/final_pass`、政务 `review_pass` |
| `rejectReason` | string | 驳回必填 | 驳回原因 |

返回字段：`oldStatus`、`newStatus`、`auditLog`、`nextNode`、`statistics`、`messageSent`。

### 8.4 财务确认助学金打款

`POST /scholarships/{scholarshipId}/disburse`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `amount` | number | 是 | 打款金额 |
| `payoutMethod` | string | 是 | `bank_transfer`、`cash`、`offset_bill` |
| `bankAccountId` | string | 否 | 银行账户 |
| `remark` | string | 否 | 财务备注 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `scholarshipId` | string | ID |
| `status` | string | `completed` |
| `payoutRecordId` | string | 打款记录 |
| `paidAt` | string | 打款时间 |
| `messageSent` | boolean | 是否通知 |

## 9. 助学贷款审核

### 9.1 助学贷款列表

`GET /loans`

请求参数与助学金列表一致，增加：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `loanType` | string | 否 | `origin_place` 生源地、`campus` 校园地 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `loanId` | string | 申请 ID |
| `studentId`、`studentNo`、`studentName` | string | 学生 |
| `loanType` | string | 贷款类型 |
| `amount` | number | 申请金额 |
| `receiptNo` | string | 回执/验证码 |
| `status` | string | 状态 |
| `submittedAt` | string | 申请时间 |
| `currentNode` | string | 当前节点 |
| `canProcess` | boolean | 可否处理 |

### 9.2 助学贷款详情

`GET /loans/{loanId}`

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `loanId` | string | ID |
| `applicationNo` | string | 申请编号 |
| `student` | object | 学生信息 |
| `loanType` | string | 类型 |
| `amount` | number | 金额 |
| `receiptNo` | string | 回执码 |
| `receiptVerified` | boolean | 回执是否已核验 |
| `materials` | array | 材料 |
| `status` | string | 状态 |
| `progressSteps` | array | 进度 |
| `auditLogs` | array | 审批日志 |
| `payout` | object | 打款/冲抵信息 |

### 9.3 助学贷款审批

- `POST /loans/{loanId}/approve`
- `POST /loans/{loanId}/reject`

请求参数同助学金，额外支持：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `verifiedReceiptNo` | string | 否 | 核验后的回执码 |
| `approvedAmount` | number | 否 | 审批金额 |

返回字段同助学金审批。

### 9.4 财务确认贷款打款/冲抵

`POST /loans/{loanId}/disburse`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `amount` | number | 是 | 金额 |
| `payoutMethod` | string | 是 | `bank_transfer`、`offset_bill` |
| `billIds` | array | 否 | 冲抵账单 |
| `remark` | string | 否 | 备注 |

返回字段：`loanId`、`status`、`payoutRecordId`、`billStatuses`、`paidAt`、`messageSent`。

## 10. 住宿、换宿、退宿、校外住宿

### 10.1 宿舍/住宿列表

`GET /dormitories/students`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `classId` | string | 否 | 班级 |
| `buildingId` | string | 否 | 楼栋 |
| `status` | string | 否 | `assigned`、`unassigned`、`non_dorm` |
| `keyword` | string | 否 | 学号/姓名 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：`studentId`、`studentNo`、`studentName`、`gender`、`className`、`buildingName`、`roomNo`、`bedNo`、`dormText`、`dormFee`、`status`。

### 10.2 学生住宿详情

`GET /dormitories/students/{studentId}`

返回：学生信息、当前宿舍、历史换宿/退宿/校外住宿申请、住宿费标准、补差单列表。

### 10.3 换宿申请列表

`GET /dormitory/room-change-applications`

请求参数：`role`、`status`、`keyword`、`classId`、`departmentId`、分页。

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `applicationId` | string | 申请 ID |
| `studentId`、`studentNo`、`studentName` | string | 学生 |
| `oldDorm` | object | 原宿舍 |
| `targetDorm` | object | 目标宿舍 |
| `reason` | string | 申请原因 |
| `status` | string | `pending`、`approved`、`rejected` |
| `applyTime` | string | 申请时间 |
| `statusLabel` | string | 状态文案 |

### 10.4 换宿申请详情与审批

- `GET /dormitory/room-change-applications/{applicationId}`
- `POST /dormitory/room-change-applications/{applicationId}/approve`
- `POST /dormitory/room-change-applications/{applicationId}/reject`

审批请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `remark` | string | 否 | 审批意见 |
| `generateDiffOrder` | boolean | 否 | 是否生成住宿费补差单，默认是 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `applicationId` | string | 申请 ID |
| `oldStatus` | string | 原状态 |
| `newStatus` | string | 新状态 |
| `dormitoryChanged` | boolean | 是否已变更宿舍 |
| `diffOrderId` | string | 生成的补差单 ID |
| `statistics` | object | 最新统计 |

### 10.5 退宿申请列表、详情、审批

- `GET /dormitory/withdraw-applications`
- `GET /dormitory/withdraw-applications/{applicationId}`
- `POST /dormitory/withdraw-applications/{applicationId}/approve`
- `POST /dormitory/withdraw-applications/{applicationId}/reject`

字段与换宿类似，详情包含 `currentDorm`、`reason`、证明材料、住宿费退款/补差影响。

### 10.6 校外住宿申请列表、详情、审批

- `GET /dormitory/non-dorm-applications`
- `GET /dormitory/non-dorm-applications/{applicationId}`
- `POST /dormitory/non-dorm-applications/{applicationId}/approve`
- `POST /dormitory/non-dorm-applications/{applicationId}/reject`

列表返回增加字段：`outsideAddress`、`guardianPhone`、`leaseStartDate`、`leaseEndDate`、`materials`、`currentNode`。

教师初审通过后建议进入政务复审状态，返回 `newStatus=first_pass` 或业务自定义 `government_review`。

### 10.7 宿舍楼栋与房间

- `GET /dormitories/buildings`
- `GET /dormitories/buildings/{buildingId}/rooms`

楼栋字段：`buildingId`、`buildingName`、`genderLimit`、`floorCount`、`roomCount`、`bedCount`、`availableBedCount`。

房间字段：`roomId`、`roomNo`、`floor`、`capacity`、`occupiedCount`、`availableBedCount`、`feeStandard`、`beds[]`。

## 11. 报到确认

### 11.1 报到统计

`GET /checkin/statistics`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `classId` | string | 否 | 教师看本班 |
| `departmentId` | string | 否 | 政务看院系/全校 |
| `termId` | string | 否 | 批次 |

返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `total` | number | 应报到 |
| `checkedIn` | number | 已报到 |
| `unchecked` | number | 未报到 |
| `todayCheckedIn` | number | 今日报到 |
| `checkinRate` | number | 报到率 |
| `byCollege` | array | 按学院统计 |
| `byClass` | array | 按班级统计 |

### 11.2 报到学生列表

`GET /checkin/students`

请求参数：`status`、`classId`、`departmentId`、`keyword`、`pageNum`、`pageSize`。

返回 `items[]`：`studentId`、`studentNo`、`studentName`、`className`、`paymentStatus`、`documentStatus`、`dormText`、`checkinStatus`、`checkedInAt`、`lastStatus`。

### 11.3 报到确认

`POST /checkin/students/{studentId}/confirm`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `checkinMethod` | string | 是 | `onsite`、`qr_scan`、`manual` |
| `location` | string | 否 | 报到地点 |
| `remark` | string | 否 | 备注 |

返回字段：`studentId`、`checkinStatus`、`checkedInAt`、`operatorName`、`statistics`。

### 11.4 取消报到确认

`POST /checkin/students/{studentId}/cancel`

请求参数：`reason`。

返回字段同确认接口。

### 11.5 报到延期处理

`POST /checkin/students/{studentId}/delay`

请求参数：`reason`、`expectedCheckinDate`、`remark`。

返回字段同确认接口，`checkinStatus` 返回 `delayed`。

### 11.6 报到阻塞处理

`POST /checkin/students/{studentId}/block`

请求参数：`reason`、`blockType`、`remark`。

返回字段同确认接口，`checkinStatus` 返回 `blocked`。

## 12. 军训服尺码 / 用品发放

### 12.1 尺码列表

`GET /uniform/sizes`

请求参数：`classId`、`status`（`empty`、`filled`、`abnormal`）、`keyword`、分页。

返回 `items[]`：`studentId`、`studentNo`、`studentName`、`gender`、`className`、`clothingSize`、`shoeSize`、`height`、`weight`、`remark`、`status`、`statusLabel`。

### 12.2 尺码详情

`GET /uniform/sizes/{studentId}`

返回学生信息、尺码、异常原因、修改历史。

### 12.3 尺码统计

`GET /uniform/sizes/statistics`

请求参数：`classId`、`departmentId`、`termId`。

返回字段：`total`、`filledCount`、`emptyCount`、`abnormalCount`、`byClothingSize[]`、`byShoeSize[]`。

### 12.4 用品发放记录

`GET /supplies/distribution-records`

请求参数：`classId`、`itemType`、`status`、`keyword`、分页。

返回：`recordId`、`studentNo`、`studentName`、`itemType`、`itemName`、`size`、`status`、`distributedAt`、`operatorName`。

## 13. 消息通知

### 13.1 消息列表

`GET /messages`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role` | string | 否 | 当前角色 |
| `status` | string | 否 | `unread`、`read` |
| `type` | string | 否 | 消息类型 |
| `pageNum`/`pageSize` | number | 否 | 分页 |

返回 `items[]`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `messageId` | string | 消息 ID |
| `type` | string | 类型 |
| `title` | string | 标题 |
| `content` | string | 内容 |
| `bizType` | string | 关联业务类型 |
| `bizId` | string | 关联业务 ID |
| `url` | string | 点击跳转 URL |
| `read` | boolean | 是否已读 |
| `createdAt` | string | 创建时间 |
| `readAt` | string | 已读时间 |

### 13.2 未读数量

`GET /messages/unread-count`

请求参数：`role`。

返回：`count`、`byType`。

### 13.3 标记已读、全部已读、删除、清空

- `PUT /messages/{messageId}/read`
- `PUT /messages/read-all`
- `DELETE /messages/{messageId}`
- `DELETE /messages`

`read-all`/清空请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `role` | string | 否 | 当前角色 |
| `type` | string | 否 | 指定类型 |

返回：`updatedCount` 或 `deletedCount`。

### 13.4 通知模板与发送记录

- `GET /messages/templates`
- `POST /messages/templates`
- `POST /messages/send`
- `GET /messages/send-records`

发送通知请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `templateCode` | string | 是 | 模板编码 |
| `channels` | array | 是 | `wechat`、`sms`、`site` |
| `receiverType` | string | 是 | `student`、`staff`、`role` |
| `receiverIds` | array | 是 | 接收人 ID |
| `bizType` | string | 否 | 业务类型 |
| `bizId` | string | 否 | 业务 ID |
| `variables` | object | 否 | 模板变量 |

## 14. 文件上传、预览、下载

### 14.1 文件上传

`POST /files/upload`

`multipart/form-data` 参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `file` | file | 是 | 文件 |
| `bizType` | string | 是 | 业务类型 |
| `bizId` | string | 否 | 业务 ID |
| `fileType` | string | 否 | 材料类型 |

返回字段：`fileId`、`fileName`、`mimeType`、`size`、`url`、`previewUrl`、`uploadedAt`。

### 14.2 文件预览

`GET /files/{fileId}/preview`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `disposition` | string | 否 | `inline` |
| `expiresIn` | number | 否 | 签名 URL 有效秒数 |

返回可以是文件流，也可以是：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `previewUrl` | string | 短期预览 URL |
| `expiresAt` | string | 过期时间 |

### 14.3 文件下载

`GET /files/{fileId}/download`

请求参数：`disposition=attachment`。

返回文件流或短期下载 URL。需校验业务权限。

### 14.4 材料包下载

`POST /files/package`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `bizType` | string | 是 | 业务类型 |
| `bizId` | string | 是 | 业务 ID |
| `fileIds` | array | 否 | 指定文件，不传下载全部 |

返回：`taskId`、`status`、`fileId`、`downloadUrl`。

## 15. 导出功能

### 15.1 创建导出任务

`POST /export/tasks`

请求参数：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `exportType` | string | 是 | `payment_students`、`payment_records`、`document_reviews`、`scholarships`、`loans`、`refunds`、`checkin_students`、`uniform_sizes`、`dorm_applications`、`messages` |
| `fileFormat` | string | 否 | `xlsx`、`csv`、`pdf` |
| `filters` | object | 是 | 与列表接口筛选参数一致 |
| `columns` | array | 否 | 指定导出列 |

返回字段：`taskId`、`status`、`createdAt`。

### 15.2 查询导出任务

`GET /export/tasks/{taskId}`

返回字段：`taskId`、`exportType`、`status`（`pending`、`running`、`finished`、`failed`）、`progress`、`fileId`、`downloadUrl`、`failureReason`、`expiresAt`。

### 15.3 下载导出文件

`GET /export/tasks/{taskId}/download`

返回文件流或 302 短链。

## 16. 状态筛选与审批处理后的刷新

### 16.1 列表接口统一筛选参数

所有列表接口建议统一支持：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `status` | string | 单状态筛选 |
| `statuses` | array | 多状态筛选 |
| `tab` | string | 前端分组，如 `todo`、`processing`、`done` |
| `keyword` | string | 模糊搜索 |
| `classId` | string | 班级 |
| `departmentId` | string | 院系 |
| `termId` | string | 学年/批次 |
| `startDate`/`endDate` | string | 时间范围 |
| `pageNum`/`pageSize` | number | 分页 |

### 16.2 审批动作返回刷新信息

所有审批/打款/退款/确认接口返回中必须包含：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `bizType` | string | 业务类型 |
| `bizId` | string | 业务 ID |
| `oldStatus` | string | 原状态 |
| `newStatus` | string | 新状态 |
| `updatedAt` | string | 更新时间 |
| `auditLog` | object | 本次操作日志 |
| `statistics` | object | 当前列表/工作台最新状态计数 |
| `nextAction` | object | 下一步可操作信息 |

前端在审批后至少有两种刷新方式：

1. 使用动作接口返回的 `newStatus` 与 `statistics` 局部刷新当前页面。
2. 调用对应列表接口和 `GET /statistics/summary` 重新拉取，保证跨页面状态一致。

### 16.3 业务状态变更事件

建议后端保留状态变更事件表，用于通知、审计、首页计数刷新。

事件字段：`eventId`、`bizType`、`bizId`、`oldStatus`、`newStatus`、`operatorId`、`operatorRole`、`occurredAt`、`remark`、`requestId`。

可选实时接口：

- `GET /events/business-state?since=<eventId>` 拉取增量状态变更。
- 后续如需实时体验，可扩展 WebSocket/SSE。

## 17. 报表接口

### 17.1 收费进度报表

`GET /reports/payment/progress`

请求参数：`termId`、`departmentId`、`classId`、`startDate`、`endDate`、`groupBy`。

返回：`summary`、`groups[]`。每组包含 `groupKey`、`groupName`、`totalStudents`、`paidCount`、`unpaidCount`、`partialCount`、`receivableAmount`、`paidAmount`、`unpaidAmount`、`paymentRate`。

### 17.2 收费流水报表

`GET /reports/payment/transactions`

请求参数：`startDate`、`endDate`、`method`、`channel`、`departmentId`、分页。

返回 `items[]`：`paymentNo`、`studentNo`、`studentName`、`billNo`、`itemName`、`amount`、`method`、`channel`、`paidAt`、`invoiceNo`。

### 17.3 支付方式统计

`GET /reports/payment/methods`

返回：`method`、`count`、`amount`、`percentage`。

### 17.4 收费趋势

`GET /reports/payment/trend`

请求参数：`startDate`、`endDate`、`granularity`（`day`、`week`、`month`）。

返回：`points[]`，含 `date`、`amount`、`count`。

### 17.5 欠费统计

`GET /reports/payment/arrears`

返回：按学院/班级/费用项目聚合的欠费人数、欠费金额、逾期人数。

### 17.6 退款与补差统计

- `GET /reports/refunds`
- `GET /reports/diff-refunds`

返回：总申请数、待处理、成功、失败、金额、按状态/费用类型/院系统计。

### 17.7 迎新大屏/综合看板

`GET /reports/dashboard`

返回：缴费、报到、资料审核、住宿、助学金、贷款、退款、消息等综合指标。

## 18. 后端重点确认事项

1. `code` 成功值统一为 `0` 还是兼容旧 `200`。
2. 角色字段统一使用 `roles` 还是继续兼容 `type/typeList`。
3. 助学金/贷款流程是否固定为：教师初审 -> 政务复审 -> 教师终审 -> 财务打款，或按学校配置流转。
4. 资料审核是否只有教师初审，还是也需要政务/院系复审。
5. 退款是否严格限制在线支付当日申请，补差退款是否走独立规则。
6. 文件预览是否由后端生成签名 URL，签名 URL 过期时间建议 5-30 分钟。
7. 导出是否统一异步任务；移动端是否允许直接下载，还是只生成文件后在浏览器打开。
8. 首页统计是否实时计算，还是允许缓存；若缓存需返回 `updatedAt`。
9. 审批动作是否由后端返回最新统计，以减少前端多次请求。
10. 当前页面存在本地模拟数据，应以本文业务接口替换，避免跨页面状态不同步。
