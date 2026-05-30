# 迎新收费系统 API 需求清单

> 分析日期：2026-05-30  
> 涵盖：教师端、财务端、政务端全部 66 个页面  
> 原则：不遗漏任何 API，保证业务逻辑闭环

---

## 一、总览

| 类别 | API 服务文件 | 方法数 | 调用页面数 |
|------|------------|--------|-----------|
| 认证 | `auth.js` | 11 | 4 个 settings 页 + login |
| 仪表盘 | `dashboard.js` | 4 | 0（全部走 businessState） |
| 学生 | `student.js` | 5 | 1（student-detail） |
| 缴费 | `payment.js` | 9 | 1（student-detail） |
| 账单 | `bill.js` | 8 | 0 |
| 助学金/贷款 | `scholarship.js` | 10 | 10 个审核页 |
| 资料审核 | `document.js` | 5 | 1（doc-review） |
| 宿舍 | `dormitory.js` | 14 | 3 |
| 退费 | `refund.js` | 9 | 2 |
| 报到 | `checkin.js` | 6 | 2 |
| 催缴 | `reminder.js` | 6 | 2 |
| 消息 | `message.js` | 10 | 0（走 businessState） |
| 校服 | `uniform.js` | 4 | 0 |
| 线下收款 | `offlinePayment.js` | 6 | 0 |
| 现场收款 | `onsiteStaff.js` | 4 | 0 |
| 票据 | `invoice.js` | 5 | 0 |
| 导出 | `export.js` | 3 | 0 |
| 文件 | `file.js` | 5 | 0 |
| 报表 | `report.js` | 8 | 0 |
| 配置 | `config.js` | 9 | 0 |
| **合计** | **21 个文件** | **141** | **22 个页面** |

---

## 二、按业务域详细列出

### 2.1 认证 (auth)

**涉及页面**: login, teacher/settings, finance/settings, government/settings

#### 2.1.1 密码登录

```
POST /api/v1/auth/login/password
请求: { account: string, password: string, clientType: string, appId: number }
返回: {
  code: 0,
  data: {
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: {
      userId, name, workNo, phone, roles: string[],
      type: number, typeList: number[],
      departmentName, hasType: boolean,
      orgId, orgName,
      subRole: string, permissions: string[],
      dataScope: { type: string, classId?: string, collegeId?: string }
    },
    defaultRole: string,
    homePage: string,
    permissions: string[]
  }
}
```

#### 2.1.2 验证码登录

```
POST /api/v1/auth/login/sms
请求: { phone: string, code: string, smsToken: string, clientType: string, appId: number }
返回: 同密码登录
```

#### 2.1.3 微信小程序登录

```
POST /api/v1/auth/login/wechat-miniapp
请求: { account?: string, phone?: string }
返回: 同密码登录
```

#### 2.1.4 发送验证码

```
POST /api/v1/auth/sms-code
请求: { phone: string, scene: string }
返回: { code: 0, data: { smsToken: string, expireSeconds: number, cooldownSeconds: number } }
```

#### 2.1.5 获取当前用户

```
GET /api/v1/auth/me
请求: 无
返回: { userId, name, workNo, phone, roles, type, typeList, departmentName, currentRole, roleScopes, permissions, orgId, orgName }
```

#### 2.1.6 刷新 Token

```
POST /api/v1/auth/refresh
请求: { refreshToken: string }
返回: { accessToken, refreshToken, expiresIn }
```

#### 2.1.7 切换角色

```
POST /api/v1/auth/switch-role
请求: { role: string }
返回: { accessToken, currentRole, homePage, permissions }
```

#### 2.1.8 登出

```
POST /api/v1/auth/logout
请求: {}
返回: { code: 0, data: true }
```

#### 2.1.9 获取权限

```
GET /api/v1/auth/permissions
请求: { userId?: string, workNo?: string }
返回: { userId, name, role, subRole, permissions: string[], dataScope: object }
```

#### 2.1.10 绑定手机号

```
POST /api/v1/account/phone/bind
请求: { phone: string, code: string, smsToken: string }
返回: { phone, maskedPhone }
```

#### 2.1.11 修改手机号

```
PUT /api/v1/account/phone
请求: { oldCode, newPhone, newCode, oldSmsToken, newSmsToken }
返回: { phone, maskedPhone }
```

#### 2.1.12 修改密码

```
PUT /api/v1/account/password
请求: { oldPassword: string, newPassword: string }
返回: { code: 0, data: true }
```

---

### 2.2 仪表盘 (dashboard)

**涉及页面**: teacher/home, finance/home, government/home（均走 businessState，API 作为补充）

#### 2.2.1 教师仪表盘

```
GET /api/v1/dashboard/teacher
返回: {
  teacher: { name, avatar, college, className, totalStudents },
  classStats: { totalStudents, checkedIn, unchecked, checkinRate },
  todo: { docPending, aidPending, loanPending, feeOverdue, roomChangePending, dormWithdrawPending, nonDormPending },
  unreadCount: number,
  quickEntries: []
}
```

#### 2.2.2 财务仪表盘

```
GET /api/v1/dashboard/finance
返回: {
  todayReceivedAmount, paidStudentCount, unpaidStudentCount, refundPendingCount,
  todo: { aidPayoutPending, loanPayoutPending, refundPending, processedCount },
  unreadCount
}
```

#### 2.2.3 政务仪表盘

```
GET /api/v1/dashboard/government
返回: {
  todayCheckinCount, checkedInCount, uncheckedCount, checkinRate,
  todo: { roomChangePending, aidReviewPending, loanReviewPending, applicationPending },
  unreadCount
}
```

#### 2.2.4 统计概览

```
GET /api/v1/statistics/summary
请求: { bizType: string, role?: string }
返回: { total, statusCounts: object, tabCounts: array, updatedAt }
```

---

### 2.3 学生 (student)

**涉及页面**: teacher/student-detail

#### 2.3.1 搜索学生

```
GET /api/v1/students/search
请求: { keyword?: string, page?: number, pageSize?: number, status?: string }
返回: { list: [{ studentId, studentNo, name, gender, college, major, classId, className, phone, parentPhone, idNoMasked, address, dormText }], total, page, pageSize }
```

#### 2.3.2 学生详情

```
GET /api/v1/students/:id
返回: {
  studentId, studentNo, name, gender, college, major, classId, className, phone, parentPhone, idNoMasked, address, dormText,
  paymentSummary: object, documentSummary: object, aidSummary: object, loanSummary: object,
  checkin: { checkinId, checkinStatus, checkedInAt, lastStatus },
  auditLogs: []
}
```

#### 2.3.3 班级学生列表

```
GET /api/v1/classes/:classId/students
请求: { keyword?: string, page?: number, pageSize?: number }
返回: { list: [...], total, page, pageSize }
```

---

### 2.4 缴费管理 (payment)

**涉及页面**: teacher/fee-home, teacher/student-detail

#### 2.4.1 班级缴费统计

```
GET /api/v1/payments/class-stats
返回: { totalStudents, paidCount, unpaidCount, partialCount, overdueCount, greenChannelCount, totalReceivableAmount, totalPaidAmount, totalUnpaidAmount }
```

#### 2.4.2 学生缴费列表

```
GET /api/v1/payments/students
请求: { page?, pageSize?, keyword?, status?, studentId?, classId?, startTime?, endTime? }
返回: {
  list: [{
    paymentId, studentId, studentNo, studentName, name, className,
    receivableAmount, paidAmount, unpaidAmount, amount,
    paymentStatus(paid|unpaid|overdue|partial|green_channel),
    payStatus, dueDate, overdueDays, urgeCount, lastUrgeAt, canUrge,
    statusLabel, statusColor, daysLabel, avatarBg
  }],
  total, page, pageSize
}
```

#### 2.4.3 学生缴费详情

```
GET /api/v1/payments/students/:studentId
返回: {
  student: object,
  summary: { receivableAmount, paidAmount, unpaidAmount, paymentStatus, ... },
  bills: [{ billId, billNo, itemName, itemType, receivableAmount, paidAmount, discountAmount, unpaidAmount, priority, dueDate, status }],
  records: [{ recordId, paymentNo, amount, method, channel, paidAt, operatorName, invoiceId, sourceType }],
  reminders: [], refunds: [], invoices: []
}
```

#### 2.4.4 学生账单明细

```
GET /api/v1/payments/students/:studentId/bills
返回: [{ billId, billNo, itemName, ... }]
```

#### 2.4.5 学生缴费记录

```
GET /api/v1/payments/students/:studentId/records
返回: [{ recordId, paymentNo, amount, method, ... }]
```

#### 2.4.6 线下收款确认（旧路径）

```
POST /api/v1/payments/offline/:offlinePaymentId/confirm
请求: { collectionType?: string, remark?: string, confirmedAmount?: number }
返回: { paymentRecordId, oldStatus, status, paymentStatus, billStatuses, invoiceId }
```

#### 2.4.7 待确认线下收款

```
GET /api/v1/payments/offline/pending
请求: { page?, pageSize?, keyword? }
返回: { list: [{ id, studentNo, name, avatar, method, amount, time, status, location, collectionType }], total }
```

---

### 2.5 账单管理 (bill)

**涉及页面**: 暂无前端直接调用

#### 2.5.1 账单列表

```
GET /api/v1/bill/list
请求: { page?, pageSize?, keyword?, status? }
返回: { list: [{ billId, billNo, studentNo, studentName, itemName, receivableAmount, paidAmount, unpaidAmount, status }], total }
```

#### 2.5.2 账单详情

```
GET /api/v1/bill/:id
返回: 单条账单对象

#### 2.5.3 创建账单

```
POST /api/v1/bill
请求: { studentNo, itemName, amount, ... }
```

#### 2.5.4 批量生成账单

```
POST /api/v1/bill/batch
POST /api/v1/bill/generate
```

#### 2.5.5 更新/取消/豁免账单

```
PUT /api/v1/bill/:id
POST /api/v1/bill/:id/cancel
POST /api/v1/bill/:id/exempt
```

---

### 2.6 助学金/贷款审核 (scholarship)

**涉及页面**: 10 个审核页（教师/财务/政务三端的 aid-review, loan-review, aid-final-review, loan-final-review, processed）

**状态流转**: pending → first_pass（教师初审）→ review_pass（学院复审）→ final_pass（学工处终审）→ payment_pending（待打款）→ paid/completed（已打款） | rejected（驳回）

#### 2.6.1 助学金列表

```
GET /api/v1/scholarships
请求: { page?, pageSize?, keyword?, status?, tab?(todo|processing|done), role?, studentId?, classId? }
返回: {
  list: [{
    scholarshipId, uid, applicationNo,
    studentId, studentNo, sid, studentName, name,
    type(国家助学金|特殊困难助学金|学校困难补助|社会助学金),
    amount, approvedAmount, status, submittedAt, currentNode,
    materials: [{ fileId, fileName, fileType, url, previewUrl }],
    auditLogs: [{ node, result, time, remark }],
    payout: { payoutRecordId, amount, payoutMethod, paidAt, operatorName },
    statusLabel(中文), badgeColor
  }],
  total, page, pageSize
}
```

#### 2.6.2 助学金详情

```
GET /api/v1/scholarships/:id
返回: 单条完整记录（含学生信息、材料、审核日志）
```

#### 2.6.3 助学金批准

```
POST /api/v1/scholarships/:id/approve
请求: { approvedAmount?: number, amount?: number, opinion?: string, remark?: string, targetStatus?: string }
返回: { bizType, bizId, oldStatus, newStatus, updatedAt, auditLog, statistics, nextAction }
```

#### 2.6.4 助学金驳回

```
POST /api/v1/scholarships/:id/reject
请求: { rejectReason?: string, remark?: string }
返回: 同批准结构
```

#### 2.6.5 助学金打款

```
POST /api/v1/scholarships/:id/disburse
请求: { amount?: number, payoutMethod?: string, remark?: string }
返回: { ...批准结构, payoutRecordId, paidAt, messageSent }
```

#### 2.6.6-2.6.10 贷款（同理）

```
GET    /api/v1/loans                    # 贷款列表
GET    /api/v1/loans/:id                # 贷款详情
POST   /api/v1/loans/:id/approve        # 贷款批准
POST   /api/v1/loans/:id/reject         # 贷款驳回
POST   /api/v1/loans/:id/disburse       # 贷款打款
```
请求/返回结构与助学金相同，增加 `loanType`(campus|origin_place)，`receiptNo`，`receiptVerified` 字段。

---

### 2.7 资料审核 (document)

**涉及页面**: teacher/doc-review

#### 2.7.1 资料审核列表

```
GET /api/v1/documents/reviews
请求: { page?, pageSize?, keyword?, status?, tab?(pending|passed|rejected) }
返回: {
  list: [{
    documentReviewId, uid,
    studentId, studentNo, sid, id, studentName, name,
    className, college, major,
    status(pending|first_pass|department_review|final_pass|rejected),
    submittedAt,
    materialTags: string[],    // ['身份证','录取通知书','户口本','证件照']
    materials: [{ fileId, fileName, fileType, url, previewUrl }],
    rejectReason: string|null,
    auditLogs: [{ node, result, time, remark }]
  }],
  total
}
```

#### 2.7.2 资料审核详情

```
GET /api/v1/documents/reviews/:id
返回: 单条完整记录（含学生信息、材料、审核日志）
```

#### 2.7.3 资料审核通过

```
POST /api/v1/documents/reviews/:id/approve
请求: { opinion?: string, remark?: string }
返回: { bizType, bizId, oldStatus, newStatus: 'first_pass', updatedAt, auditLog }
```

#### 2.7.4 资料审核驳回

```
POST /api/v1/documents/reviews/:id/reject
请求: { rejectReason?: string, remark?: string }
返回: { ...驳回结果, newStatus: 'rejected' }
```

#### 2.7.5 获取材料文件

```
GET /api/v1/materials/:bizType/:bizId
返回: { bizType, bizId, files: [{ fileId, fileName, fileType, url, previewUrl }] }
```

---

### 2.8 宿舍管理 (dormitory)

**涉及页面**: teacher/dorm-detail, teacher/room-change-review, government/dorm-review

#### 2.8.1 宿舍分配列表

```
GET /api/v1/dormitories/students
请求: { page?, pageSize?, keyword?, status? }
返回: {
  list: [{
    studentId, studentNo, studentName, name, gender, className,
    buildingId, buildingName, roomNo, bedNo, dormText, dormFee, status(assigned|non_dorm)
  }],
  total
}
```

#### 2.8.2 学生选宿详情

```
GET /api/v1/dormitories/students/:studentId
返回: {
  ...学生信息,
  student: object,
  currentDorm: { buildingName, roomNo, bedNo, dormText },
  applications: [],
  feeStandard: { itemName, amount },
  diffOrders: []
}
```

#### 2.8.3 宿舍统计

```
GET /api/v1/dormitory/stats
返回: { total, assigned, unassigned, nonDorm }
```

#### 2.8.4 楼栋列表

```
GET /api/v1/dormitories/buildings
返回: [{ buildingId, buildingName, genderLimit, floorCount, roomCount, bedCount, availableBedCount }]
```

#### 2.8.5 房间列表

```
GET /api/v1/dormitories/buildings/:buildingId/rooms
返回: [{ roomId, roomNo, floor, capacity, occupiedCount, availableBedCount, feeStandard, beds: [{ bedNo, occupied }] }]
```

#### 2.8.6 分配宿舍

```
POST /api/v1/dormitory/assign
请求: { studentId, buildingId, roomId, bedNo }
```

#### 2.8.7 换宿申请列表

```
GET /api/v1/dormitory/room-change-applications
请求: { page?, pageSize?, keyword?, status? }
返回: {
  list: [{
    applicationId, uid,
    studentId, studentNo, sid, studentName, name, phone, className,
    oldDorm: string,    // "3号楼 308室 4床"
    targetDorm: string,  // "3号楼 305室 1床"
    reason: string,
    status(pending|approved|rejected),
    applyTime, auditLogs,
    statusLabel(中文), badgeColor
  }],
  total
}
```

#### 2.8.8 换宿申请详情

```
GET /api/v1/dormitory/room-change-applications/:id
返回: 单条完整换宿申请
```

#### 2.8.9 换宿批准

```
POST /api/v1/dormitory/room-change-applications/:id/approve
请求: { remark?: string }
返回: { applicationId, dormitoryChanged, diffOrderId, oldStatus, newStatus: 'approved' }
```

#### 2.8.10 换宿驳回

```
POST /api/v1/dormitory/room-change-applications/:id/reject
请求: { remark?: string, rejectReason?: string }
返回: { oldStatus, newStatus: 'rejected' }
```

#### 2.8.11-2.8.14 退宿/校外住宿（同理）

```
GET    /api/v1/dormitory/withdraw-applications       # 退宿列表
GET    /api/v1/dormitory/withdraw-applications/:id   # 退宿详情
POST   /api/v1/dormitory/withdraw-applications/:id/approve
POST   /api/v1/dormitory/withdraw-applications/:id/reject

GET    /api/v1/dormitory/non-dorm-applications       # 校外住宿列表
GET    /api/v1/dormitory/non-dorm-applications/:id   # 校外住宿详情
POST   /api/v1/dormitory/non-dorm-applications/:id/approve
POST   /api/v1/dormitory/non-dorm-applications/:id/reject
```

---

### 2.9 退费 (refund)

**涉及页面**: finance/refund-review, finance/processed

**状态**: pending → processing（财务确认）→ success（退款到账）| failed（退款失败）

#### 2.9.1 退费列表

```
GET /api/v1/refunds
请求: { page?, pageSize?, keyword?, status? }
返回: {
  list: [{
    refundId, uid, refundNo,
    studentId, studentNo, sid, studentName, name,
    feeType, type(退住宿费|退教材费|退军训服费),
    reason, amount, refundableAmount,
    status(pending|approved|processing|refunded|failed|rejected),
    applyTime, failureReason,
    auditLogs: [{ node, result, time, remark }],
    statusLabel(中文), badgeColor
  }],
  total
}
```

#### 2.9.2 退费详情

```
GET /api/v1/refunds/:id
返回: 单条完整退费记录
```

#### 2.9.3 退费批准（财务确认退费）

```
POST /api/v1/refunds/:id/approve
请求: { opinion?: string, remark?: string, approvedAmount?: number }
返回: { bizType: 'refund', bizId, oldStatus, newStatus: 'approved', updatedAt, auditLog }
```

#### 2.9.4 退费驳回

```
POST /api/v1/refunds/:id/reject
请求: { rejectReason?: string, opinion?: string }
返回: { oldStatus, newStatus: 'rejected' }
```

#### 2.9.5 执行退费

```
POST /api/v1/refunds/:id/execute
返回: { newStatus: 'refunded' }
```

#### 2.9.6 退费失败重试

```
POST /api/v1/refunds/:id/retry
返回: { newStatus: 'refunded' }
```

#### 2.9.7 补差退款列表

```
GET /api/v1/refunds/diff
请求: { page?, pageSize?, keyword? }
返回: {
  list: [{ diffRefundId, diffOrderNo, oldDormFee, newDormFee, diffAmount, refundAmount, ...退费字段 }],
  total
}
```

#### 2.9.8 确认补差退款

```
POST /api/v1/refunds/diff/:id/confirm
返回: { diffRefundId, status: 'refunded', updatedAt }
```

#### 2.9.9 已处理记录

```
GET /api/v1/finance/processed-records
请求: { page?, pageSize?, keyword? }
返回: {
  list: [{
    recordId, bizType(scholarship|loan|refund), bizId,
    studentNo, studentName, amount, status,
    processedAt, operatorName, summary
  }],
  total
}
```

---

### 2.10 报到 (checkin)

**涉及页面**: teacher/checkin, government/checkin

#### 2.10.1 报到统计

```
GET /api/v1/checkin/statistics
返回: { total, checkedIn, unchecked, todayCheckedIn, checkinRate, byCollege: [], byClass: [] }
```

#### 2.10.2 报到学生列表

```
GET /api/v1/checkin/students
请求: { page?, pageSize?, keyword?, status? }
返回: {
  list: [{
    checkinId, studentId, studentNo, studentName, name,
    classId, className, paymentStatus, documentStatus,
    dormText, checkinStatus(pending|checked_in|delayed|blocked),
    checkedInAt, lastStatus(已报到|待报到|延期|阻塞), remark
  }],
  total
}
```

#### 2.10.3 报到操作

```
POST /api/v1/checkin/students/:studentId/confirm   # 确认报到
POST /api/v1/checkin/students/:studentId/cancel    # 取消报到
POST /api/v1/checkin/students/:studentId/delay     # 延期报到
POST /api/v1/checkin/students/:studentId/block     # 阻塞报到
请求: { reason?: string, remark?: string, expectedCheckinDate?: string }
返回: { studentId, checkinStatus, checkedInAt, operatorName, statistics, oldStatus, newStatus }
```

---

### 2.11 催缴 (reminder)

**涉及页面**: teacher/fee-home, teacher/checkin

#### 2.11.1 发送催缴

```
POST /api/v1/reminders/send
请求: { studentId: string, billIds?: string[], channels?: string[], templateCode?: string }
返回: { reminderId, sentAt, sendResults: [{ channel, status }], urgeCount }
```

#### 2.11.2 批量催缴

```
POST /api/v1/reminders/batch
请求: { studentIds: string[], channels?: string[], scope?: string }
返回: { taskId, total, accepted, skipped, skippedReasons }
```

#### 2.11.3 催缴任务列表

```
GET /api/v1/reminders/tasks
返回: { list: [{ taskId, taskName, targetCount, sentCount, status, createdBy, createdAt }], total }
```

#### 2.11.4 催缴记录

```
GET /api/v1/reminders/records
返回: { list: [{ reminderId, studentId, studentNo, studentName, channel, sendStatus, sentAt }], total }
```

---

### 2.12 消息 (message)

**涉及页面**: 三个 messages 页（均走 businessState）

#### 2.12.1 消息列表

```
GET /api/v1/messages
请求: { role: string, page?, pageSize?, keyword?, status? }
返回: {
  list: [{ messageId, type, title, icon, color, content, read, status, bizType, bizId, url, createdAt, readAt }],
  total
}
```

#### 2.12.2 未读计数

```
GET /api/v1/messages/unread-count
请求: { role: string }
返回: { count: number, byType: object }
```

#### 2.12.3 标记已读/全部已读/删除

```
PUT    /api/v1/messages/:id/read
PUT    /api/v1/messages/read-all
DELETE /api/v1/messages/:id
DELETE /api/v1/messages
```

#### 2.12.4 消息发送

```
POST /api/v1/messages/send
请求: { templateCode?, channels?, ... }
返回: { recordId, status }
```

#### 2.12.5 消息模板

```
GET /api/v1/messages/templates
```

---

### 2.13 校服 (uniform)

**涉及页面**: teacher/uniform（走 businessState）

#### 2.13.1 尺码列表

```
GET /api/v1/uniform/sizes
请求: { page?, pageSize?, keyword? }
返回: { list: [{ studentId, studentNo, studentName, name, gender, className, clothingSize, shoeSize, height, weight, remark, status }], total }
```

#### 2.13.2 尺码详情

```
GET /api/v1/uniform/sizes/:studentId
返回: 单条尺码记录
```

#### 2.13.3 尺码统计

```
GET /api/v1/uniform/sizes/statistics
返回: { total, filledCount, emptyCount, abnormalCount, byClothingSize: [{ size, count }], byShoeSize: [{ size, count }] }
```

---

### 2.14 线下收款 (offlinePayment)

**涉及页面**: finance/onsite（走 businessState）

#### 2.14.1 搜索学生账单

```
GET /api/v1/finance/offline-payment/search-student
请求: { keyword: string }
返回: {
  list: [{ billId, studentId, studentNo, studentName, college, major, className, schoolYear, chargeItem, totalAmount, paidAmount, unpaidAmount, paymentStatus, paymentStatusLabel, paymentStatusColor, lastPayTime, isGreenChannel }],
  total
}
```

#### 2.14.2 获取学生账单

```
GET /api/v1/finance/offline-payment/student-bill
请求: { studentNo?: string, keyword?: string }
返回: 单个学生账单对象
```

#### 2.14.3 登记线下收款

```
POST /api/v1/finance/offline-payment/register
请求: { studentNo: string, amount: number, payMethod?: string, method?: string, remark?: string, voucherFileId?: string }
返回: { offlinePaymentId, record, updatedPaymentStatus, updatedPaidAmount, updatedUnpaidAmount, enteredFinancePending }
```

#### 2.14.4 线下收款列表

```
GET /api/v1/finance/offline-payment/list
返回: { list: [{ id, studentNo, studentName, name, avatar, amount, method, collectionType, location, time, status, confirmTime, receiptNo, college, className, statusLabel, badgeColor }], total }
```

#### 2.14.5 确认线下收款

```
POST /api/v1/finance/offline-payment/confirm
请求: { id: string, collectionType?: string, remark?: string, confirmedBy?: string }
返回: { offlinePaymentId, oldStatus, status, receiptNo, paymentStatus, billStatuses, invoiceId }
```

#### 2.14.6 作废线下收款

```
POST /api/v1/finance/offline-payment/void
请求: { id: string }
返回: { offlinePaymentId, oldStatus, status, paymentStatus, message }
```

---

### 2.15 票据 (invoice)

**涉及页面**: finance/receipt, finance/receipt-detail（走 businessState）

#### 2.15.1 票据列表

```
GET /api/v1/invoices
请求: { page?, pageSize?, keyword? }
返回: { list: [{ invoiceId, invoiceNo, studentNo, studentName, itemName, amount, status, issuedAt, fileId }], total }
```

#### 2.15.2 票据详情

```
GET /api/v1/invoices/:id
```

#### 2.15.3 开具/补打/作废票据

```
POST /api/v1/invoices                       # 开具
POST /api/v1/invoices/:id/reprint           # 补打
POST /api/v1/invoices/:id/void              # 作废
```

---

### 2.16 文件 (file)

**涉及页面**: 各审核页的材料预览

#### 2.16.1 上传文件

```
POST /api/v1/files/upload (multipart)
请求: FormData { file, name?: string, ...params }
返回: { fileId, fileName, mimeType, size, url, previewUrl, uploadedAt }
```

#### 2.16.2 预览/下载文件

```
GET /api/v1/files/:fileId/preview
GET /api/v1/files/:fileId/download
返回: { previewUrl/downloadUrl, expiresAt, fileName? }
```

#### 2.16.3 批量打包材料

```
POST /api/v1/files/package
返回: { taskId, status, fileId, downloadUrl }
```

---

### 2.17 现场收款 (onsiteStaff)

**涉及页面**: 报到现场工作人员

#### 2.17.1 缴费核验

```
GET /api/staff/checkin/payment/verify
请求: { keyword?: string, studentNo?: string, verifyCode?: string }
返回: { studentName, studentNo, college, major, className, receivableAmount, paidAmount, unpaidAmount, paymentStatus, paymentStatusLabel, paymentStatusColor, clearance: { allowed, label, color, reason }, lastPaymentTime, checkedIn, checkinTime, isGreenChannel, note }
```

#### 2.17.2 记录核验日志

```
POST /api/staff/checkin/payment/verify-log
请求: { studentNo, studentName, verifyResult, verifyResultColor, verifyMethod, operatorId, operatorName }
```

#### 2.17.3 现场收款登记

```
POST /api/staff/checkin/offline-payment
请求: { studentNo, amount, payMethod?, method?, project?, remark?, voucherFileId?, receiptImage? }
```

#### 2.17.4 核验日志查询

```
GET /api/staff/checkin/payment/verify-logs
请求: { page?, pageSize? }
```

---

### 2.18 政务统计

#### 2.18.1 全局统计

```
GET /api/v1/government/stats/global
返回: { checkin: { total, checkedIn, unchecked, rate }, fees: { total, paid, paidCount, unpaidCount, rate }, aids: { total, approved, pending, rejected }, loans: 同aids, dorm: { total, changes, nonDorm } }
```

#### 2.18.2 学院统计

```
GET /api/v1/government/stats/college
返回: 同全局统计
```

---

## 三、当前 Mock 覆盖情况

Mock server 已覆盖以上所有路由。Mock 状态通过 `uni.getStorageSync('enroll_mock_api_state_v1')` 持久化。

### Mock 已实现的业务逻辑：

| 业务 | 覆盖 |
|------|------|
| 登录/认证 | ✅ 密码/短信/微信/角色切换 |
| 审核流转 | ✅ approve → 自动推进状态链 (pending→first_pass→review_pass→final_pass→payment_pending) |
| 驳回 | ✅ 任意节点 → rejected |
| 打款 | ✅ payment_pending → paid/completed |
| 换宿审批 | ✅ pending → approved/rejected |
| 退费处理 | ✅ approve → processing, execute/retry → refunded |
| 线下收款确认 | ✅ confirm → confirmed, void → voided |
| 报到操作 | ✅ confirm/cancel/delay/block |
| 分页查询 | ✅ keyword/status/tab 筛选 |
| 跨角色状态同步 | ✅ mock mutation 同步调用 businessState 函数 |

---

## 四、业务闭环检查清单

| 业务流程 | 涉及页面 | API 完整性 | 状态流转 |
|----------|---------|-----------|---------|
| 教师审核助学金 | aid-review | ✅ getDetail + approve + reject | pending→first_pass |
| 学院复审助学金 | government/aid-review | ✅ | first_pass→review_pass |
| 学工处终审助学金 | government/aid-final-review | ✅ | review_pass→final_pass |
| 财务打款助学金 | finance/aid-review | ✅ disburse | payment_pending→paid |
| 教师审核贷款 | loan-review | ✅ 同助学金 | 同上 |
| 资料审核 | doc-review | ✅ | pending→first_pass |
| 换宿审核 | room-change-review | ✅ | pending→approved/rejected |
| 退费审核 | refund-review | ✅ | pending→processing→success/failed |
| 线下收款确认 | collect-detail | ✅ | pending→confirmed/voided |
| 报到确认 | checkin | ✅ | pending↔checked_in/delayed/blocked |
| 催缴 | fee-home | ✅ send+batch | N/A |
| 登录 | login | ✅ 3种登录方式 | →各端首页 |

---

## 五、不需要 API 的页面（纯本地数据）

以下 44 个页面完全使用 `businessState.js` 本地数据，无需后端 API：

**教师端（14个）**：home, aid-home, aid-done, loan-home, doc-home, doc-done, dorm-home, non-dorm, non-dorm-review, room-change, supply, uniform/index, uniform/detail, messages

**财务端（16个）**：home, collect/index, collect-detail, refund/index, payout-aid, payout-loan, diff, receipt/index, receipt-detail, records, onsite, verify, urge, uniform, checkin, messages

**政务端（14个）**：home, aid-home, aid-final-home, aid-done, loan-home, loan-final-home, dorm-home, dorm-done, non-dorm, non-dorm-review, room-change, app-process, stats, messages
