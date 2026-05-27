# 教师端 API 文档

> Base URL: `http://{host}:3100/api/v1`
> 协议: HTTP + JSON
> 鉴权: JWT Bearer Token
> 通用成功码: `code=0`

## 测试账号

| 角色 | 账号 | 密码 | 短信验证码 |
|------|------|------|-----------|
| 教师 | `1001` | `123456` | `123456` |
| 财务 | `2001` | `123456` | `123456` |
| 政务 | `3001` | `123456` | `123456` |

## 通用约定

### 请求头

| Header | 必填 | 说明 |
|--------|------|------|
| `Authorization` | 登录后必填 | `Bearer <accessToken>` |
| `Content-Type` | 是 | `application/json;charset=UTF-8` |

### 通用返回结构

```json
{ "code": 0, "message": "success", "data": {} }
```

### 通用分页结构

请求: `pageNum`(默认1), `pageSize`(默认20), `keyword`, `sortBy`, `sortOrder`

返回:
```json
{ "items": [], "pageNum": 1, "pageSize": 20, "total": 100, "pages": 5, "hasNext": true }
```

### 角色枚举

| 角色 | type 值 | 默认首页 |
|------|---------|---------|
| `teacher` | 2 | `/pages/teacher/home/index` |
| `finance` | 3 | `/pages/finance/home/index` |
| `government` | 5 | `/pages/government/home/index` |

---

## 1. 登录鉴权

### 1.1 密码登录

```
POST /auth/login/password
```

请求:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 是 | 工号/手机号/用户名 |
| password | string | 是 | 密码 |
| clientType | string | 否 | h5 / mp-weixin |
| appId | string | 否 | 应用ID |

返回 `data`:
| 字段 | 类型 | 说明 |
|------|------|------|
| accessToken | string | JWT |
| refreshToken | string | 刷新令牌 |
| expiresIn | number | 有效秒数(7200) |
| user | object | 用户信息 |
| user.userId | string | 用户ID |
| user.name | string | 姓名 |
| user.avatar | string | 头像URL |
| user.phone | string | 手机号 |
| user.workNo | string | 工号 |
| user.roles | array | 角色列表 |
| defaultRole | string | 默认角色 |
| homePage | string | 首页路径 |

### 1.2 发送短信验证码

```
POST /auth/sms-code
```

请求: `{ phone, scene }` (scene: login/bind_phone/change_phone_old/change_phone_new)

返回: `{ smsToken, expireSeconds: 300, cooldownSeconds: 60 }`

### 1.3 短信登录

```
POST /auth/login/sms
```

请求: `{ phone, code, smsToken?, clientType?, appId? }`

返回同密码登录。

### 1.4 微信小程序登录

```
POST /auth/login/wechat-miniapp
```

请求: `{ code, appId?, inviteCode?, orgId?, clientType? }`

返回同密码登录，额外返回 `openId`、`unionId`。未绑定手机时返回 `needBindPhone: true`。

### 1.5 获取当前用户

```
GET /auth/me
```

返回: `{ userId, name, avatar, phone, maskedPhone, workNo, roles, currentRole, roleScopes, permissions, orgId, departmentId }`

### 1.6 切换角色

```
POST /auth/switch-role
```

请求: `{ role }`

返回: `{ accessToken, currentRole, homePage, permissions }`

### 1.7 登出

```
POST /auth/logout
```

### 1.8 刷新Token

```
POST /auth/refresh
```

请求: `{ refreshToken }`

返回: `{ accessToken, refreshToken, expiresIn }`

### 1.9 账号管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/account/phone/bind` | 绑定手机 `{ phone, code, smsToken? }` |
| PUT | `/account/phone` | 修改手机 `{ oldCode, newPhone, newCode, oldSmsToken?, newSmsToken? }` |
| PUT | `/account/password` | 修改密码 `{ oldPassword, newPassword }` |

---

## 2. 工作台仪表盘

### 2.1 教师首页

```
GET /dashboard/teacher
```

参数: `classId?`, `termId?`

返回:
```json
{
  "teacher": { "name", "avatar", "department", "className", "workNo" },
  "classStats": { "totalStudents", "checkedIn", "unchecked", "checkinRate" },
  "todo": { "docPending", "aidPending", "loanPending", "feeOverdue", "roomChangePending", "dormWithdrawPending", "nonDormPending" },
  "unreadCount": 5,
  "quickEntries": [{ "key", "label", "url", "count" }]
}
```

### 2.2 财务首页

```
GET /dashboard/finance
```

返回:
```json
{
  "todayReceivedAmount", "paidStudentCount", "unpaidStudentCount",
  "refundPendingCount",
  "todo": { "aidPayoutPending", "loanPayoutPending", "refundPending", "processedCount" },
  "unreadCount"
}
```

### 2.3 政务首页

```
GET /dashboard/government
```

返回:
```json
{
  "todayCheckinCount", "checkedInCount", "uncheckedCount", "checkinRate",
  "todo": { "roomChangePending", "aidReviewPending", "loanReviewPending", "applicationPending" },
  "unreadCount"
}
```

### 2.4 通用状态统计

```
GET /statistics/summary
```

参数: `bizType`(必填), `role?`, `classId?`, `departmentId?`, `termId?`

bizType: `payment` / `document` / `scholarship` / `loan` / `refund` / `room_change` / `dorm_withdraw` / `non_dorm` / `checkin` / `uniform`

返回: `{ total, statusCounts: {}, tabCounts: [{key, label, count}], updatedAt }`

---

## 3. 学生管理

### 3.1 搜索学生

```
GET /students/search
```

参数: `keyword?`, `classId?`, `departmentId?`, `paymentStatus?`, `checkinStatus?`, `pageNum?`, `pageSize?`

返回 items:
| 字段 | 说明 |
|------|------|
| studentId | 学生ID |
| studentNo | 学号 |
| name | 姓名 |
| gender | 性别 |
| college | 学院 |
| major | 专业 |
| classId / className | 班级 |
| phone / parentPhone | 手机号 |
| idNoMasked | 脱敏身份证 |
| dormText | 宿舍 |
| paymentStatus | 缴费状态 |
| checkinStatus | 报到状态 |

### 3.2 班级学生列表

```
GET /classes/:classId/students
```

参数和返回同学生搜索。

### 3.3 学生详情

```
GET /students/:studentId
```

返回: 学生完整信息、宿舍信息、缴费摘要、资料审核状态、助学金/贷款状态、报到信息、审计日志。

---

## 4. 缴费管理

### 4.1 班级缴费统计

```
GET /payments/class-stats
```

参数: `classId?`, `termId?`

返回: `{ totalStudents, paidCount, unpaidCount, partialCount, overdueCount, greenChannelCount, totalReceivableAmount, totalPaidAmount, totalUnpaidAmount }`

### 4.2 学生缴费列表

```
GET /payments/students
```

参数: `classId?`, `status?`(all/paid/unpaid/partial/overdue/green_channel), `keyword?`, `onlyUrgeable?`, 分页

返回 items: `{ studentId, studentNo, name, className, receivableAmount, paidAmount, unpaidAmount, paymentStatus, statusLabel, dueDate, overdueDays, urgeCount, lastUrgeAt, canUrge }`

### 4.3 学生缴费详情

```
GET /payments/students/:studentId
```

返回: `{ student, summary, bills[], records[], reminders[], refunds[], invoices[] }`

### 4.4 账单明细

```
GET /payments/students/:studentId/bills
```

参数: `termId?`, `status?`

返回 bills: `{ billId, billNo, itemName, itemType, receivableAmount, paidAmount, discountAmount, unpaidAmount, priority, dueDate, status }`

### 4.5 缴费记录

```
GET /payments/students/:studentId/records
```

参数: `termId?`, `startDate?`, `endDate?`

返回 records: `{ recordId, paymentNo, amount, method, channel, paidAt, operatorName, invoiceId, sourceType }`

---

## 5. 催缴管理

### 5.1 发送单人催缴

```
POST /reminders/send
```

请求: `{ studentId, billIds?[], channels?[] (sms/wechat/site), templateCode?, remark? }`

返回: `{ reminderId, sentAt, sendResults: [{channel, success, message}], urgeCount }`

### 5.2 批量催缴

```
POST /reminders/batch
```

请求: `{ studentIds[], scope? (selected/all_unpaid/current_filter), filter?, channels[], templateCode?, remark? }`

返回: `{ taskId, total, accepted, skipped, skippedReasons }`

### 5.3 催缴任务列表

```
GET /reminders/tasks
```

参数: `status?`, `creatorId?`, `startDate?`, `endDate?`, 分页

返回 items: `{ taskId, taskName, channels, targetCount, sentCount, failedCount, status, createdBy, createdAt, finishedAt }`

### 5.4 催缴记录

```
GET /reminders/records
```

参数: `studentId?`, `billId?`, `taskId?`, `channel?`, `sendStatus?`, 分页

返回 items: `{ reminderId, studentId, studentNo, studentName, billId, amount, channel, templateCode, sendStatus, failureReason, sentAt, operatorName }`

---

## 6. 财务收款

### 6.1 线下收款待确认

```
GET /payments/offline/pending
```

参数: `status?`(pending/confirmed/rejected), `keyword?`, `startDate?`, `endDate?`, 分页

返回 items: `{ offlinePaymentId, studentId, studentNo, studentName, amount, method (cash/bank_transfer/pos), location, submittedAt, voucherFiles[], status }`

### 6.2 确认线下收款

```
POST /payments/offline/:offlinePaymentId/confirm
```

请求: `{ confirmedAmount, billAllocations?[{billId, amount}], remark? }`

返回: `{ paymentRecordId, paymentStatus, billStatuses: [{billId, oldStatus, newStatus}], invoiceId }`

---

## 7. 退款管理

### 7.1 退款列表

```
GET /refunds
```

参数: `status?`(pending/approved/processing/refunded/failed/rejected), `keyword?`, `feeType?`, `startDate?`, `endDate?`, 分页

返回 items: `{ refundId, refundNo, studentId, studentNo, studentName, feeType, reason, amount, refundableAmount, status, applyTime, failureReason }`

### 7.2 退款详情

```
GET /refunds/:refundId
```

### 7.3 退款审批

| 方法 | 路径 | 请求 | 说明 |
|------|------|------|------|
| POST | `/refunds/:id/approve` | `{ opinion?, approvedAmount }` | 通过 |
| POST | `/refunds/:id/reject` | `{ opinion?, rejectReason }` | 驳回 |
| POST | `/refunds/:id/execute` | `{ refundMethod?, accountInfo?, remark? }` | 执行退款 |
| POST | `/refunds/:id/retry` | `{ refundMethod?, accountInfo?, remark? }` | 重试失败退款 |

返回: `{ refundId, status, billStatusChanged, messageSent, updatedAt }`

### 7.4 补差退款

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/refunds/diff` | 补差列表 |
| POST | `/refunds/diff/:diffRefundId/confirm` | 确认补差 `{ refundMethod?, remark?, accountInfo? }` |

---

## 8. 已处理记录

```
GET /finance/processed-records
```

参数: `bizType?`(scholarship/loan/refund), `startDate?`, `endDate?`, `keyword?`, 分页

返回 items: `{ recordId, bizType, bizId, studentNo, studentName, amount, status, processedAt, operatorName, summary }`

---

## 9. 票据管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/invoices` | 票据列表 |
| GET | `/invoices/:invoiceId` | 票据详情 |
| POST | `/invoices` | 开具票据 `{ studentId, billIds[], amount, paymentMethod }` |
| POST | `/invoices/:invoiceId/reprint` | 补打票据 |
| POST | `/invoices/:invoiceId/void` | 作废票据 `{ reason, operatorPassword? }` |

---

## 10. 资料审核

### 10.1 审核列表

```
GET /documents/reviews
```

参数: `status?`(pending/first_pass/department_review/final_pass/rejected), `tab?`(pending/passed/rejected), `classId?`, `keyword?`, 分页

返回 items: `{ documentReviewId, studentId, studentNo, studentName, className, college, major, status, statusLabel, submittedAt, materialTags[], rejectReason }`

### 10.2 审核详情

```
GET /documents/reviews/:documentReviewId
```

返回: 学生完整信息、材料文件列表(materialType/fileId/fileName/previewable/downloadable)、审核流水、canApprove/canReject。

### 10.3 审核操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/documents/reviews/:id/approve` | 通过 `{ opinion?, targetStatus? }` |
| POST | `/documents/reviews/:id/reject` | 退回 `{ rejectReason, rejectMaterialTypes?[] }` |

返回: `{ documentReviewId, oldStatus, newStatus, auditLog, statistics, messageSent }`

### 10.4 材料预览

```
GET /materials/:bizType/:bizId
```

bizType: `scholarship` / `loan` / `document_review` / `non_dorm` / `dorm_change` / `dorm_withdraw` / `green_channel` / `fee_exemption`

参数: `includePreviewUrl?`

返回: `{ bizType, bizId, files: [{fileId, fileName, fileType, size, previewUrl, downloadUrl, uploadedAt}] }`

---

## 11. 助学金审核

### 11.1 申请列表

```
GET /scholarships
```

参数: `role?`, `status?`, `tab?`(todo/processing/done), `keyword?`, `classId?`, `departmentId?`, 分页

返回 items: `{ scholarshipId, studentId, studentNo, studentName, type, amount, approvedAmount, status, statusLabel, submittedAt, currentNode, canProcess }`

### 11.2 申请详情

```
GET /scholarships/:scholarshipId
```

返回: 申请基础信息、学生信息、金额、材料列表、审批进度(progressSteps)、审批日志(auditLogs)、打款信息(payout)。

### 11.3 审批操作

| 方法 | 路径 | 权限 | 请求 |
|------|------|------|------|
| POST | `/scholarships/:id/approve` | 教师/政务 | `{ opinion?, approvedAmount?, targetStatus? }` |
| POST | `/scholarships/:id/reject` | 教师/政务 | `{ opinion?, rejectReason }` |
| POST | `/scholarships/:id/disburse` | 财务 | `{ amount, payoutMethod (bank_transfer/cash/offset_bill), bankAccountId?, remark? }` |

返回: `{ scholarshipId, oldStatus, newStatus, auditLog, nextNode, statistics, messageSent }`

---

## 12. 助学贷款审核

### 12.1 申请列表

```
GET /loans
```

参数: 同助学金 + `loanType?`(origin_place/campus)

返回 items: `{ loanId, studentId, studentNo, studentName, loanType, amount, receiptNo, status, submittedAt, currentNode, canProcess }`

### 12.2 申请详情

```
GET /loans/:loanId
```

返回: 申请信息、回执码/验证状态、材料、审批进度、打款/冲抵信息。

### 12.3 审批操作

| 方法 | 路径 | 权限 | 请求 |
|------|------|------|------|
| POST | `/loans/:id/approve` | 教师/政务 | `{ opinion?, verifiedReceiptNo?, approvedAmount?, targetStatus? }` |
| POST | `/loans/:id/reject` | 教师/政务 | `{ opinion?, rejectReason }` |
| POST | `/loans/:id/disburse` | 财务 | `{ amount, payoutMethod (bank_transfer/offset_bill), billIds?[], remark? }` |

---

## 13. 住宿管理

### 13.1 住宿学生列表

```
GET /dormitories/students
```

参数: `classId?`, `buildingId?`, `status?`(assigned/unassigned/non_dorm), `keyword?`, 分页

返回 items: `{ studentId, studentNo, studentName, gender, className, buildingName, roomNo, bedNo, dormText, dormFee, status }`

### 13.2 学生住宿详情

```
GET /dormitories/students/:studentId
```

### 13.3 楼栋与房间

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dormitories/buildings` | 楼栋列表 `{ buildingId, buildingName, genderLimit, floorCount, roomCount, bedCount, availableBedCount }` |
| GET | `/dormitories/buildings/:buildingId/rooms` | 房间列表 `{ roomId, roomNo, floor, capacity, occupiedCount, availableBedCount, feeStandard, beds[] }` |

### 13.4 换宿申请

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dormitory/room-change-applications` | 列表 |
| GET | `/dormitory/room-change-applications/:id` | 详情 |
| POST | `/dormitory/room-change-applications/:id/approve` | 通过 `{ remark?, generateDiffOrder? }` |
| POST | `/dormitory/room-change-applications/:id/reject` | 驳回 `{ remark? }` |

### 13.5 退宿申请

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dormitory/withdraw-applications` | 列表 |
| GET | `/dormitory/withdraw-applications/:id` | 详情 |
| POST | `/dormitory/withdraw-applications/:id/approve` | 通过 |
| POST | `/dormitory/withdraw-applications/:id/reject` | 驳回 |

### 13.6 校外住宿申请

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/dormitory/non-dorm-applications` | 列表 (含outsideAddress/guardianPhone/leaseStartDate/leaseEndDate) |
| GET | `/dormitory/non-dorm-applications/:id` | 详情 |
| POST | `/dormitory/non-dorm-applications/:id/approve` | 通过 (教师→first_pass，进入政务复审) |
| POST | `/dormitory/non-dorm-applications/:id/reject` | 驳回 |

---

## 14. 报到确认

### 14.1 报到统计

```
GET /checkin/statistics
```

参数: `classId?`, `departmentId?`, `termId?`

返回: `{ total, checkedIn, unchecked, todayCheckedIn, checkinRate, byCollege[], byClass[] }`

### 14.2 报到学生列表

```
GET /checkin/students
```

参数: `status?`, `classId?`, `departmentId?`, `keyword?`, 分页

返回 items: `{ studentId, studentNo, studentName, className, paymentStatus, documentStatus, dormText, checkinStatus, checkedInAt, lastStatus }`

### 14.3 报到操作

| 方法 | 路径 | 请求 | 说明 |
|------|------|------|------|
| POST | `/checkin/students/:id/confirm` | `{ checkinMethod (onsite/qr_scan/manual), location?, remark? }` | 确认报到 |
| POST | `/checkin/students/:id/cancel` | `{ reason? }` | 取消报到 |
| POST | `/checkin/students/:id/delay` | `{ reason, expectedCheckinDate, remark? }` | 延期报到 |
| POST | `/checkin/students/:id/block` | `{ reason, blockType, remark? }` | 阻塞报到 |

返回: `{ studentId, checkinStatus, checkedInAt, operatorName, statistics }`

---

## 15. 军训服尺码

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/uniform/sizes` | 尺码列表 `{ classId?, status? (empty/filled/abnormal), keyword?, 分页 }` |
| GET | `/uniform/sizes/:studentId` | 尺码详情 |
| GET | `/uniform/sizes/statistics` | 尺码统计 `{ total, filledCount, emptyCount, abnormalCount, byClothingSize[], byShoeSize[] }` |

---

## 16. 用品发放

```
GET /supplies/distribution-records
```

参数: `classId?`, `itemType?`(bedding/uniform/daily), `status?`(pending/distributed/returned), `keyword?`, 分页

返回 items: `{ recordId, studentNo, studentName, itemType, itemName, size, status, distributedAt, operatorName }`

---

## 17. 消息通知

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/messages` | 消息列表 `{ role?, status? (unread/read), type?, 分页 }` |
| GET | `/messages/unread-count` | 未读数量 `{ count, byType }` |
| PUT | `/messages/:messageId/read` | 标记已读 |
| PUT | `/messages/read-all` | 全部已读 `{ role?, type? }` |
| DELETE | `/messages/:messageId` | 删除单条 |
| DELETE | `/messages` | 清空消息 `{ role?, type? }` |
| GET | `/messages/templates` | 模板列表 |
| POST | `/messages/templates` | 创建模板 |
| POST | `/messages/send` | 发送通知 `{ templateCode, channels[], receiverType, receiverIds[], bizType?, bizId?, variables? }` |
| GET | `/messages/send-records` | 发送记录 |

---

## 18. 文件管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/files/upload` | 上传 `multipart/form-data: file, bizType, bizId?, fileType?` |
| GET | `/files/:fileId/preview` | 预览 `?disposition=inline&expiresIn=` |
| GET | `/files/:fileId/download` | 下载 `?disposition=attachment` |
| POST | `/files/package` | 打包下载 `{ bizType, bizId, fileIds?[] }` |

---

## 19. 数据导出

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/export/tasks` | 创建导出 `{ exportType, fileFormat? (xlsx/csv/pdf), filters, columns?[] }` |
| GET | `/export/tasks/:taskId` | 查询进度 `{ status, progress, fileId, downloadUrl }` |
| GET | `/export/tasks/:taskId/download` | 下载文件 |

exportType: `payment_students` / `payment_records` / `document_reviews` / `scholarships` / `loans` / `refunds` / `checkin_students` / `uniform_sizes` / `dorm_applications` / `messages`

---

## 20. 业务状态事件

```
GET /events/business-state
```

参数: `since`(eventId 或 ISO日期), `bizType?`, `limit?`

返回 items: `{ eventId, bizType, bizId, oldStatus, newStatus, operatorId, operatorRole, occurredAt, remark, requestId }`

---

## 21. 报表

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/reports/payment/progress` | 收费进度报表 |
| GET | `/reports/payment/transactions` | 收费流水报表 |
| GET | `/reports/payment/methods` | 支付方式统计 |
| GET | `/reports/payment/trend` | 收费趋势 `?granularity=day/week/month` |
| GET | `/reports/payment/arrears` | 欠费统计 |
| GET | `/reports/refunds` | 退款统计 |
| GET | `/reports/diff-refunds` | 补差退款统计 |
| GET | `/reports/dashboard` | 综合看板 |

---

## 22. 状态枚举参考

### 缴费状态 paymentStatus

| 值 | 说明 |
|------|------|
| `unpaid` | 未缴 |
| `partial` | 部分未缴 |
| `paid` | 已缴清 |
| `overdue` | 逾期 |
| `green_channel` | 绿色通道 |

### 通用审批状态 reviewStatus

| 值 | 说明 |
|------|------|
| `pending` | 待初审 |
| `first_pass` | 初审通过 |
| `review_pass` | 复审通过 |
| `final_pass` | 终审通过 |
| `payment_pending` | 待财务打款 |
| `paid` / `completed` | 已完成 |
| `rejected` | 已驳回 |

### 资料状态 materialStatus

| 值 | 说明 |
|------|------|
| `pending` | 待审核 |
| `first_pass` | 初审通过 |
| `department_review` | 复审中 |
| `final_pass` | 已通过 |
| `rejected` | 已退回 |

### 退款状态 refundStatus

| 值 | 说明 |
|------|------|
| `pending` | 待财务审核 |
| `approved` | 已通过 |
| `processing` | 退款处理中 |
| `refunded` | 已退款 |
| `failed` | 退款失败 |
| `rejected` | 已驳回 |

---

## 23. 审批流程说明

### 助学金/贷款审批流

```
学生提交 → 教师初审(pending→first_pass) → 政务复审(first_pass→review_pass)
         → 教师终审(review_pass→final_pass) → 财务打款(final_pass→payment_pending→completed)
```

### 资料审核流

```
学生提交 → 教师初审(pending→first_pass) → 院系复审(first_pass→department_review)
         → 终审(department_review→final_pass)
```

### 校外住宿审批流

```
学生提交 → 教师初审(pending→first_pass) → 政务复审(first_pass→approved/rejected)
```

### 换宿/退宿审批流

```
学生提交 → 教师或政务审批(pending→approved/rejected)
```
