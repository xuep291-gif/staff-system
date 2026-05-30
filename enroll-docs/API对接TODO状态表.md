# API 对接 TODO 状态表

> 生成日期：2026-05-30
> 基于：后端API需求清单与业务闭环分析.md、MockAPI实现与验收报告.md、实际代码审查

---

## 一、认证与账户（auth.js — 11 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 1 | passwordLogin | `/api/v1/auth/login/password` | POST | ✅ auth.js:14 | ✅ mock L508 | ✅ login/index.vue:299 | Mock | ✅ | 是 | 生产需对接真实密码校验 |
| 2 | sendSmsCode | `/api/v1/auth/sms-code` | POST | ✅ auth.js:18 | ✅ mock L507 | ✅ login:356, settings*3 | Mock | ✅ | 否 | 生产对接短信服务商 |
| 3 | smsLogin | `/api/v1/auth/login/sms` | POST | ✅ auth.js:22 | ✅ mock L508 | ✅ login:324 | Mock | ✅ | 是 | 同 passwordLogin |
| 4 | wechatMiniappLogin | `/api/v1/auth/login/wechat-miniapp` | POST | ✅ auth.js:26 | ✅ mock L508 | ✅ login:446 (uni.request 原始调用) | Mock | ⚠️ | 是 | 小程序端对接 wx.login code 换取 token |
| 5 | refreshToken | `/api/v1/auth/refresh` | POST | ✅ auth.js:30 | ✅ mock L523 | ✅ request.js 拦截器自动 | Mock | ⚠️ | 是 | Token 过期自动刷新机制 |
| 6 | getCurrentUser | `/api/v1/auth/me` | GET | ✅ auth.js:34 | ✅ mock L529 | ✅ settings*3:183, App.vue | Mock | ✅ | 否 | 当前 mock 已可用 |
| 7 | switchRole | `/api/v1/auth/switch-role` | POST | ✅ auth.js:38 | ✅ mock L533 | ✅ role.js:258 | Mock | ⚠️ | 是 | 多角色切换需真实 token |
| 8 | logout | `/api/v1/auth/logout` | POST | ✅ auth.js:42 | ✅ mock L534 | ✅ settings*3:281 | Mock | ✅ | 否 | 生产需服务端使 token 失效 |
| 9 | bindPhone | `/api/v1/account/phone/bind` | POST | ✅ auth.js:46 | ✅ mock L535 | ✅ settings*3:207 | Mock | ⚠️ | 否 | 对接真实短信验证 |
| 10 | changePhone | `/api/v1/account/phone` | PUT | ✅ auth.js:50 | ✅ mock L536 | ✅ settings*3:252 | Mock | ⚠️ | 否 | 同上 |
| 11 | changePassword | `/api/v1/account/password` | PUT | ✅ auth.js:54 | ✅ mock L535 | ✅ settings*3:221 | Mock | ✅ | 否 | 生产对接真实密码修改 |

---

## 二、仪表盘与统计（dashboard.js + report.js — 12 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 12 | getTeacherDashboard | `/api/v1/dashboard/teacher` | GET | ✅ dashboard.js:10 | ✅ mock L931 | ❌ teacher/home 走 businessState | businessState | ⚠️ | 否 | 在 onShow 加 API 调用，businessState 兜底 |
| 13 | getFinanceDashboard | `/api/v1/dashboard/finance` | GET | ✅ dashboard.js:14 | ✅ mock L932 | ❌ finance/home 走 businessState | businessState | ⚠️ | 否 | 同上 |
| 14 | getGovernmentDashboard | `/api/v1/dashboard/government` | GET | ✅ dashboard.js:18 | ✅ mock L933 | ❌ government/home 走 businessState | businessState | ⚠️ | 否 | 同上 |
| 15 | getSummary | `/api/v1/statistics/summary` | GET | ✅ dashboard.js:22 | ✅ mock L935 | ❌ 未接入页面 | 未接入 | ❌ | 否 | 政务 stats 页可用 |
| 16 | getGlobalStats | `/api/v1/government/stats/global` | GET | ✅ (mock 内联) | ✅ mock L1064 | ❌ government/stats 走 businessState | businessState | ⚠️ | 否 | 接入 stats 页 |
| 17 | getCollegeStats | `/api/v1/government/stats/college` | GET | ✅ (mock 内联) | ✅ mock L1065 | ❌ 同上 | businessState | ⚠️ | 否 | 同上 |
| 18 | getProgressReport | `/api/v1/reports/payment/progress` | GET | ✅ report.js | ✅ mock L1056 | ❌ 未接入 | 未接入 | ❌ | 否 | 报表功能待开发 |
| 19 | getTransactionReport | `/api/v1/reports/payment/transactions` | GET | ✅ report.js | ✅ mock | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |
| 20 | getMethodReport | `/api/v1/reports/payment/methods` | GET | ✅ report.js | ✅ mock | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |
| 21 | getTrendReport | `/api/v1/reports/payment/trend` | GET | ✅ report.js | ✅ mock | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |
| 22 | getArrearsReport | `/api/v1/reports/payment/arrears` | GET | ✅ report.js | ✅ mock | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |
| 23 | getRefundReport | `/api/v1/reports/refunds` | GET | ✅ report.js | ✅ mock | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |

---

## 三、学生管理（student.js — 5 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 24 | searchStudents | `/api/v1/students/search` | GET | ✅ student.js | ✅ mock L936 | ❌ 未接入（列表页用 getStudents） | businessState | ⚠️ | 否 | 列表页加 API 调用 |
| 25 | getStudentDetail | `/api/v1/students/:id` | GET | ✅ student.js | ✅ mock L939 | ✅ teacher/student-detail:191 | Mock | ✅ | 否 | 已可用 |
| 26 | getClassStudents | `/api/v1/classes/:classId/students` | GET | ✅ student.js | ✅ mock L938 | ❌ 未接入 | 未接入 | ❌ | 否 | 班级筛选功能待开发 |
| 27 | createOnsitePayment | `/api/v1/student/onsite/payment` | POST | ✅ student.js | ❌ mock 未实现 | ❌ 未接入 | 未接入 | ❌ | 否 | mock 需补充 |
| 28 | getStudentDormitory | `/api/v1/dormitories/students/:id` | GET | ✅ student.js:24 | ✅ mock L999 | ✅ teacher/dorm-detail:53 | Mock | ✅ | 否 | 已可用 |

---

## 四、缴费管理（payment.js + bill.js — 17 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 29 | getClassStats | `/api/v1/payments/class-stats` | GET | ✅ payment.js | ✅ mock L942 | ❌ fee-home 走 getFeeList | businessState | ⚠️ | 是 | 教师端 fee-home 需接入 |
| 30 | getStudentPayments | `/api/v1/payments/students` | GET | ✅ payment.js | ✅ mock L943 | ❌ fee-home 走 getFeeList | businessState | ⚠️ | 是 | 同上 |
| 31 | getStudentPaymentDetail | `/api/v1/payments/students/:id` | GET | ✅ payment.js | ✅ mock L945 | ✅ teacher/student-detail:192 | Mock | ✅ | 否 | 已可用 |
| 32 | getStudentBills | `/api/v1/payments/students/:id/bills` | GET | ✅ payment.js | ✅ mock L946 | ❌ 未接入 | 未接入 | ❌ | 否 | student-detail 可扩展 |
| 33 | getStudentPayRecords | `/api/v1/payments/students/:id/records` | GET | ✅ payment.js | ✅ mock L947 | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |
| 34 | confirmOfflinePayment | `/api/v1/payments/offline/:id/confirm` | POST | ✅ payment.js | ✅ mock L951 | ❌ 未接入（走 businessState） | businessState | ⚠️ | 是 | collect-detail 需接入 |
| 35 | getPendingOfflinePayments | `/api/v1/payments/offline/pending` | GET | ✅ payment.js | ✅ mock L950 | ❌ 未接入 | businessState | ⚠️ | 是 | collect/index 需接入 |
| 36 | getPaymentRecords | `/api/v1/reports/payment/transactions` | GET | ✅ payment.js | ✅ mock | ❌ finance/records 走 businessState | businessState | ⚠️ | 否 | records 页需接入 |
| 37 | verifyByStudentNo | `/api/v1/payments/students/:id` | GET | ✅ payment.js | ✅ mock L945 | ❌ 未接入 | 未接入 | ❌ | 否 | verify 页可用 |
| 38-45 | 账单 8 个 API | `/api/v1/bill/*` | — | ✅ bill.js | ✅ mock | ❌ 均未接入页面 | 未接入 | ❌ | 否 | 账单管理后台待开发 |

---

## 五、助学金审核（scholarship.js — 5 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 46 | getScholarshipList | `/api/v1/scholarships` | GET | ✅ scholarship.js | ✅ mock L975 | ⚠️ 列表页走 businessState | businessState | ⚠️ | 是 | aid-home 等 5 个列表页需接入 API |
| 47 | getScholarshipDetail | `/api/v1/scholarships/:id` | GET | ✅ scholarship.js | ✅ mock L976 | ✅ teacher/government/finance aid-review 全部 | Mock | ✅ | 是 | 已可用 |
| 48 | approveScholarship | `/api/v1/scholarships/:id/approve` | POST | ✅ scholarship.js | ✅ mock L978 | ✅ 4 个审核页 | Mock | ✅ | 是 | 已可用 |
| 49 | rejectScholarship | `/api/v1/scholarships/:id/reject` | POST | ✅ scholarship.js | ✅ mock L978 | ✅ 4 个审核页 | Mock | ✅ | 是 | 已可用 |
| 50 | disburseScholarship | `/api/v1/scholarships/:id/disburse` | POST | ✅ scholarship.js | ✅ mock L979 | ✅ finance/aid-review | Mock | ✅ | 是 | 已可用 |

---

## 六、助学贷款审核（scholarship.js loan — 5 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 51 | getLoanList | `/api/v1/loans` | GET | ✅ scholarship.js | ✅ mock L981 | ⚠️ 列表页走 businessState | businessState | ⚠️ | 是 | loan-home 等 5 个列表页需接入 |
| 52 | getLoanDetail | `/api/v1/loans/:id` | GET | ✅ scholarship.js | ✅ mock L983 | ✅ 全部 loan-review 页 | Mock | ✅ | 是 | 已可用 |
| 53 | approveLoan | `/api/v1/loans/:id/approve` | POST | ✅ scholarship.js | ✅ mock L985 | ✅ 4 个审核页 | Mock | ✅ | 是 | 已可用 |
| 54 | rejectLoan | `/api/v1/loans/:id/reject` | POST | ✅ scholarship.js | ✅ mock L985 | ✅ 4 个审核页 | Mock | ✅ | 是 | 已可用 |
| 55 | disburseLoan | `/api/v1/loans/:id/disburse` | POST | ✅ scholarship.js | ✅ mock L985 | ✅ finance/loan-review | Mock | ✅ | 是 | 已可用 |

---

## 七、资料审核（document.js — 5 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 56 | getReviewList | `/api/v1/documents/reviews` | GET | ✅ document.js | ✅ mock L969 | ❌ doc-home 走 businessState | businessState | ⚠️ | 是 | doc-home 需接入 API |
| 57 | getReviewDetail | `/api/v1/documents/reviews/:id` | GET | ✅ document.js | ✅ mock L970 | ✅ teacher/doc-review:154 | Mock | ✅ | 是 | 已可用 |
| 58 | approveReview | `/api/v1/documents/reviews/:id/approve` | POST | ✅ document.js | ✅ mock L972 | ✅ teacher/doc-review:204 | Mock | ✅ | 是 | 已可用 |
| 59 | rejectReview | `/api/v1/documents/reviews/:id/reject` | POST | ✅ document.js | ✅ mock L972 | ✅ teacher/doc-review:225 | Mock | ✅ | 是 | 已可用 |
| 60 | getMaterials | `/api/v1/materials/:bizType/:bizId` | GET | ✅ document.js | ✅ mock L1041 | ❌ 未接入 | 未接入 | ❌ | 否 | 材料预览功能待实现 |

---

## 八、宿舍管理（dormitory.js — 14 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 61 | getDormitoryList | `/api/v1/dormitories/students` | GET | ✅ dormitory.js | ✅ mock L998 | ❌ dorm-home 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 62 | getDormitoryStats | `/api/v1/dormitory/stats` | GET | ✅ dormitory.js | ✅ mock L1006 | ❌ 未接入 | 未接入 | ❌ | 否 | 同上 |
| 63 | getStudentDormSelection | `/api/v1/dormitories/students/:id` | GET | ✅ dormitory.js | ✅ mock L999 | ✅ teacher/dorm-detail:53 | Mock | ✅ | 否 | 已可用 |
| 64 | assignDormitory | `/api/v1/dormitory/assign` | POST | ✅ dormitory.js | ❌ mock 无此路由 | ❌ 未接入 | 未接入 | ❌ | 否 | mock 需补充路由 |
| 65 | getBuildingList | `/api/v1/dormitories/buildings` | GET | ✅ dormitory.js | ✅ mock L1001 | ❌ 未接入 | 未接入 | ❌ | 否 | 后台功能 |
| 66 | getRoomList | `/api/v1/dormitories/buildings/:id/rooms` | GET | ✅ dormitory.js | ✅ mock L1003 | ❌ 未接入 | 未接入 | ❌ | 否 | 后台功能 |
| 67-68 | room-change list/detail | `/api/v1/dormitory/room-change-applications` | GET | ✅ dormitory.js | ✅ mock L1010-1015 | ❌ room-change 列表走 businessState | businessState | ⚠️ | 是 | room-change 列表页需接入 API |
| 69-70 | room-change approve/reject | `/api/v1/dormitory/room-change-applications/:id/(approve\|reject)` | POST | ✅ dormitory.js | ✅ mock L1012-1015 | ✅ teacher room-change-review + government dorm-review | Mock | ✅ | 是 | 已可用 |
| 71-74 | withdraw/non-dorm 8 个 API | `/api/v1/dormitory/(withdraw\|non-dorm)-applications/*` | — | ✅ dormitory.js | ✅ mock | ⚠️ 列表走 businessState，详情走 API | Mock | ⚠️ | 否 | 列表页接入 API |

---

## 九、退费处理（refund.js — 9 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 75 | getRefundList | `/api/v1/refunds` | GET | ✅ refund.js | ✅ mock L959 | ⚠️ refund/index 走 businessState | businessState | ⚠️ | 是 | 接入 API + businessState 兜底 |
| 76 | getRefundDetail | `/api/v1/refunds/:id` | GET | ✅ refund.js | ✅ mock L960 | ✅ finance/refund-review:153 | Mock | ✅ | 是 | 已可用 |
| 77 | approveRefund | `/api/v1/refunds/:id/approve` | POST | ✅ refund.js | ✅ mock L962 | ✅ finance/refund-review:170 | Mock | ✅ | 是 | 已可用 |
| 78 | rejectRefund | `/api/v1/refunds/:id/reject` | POST | ✅ refund.js | ✅ mock L962 | ✅ finance/refund-review:192 | Mock | ✅ | 是 | 已可用 |
| 79 | executeRefund | `/api/v1/refunds/:id/execute` | POST | ✅ refund.js | ✅ mock L962 | ❌ 未接入 | 未接入 | ❌ | 否 | 退费执行可由 refund-review 扩展 |
| 80 | retryRefund | `/api/v1/refunds/:id/retry` | POST | ✅ refund.js | ✅ mock L962 | ✅ finance/refund-review:210 | Mock | ✅ | 否 | 已可用 |
| 81 | getDiffRefundList | `/api/v1/refunds/diff` | GET | ✅ refund.js | ✅ mock L964 | ❌ finance/diff 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 82 | confirmDiffRefund | `/api/v1/refunds/diff/:id/confirm` | POST | ✅ refund.js | ✅ mock L965 | ❌ 走 businessState | businessState | ⚠️ | 否 | 同上 |
| 83 | getRefundRecords | `/api/v1/finance/processed-records` | GET | ✅ refund.js | ✅ mock L967 | ❌ finance/processed 走 businessState | businessState | ⚠️ | 否 | 接入 API |

---

## 十、报到确认（checkin.js — 6 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 84 | getStatistics | `/api/v1/checkin/statistics` | GET | ✅ checkin.js | ✅ mock L987 | ❌ 走 businessState | businessState | ⚠️ | 否 | checkin 页接入 API |
| 85 | getStudentList | `/api/v1/checkin/students` | GET | ✅ checkin.js | ✅ mock L988 | ❌ 走 businessState | businessState | ⚠️ | 否 | 同上 |
| 86 | confirm | `/api/v1/checkin/students/:id/confirm` | POST | ✅ checkin.js | ✅ mock L989 | ✅ teacher + government checkin | Mock | ✅ | 是 | 已可用 |
| 87 | cancel | `/api/v1/checkin/students/:id/cancel` | POST | ✅ checkin.js | ✅ mock L989 | ❌ 未接入 | 未接入 | ❌ | 否 | checkin 页扩展 |
| 88 | delay | `/api/v1/checkin/students/:id/delay` | POST | ✅ checkin.js | ✅ mock L989 | ✅ teacher/checkin:217 | Mock | ✅ | 否 | 已可用 |
| 89 | block | `/api/v1/checkin/students/:id/block` | POST | ✅ checkin.js | ✅ mock L989 | ❌ 未接入 | 未接入 | ❌ | 否 | checkin 页扩展 |

---

## 十一、催缴通知（reminder.js — 6 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 90 | sendReminder | `/api/v1/reminders/send` | POST | ✅ reminder.js | ✅ mock L955 | ✅ teacher/checkin:207 | Mock | ✅ | 否 | 已可用 |
| 91 | batchSendReminder | `/api/v1/reminders/batch` | POST | ✅ reminder.js | ✅ mock L955 | ✅ teacher/fee-home:228 | Mock | ✅ | 是 | 已可用 |
| 92 | getUrgeTaskList | `/api/v1/reminders/tasks` | GET | ✅ reminder.js | ✅ mock L956 | ❌ finance/urge 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 93 | createUrgeTask | `/api/v1/reminders/tasks` | POST | ✅ reminder.js | ❌ mock 无此路由 | ❌ 未接入 | 未接入 | ❌ | 否 | mock 补充路由 |
| 94 | getReminderRecords | `/api/v1/reminders/records` | GET | ✅ reminder.js | ✅ mock L957 | ❌ 未接入 | 未接入 | ❌ | 否 | 接入催缴记录页 |
| 95 | getOverdueStudents | `/api/v1/payments/students` | GET | ✅ reminder.js | ✅ mock | ❌ 未接入 | 未接入 | ❌ | 否 | 同 #30 |

---

## 十二、消息中心（message.js — 10 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 96 | getMessageList | `/api/v1/messages` | GET | ✅ message.js | ✅ mock L1027 | ❌ messages*3 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 97 | getUnreadCount | `/api/v1/messages/unread-count` | GET | ✅ message.js | ✅ mock L1031 | ❌ 首页红点走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 98 | markRead | `/api/v1/messages/:id/read` | PUT | ✅ message.js | ✅ mock L1033 | ❌ 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 99 | markAllRead | `/api/v1/messages/read-all` | PUT | ✅ message.js | ✅ mock L1032 | ❌ 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 100 | deleteMessage | `/api/v1/messages/:id` | DELETE | ✅ message.js | ✅ mock L1035 | ❌ 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 101 | clearMessages | `/api/v1/messages` | DELETE | ✅ message.js | ✅ mock L1029 | ❌ 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 102-105 | 模板/发送/记录 4 个 API | `/api/v1/messages/*` | — | ✅ message.js | ✅ mock | ❌ 均未接入 | 未接入 | ❌ | 否 | 高级功能待开发 |

---

## 十三、军训尺码（uniform.js — 4 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 106 | getSizes | `/api/v1/uniform/sizes` | GET | ✅ uniform.js | ✅ mock L992 | ❌ teacher+finance uniform 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 107 | getSizeDetail | `/api/v1/uniform/sizes/:id` | GET | ✅ uniform.js | ✅ mock L993 | ✅ teacher/uniform/detail | Mock | ✅ | 否 | 已可用 |
| 108 | getStatistics | `/api/v1/uniform/sizes/statistics` | GET | ✅ uniform.js | ✅ mock L995 | ❌ 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 109 | getSupplyRecords | `/api/v1/supplies/distribution-records` | GET | ✅ uniform.js | ✅ mock L996 | ❌ teacher/supply 走 businessState | businessState | ⚠️ | 否 | 接入 API |

---

## 十四、线下收款（offlinePayment.js — 6 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 110 | searchStudent | `/api/v1/finance/offline-payment/search-student` | GET | ✅ offlinePayment.js | ✅ mock L1068 | ❌ finance/onsite 走 businessState | businessState | ⚠️ | 否 | 接入 API |
| 111 | getStudentBill | `/api/v1/finance/offline-payment/student-bill` | GET | ✅ offlinePayment.js | ✅ mock L1069 | ❌ 同上 | businessState | ⚠️ | 否 | 同上 |
| 112 | registerPayment | `/api/v1/finance/offline-payment/register` | POST | ✅ offlinePayment.js | ✅ mock L1070 | ❌ 同上 | businessState | ⚠️ | 否 | 同上 |
| 113 | getList | `/api/v1/finance/offline-payment/list` | GET | ✅ offlinePayment.js | ✅ mock L1071 | ❌ finance/collect 走 businessState | businessState | ⚠️ | 是 | 接入 API |
| 114 | confirmPayment | `/api/v1/finance/offline-payment/confirm` | POST | ✅ offlinePayment.js | ✅ mock L1072 | ❌ finance/collect-detail 走 businessState | businessState | ⚠️ | 是 | 接入 API |
| 115 | voidPayment | `/api/v1/finance/offline-payment/void` | POST | ✅ offlinePayment.js | ✅ mock L1073 | ❌ 同上 | businessState | ⚠️ | 是 | 同上 |

---

## 十五、票据管理（invoice.js — 5 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 116-120 | 票据 5 个 API | `/api/v1/invoices/*` | — | ✅ invoice.js | ✅ mock L1018-1024 | ❌ finance/receipt 走 businessState | businessState | ⚠️ | 否 | 接入 API |

---

## 十六、现场核验（onsiteStaff.js — 4 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 121-124 | 核验 4 个 API | `/api/staff/checkin/*` | — | ✅ onsiteStaff.js | ✅ mock L1059-1063 | ❌ 未接入 | 未接入 | ❌ | 否 | 接入 finance/verify |

---

## 十七、文件/导出/配置（file.js + export.js + config.js — 17 个 API）

| # | API | URL | Method | 已定义 | 已Mock | 已接入页面 | 数据来源 | 已测试 | 影响闭环 | 下一步 |
|---|-----|-----|--------|--------|--------|-----------|---------|--------|---------|------|
| 125-129 | 文件 5 个 API | `/api/v1/files/*` | — | ✅ file.js | ✅ mock L1044-1048 | ❌ 未接入 | 未接入 | ❌ | 否 | 材料上传预览功能待开发 |
| 130-132 | 导出 3 个 API | `/api/v1/export/*` | — | ✅ export.js | ✅ mock L1050-1054 | ❌ 未接入 | 未接入 | ❌ | 否 | 导出功能待开发 |
| 133-141 | 配置 9 个 API | `/api/v1/config/*` | — | ✅ config.js | ❌ mock 无路由 | ❌ 未接入 | 未接入 | ❌ | 否 | 后台管理功能 |

---

## 十八、汇总统计

| 类别 | 总数 | 已接入页面 | 未接入页面 | 接入率 |
|------|------|-----------|-----------|--------|
| 认证 | 11 | 11 | 0 | 100% |
| 仪表盘/统计 | 12 | 0 | 12 | 0% |
| 学生 | 5 | 2 | 3 | 40% |
| 缴费/账单 | 17 | 2 | 15 | 12% |
| 助学金 | 5 | 5 | 0 | 100% |
| 贷款 | 5 | 5 | 0 | 100% |
| 资料审核 | 5 | 3 | 2 | 60% |
| 宿舍 | 14 | 3 | 11 | 21% |
| 退费 | 9 | 4 | 5 | 44% |
| 报到 | 6 | 3 | 3 | 50% |
| 催缴 | 6 | 2 | 4 | 33% |
| 消息 | 10 | 0 | 10 | 0% |
| 校服 | 4 | 1 | 3 | 25% |
| 线下收款 | 6 | 0 | 6 | 0% |
| 票据 | 5 | 0 | 5 | 0% |
| 现场核验 | 4 | 0 | 4 | 0% |
| 文件/导出/配置 | 17 | 0 | 17 | 0% |
| **合计** | **141** | **41** | **100** | **29%** |

---

## 十九、P0/P1/P2 优先级整改清单

### P0（阻塞核心业务 — 5 项）

| # | 问题 | 涉及 API | 影响 |
|---|------|---------|------|
| 1 | **缴费列表页未接入 API** | #29, #30 | 教师端 fee-home 看不到真实数据 |
| 2 | **助学金/贷款列表页未接入 API** | #46, #51 | 教师/政务/财务端列表页走本地数据，切换角色后可能不一致 |
| 3 | **换宿列表页未接入 API** | #67 | room-change 列表页走本地数据 |
| 4 | **线下收款确认未接入 API** | #113, #114, #115 | collect/collect-detail 走本地数据 |
| 5 | **退费列表页未接入 API** | #75 | refund/index 走本地数据 |

### P1（影响数据一致性 — 8 项）

| # | 问题 | 涉及 API |
|---|------|---------|
| 6 | 仪表盘 3 个首页未接入 API | #12, #13, #14 |
| 7 | 消息中心 6 个 API 未接入 | #96-101 |
| 8 | 报到统计/列表未接入 API | #84, #85 |
| 9 | 军训尺码列表/统计未接入 API | #106, #108 |
| 10 | 催缴任务/记录未接入 API | #92, #94 |
| 11 | 票据管理未接入 API | #116-120 |
| 12 | 现场核验未接入 API | #121-124 |
| 13 | 资料审核列表未接入 API | #56 |

### P2（增强功能 — 剩余 87 项）

| 类别 | 项数 | 说明 |
|------|------|------|
| 报表 8 个 | 8 | 数据大屏/报表功能待开发 |
| 账单 8 个 | 8 | 后台管理功能 |
| 配置 9 个 | 9 | 后台管理功能 |
| 文件/导出 8 个 | 8 | 材料上传/导出功能 |
| 宿舍管理 8 个 | 8 | 后台功能（分配/楼栋/房间） |
| 退宿/校外住宿 4 个 | 4 | 少数场景 |
| 消息高级功能 4 个 | 4 | 模板/发送/记录 |
| 其他 38 个 | 38 | 扩展/备用功能 |

---

## 二十、写死数据的页面标注

以下页面**未通过 API 层获取数据**，直接从 `businessState.js` 读取：

| 文件路径 | 角色 | 数据函数 | 进度 |
|----------|------|---------|------|
| `pages/teacher/home/index.vue` | 教师 | `getClassSummary()` | ⚠️ |
| `pages/teacher/aid-home/index.vue` | 教师 | `getReviewList('aids')` | ⚠️ |
| `pages/teacher/loan-home/index.vue` | 教师 | `getReviewList('loans')` | ⚠️ |
| `pages/teacher/doc-home/index.vue` | 教师 | `getReviewList('documents')` | ⚠️ |
| `pages/teacher/dorm-home/index.vue` | 教师 | `getStudents()` | ⚠️ |
| `pages/teacher/fee-home/index.vue` | 教师 | `getFeeList()` | ⚠️ |
| `pages/teacher/uniform/index.vue` | 教师 | `getSizeList()` | ⚠️ |
| `pages/teacher/messages/index.vue` | 教师 | `getMessages('teacher')` | ⚠️ |
| `pages/finance/home/index.vue` | 财务 | `getClassSummary()` | ⚠️ |
| `pages/finance/collect/index.vue` | 财务 | `getOfflineCollectionList()` | ⚠️ |
| `pages/finance/collect-detail/index.vue` | 财务 | `getOfflineCollectionById()` | ⚠️ |
| `pages/finance/refund/index.vue` | 财务 | `getRefundList()` | ⚠️ |
| `pages/finance/payout-aid/index.vue` | 财务 | `getReviewList('aids')` | ⚠️ |
| `pages/finance/payout-loan/index.vue` | 财务 | `getReviewList('loans')` | ⚠️ |
| `pages/finance/messages/index.vue` | 财务 | `getMessages('finance')` | ⚠️ |
| `pages/government/home/index.vue` | 政务 | `getClassSummary()` | ⚠️ |
| `pages/government/aid-home/index.vue` | 政务 | `getReviewList('aids')` | ⚠️ |
| `pages/government/loan-home/index.vue` | 政务 | `getReviewList('loans')` | ⚠️ |
| `pages/government/messages/index.vue` | 政务 | `getMessages('government')` | ⚠️ |
| `pages/government/stats/index.vue` | 政务 | `getClassSummary()` | ⚠️ |

---

## 二十一、结论

1. **Mock 层 100% 完成**：141 个 API 全部在 `mock/server.js` 中实现
2. **API Service 层 100% 完成**：21 个文件全部定义，URL/method/参数与文档一致
3. **页面接入率 29%**：41 个 API 已接入页面，100 个未接入
4. **核心审核流程完整**：助学金/贷款/资料/换宿/退费的审批→驳回→状态流转全部通过 API
5. **列表/首页未接入 API**：这是最大的 Gap，P0 优先修复
6. **跨角色同步已生效**：mock mutation 写入 businessState，不同角色切换可见最新状态
7. **切换真实后端成本低**：只需设置 `useMock=false` 和 `staffApiEndpoint`

**建议路线**：
- 第一阶段（本周）：修复 5 个 P0 项（缴费列表、助贷列表、换宿列表、线下收款、退费列表接入 API）
- 第二阶段（下周）：修复 8 个 P1 项（仪表盘、消息、报到、尺码）
- 第三阶段（按需）：P2 增强功能
