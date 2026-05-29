# 教职工端 API Mock 实现与对接状态清单

本文档基于 [api-todo-list.md](./api-todo-list.md) 逐项核对 API todo item。当前清单按唯一 `方法 + 路径` 统计，共 111 个 API；重复出现在“总体约定”和后续业务章节中的接口只记录一次。

本次补充到需求文档的接口：

- `POST /auth/refresh`：刷新 token，原文有刷新 token 要求但缺独立 API 条目。
- `POST /checkin/students/{studentId}/delay`：报到延期处理，原核心要求包含但缺独立 API 条目。
- `POST /checkin/students/{studentId}/block`：报到阻塞处理，原核心要求包含但缺独立 API 条目。

测试账号：

- 教师端：`1001 / 123456`，短信验证码：`13800138000 / 123456`
- 财务端：`2001 / 123456`，短信验证码：`13800138001 / 123456`
- 政务端：`3001 / 123456`，短信验证码：`13800138002 / 123456`

测试结果说明：

- `npm run build:h5`：通过。
- `npm run dev:h5`：当前机器启动开发服务器时固定监听 `127.0.0.1:8080`，系统返回 `EACCES: permission denied`；该问题属于本机端口权限/占用环境问题，不是 Mock API 或 service 编译问题。
- 构建中 Sass `@import`、legacy JS API 警告来自既有依赖，不影响本次接口对接构建通过。

## 对接状态清单

| 编号 | 模块 | API 名称 | 方法 | 路径 | 是否已写入需求文档 | 是否已 Mock | 是否已对接 API/service 层 | 是否已接入页面 | 是否支持分页 | 是否支持筛选 | 是否支持状态变更 | 是否支持角色隔离 | 是否已测试 | 当前状态 | 备注 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 登录鉴权 | 密码登录 | POST | `/auth/login/password` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 登录页已通过 `authApi.passwordLogin` 接入，返回角色首页 |
| 2 | 登录鉴权 | 发送短信验证码 | POST | `/auth/sms-code` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 公共 | 是 | 已完成 | 验证码 mock 固定 `123456` |
| 3 | 登录鉴权 | 短信登录 | POST | `/auth/login/sms` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 登录页已通过 `authApi.smsLogin` 接入 |
| 4 | 登录鉴权 | 微信小程序登录 | POST | `/auth/login/wechat-miniapp` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service 与 mock 已有，当前 H5 登录页未使用；openId/unionId 返回需后端确认 |
| 5 | 登录鉴权 | 获取当前用户 | GET | `/auth/me` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service 已有，页面刷新态仍主要依赖本地存储 |
| 6 | 登录鉴权 | 切换当前角色 | POST | `/auth/switch-role` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，暂无显式角色切换页面 |
| 7 | 登录鉴权 | 登出 | POST | `/auth/logout` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 公共 | 部分 | 部分完成 | 设置页尚未全面改造为调用 service |
| 8 | 登录鉴权 | 刷新 Token | POST | `/auth/refresh` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 公共 | 部分 | 部分完成 | 已补入需求文档；请求重放逻辑仍待完善 |
| 9 | 设置 / 个人中心 | 绑定手机号 | POST | `/account/phone/bind` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 公共 | 部分 | 部分完成 | service/mock 已有，页面未全面接入 |
| 10 | 设置 / 个人中心 | 修改手机号 | PUT | `/account/phone` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 公共 | 部分 | 部分完成 | service/mock 已有，页面未全面接入 |
| 11 | 设置 / 个人中心 | 修改密码 | PUT | `/account/password` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 公共 | 部分 | 部分完成 | service/mock 已有，密码强度规则需后端确认 |
| 12 | 首页统计 | 教师端首页 | GET | `/dashboard/teacher` | 是 | 是 | 是 | 是 | 不适用 | 是 | 不适用 | 是 | 是 | 已完成 | 教师首页已接入统计和未读数 |
| 13 | 首页统计 | 财务端首页 | GET | `/dashboard/finance` | 是 | 是 | 是 | 是 | 不适用 | 是 | 不适用 | 是 | 是 | 已完成 | 财务首页已接入待办和未读数 |
| 14 | 首页统计 | 政务端首页 | GET | `/dashboard/government` | 是 | 是 | 是 | 是 | 不适用 | 是 | 不适用 | 是 | 是 | 已完成 | 政务首页已接入待办和未读数 |
| 15 | 状态统计 | 通用状态统计 | GET | `/statistics/summary` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 部分完成 | mock 支持主要业务类型，页面多数仍通过列表刷新计数 |
| 16 | 学生基础 | 搜索学生 | GET | `/students/search` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，当前页面未作为主入口使用 |
| 17 | 学生基础 | 班级学生列表 | GET | `/classes/{classId}/students` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，班级详情页待改造 |
| 18 | 学生基础 | 学生详情 | GET | `/students/{studentId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，学生详情页仍有本地数据路径 |
| 19 | 缴费管理 / 催缴 | 班级缴费统计 | GET | `/payments/class-stats` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，教师缴费页主要使用列表聚合 |
| 20 | 缴费管理 / 催缴 | 学生缴费列表 | GET | `/payments/students` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 教师缴费页已接入，支持状态筛选 |
| 21 | 缴费管理 / 催缴 | 学生缴费详情 | GET | `/payments/students/{studentId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，详情页面未全面替换 |
| 22 | 缴费管理 / 催缴 | 学生账单明细 | GET | `/payments/students/{studentId}/bills` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 23 | 缴费管理 / 催缴 | 学生缴费记录 | GET | `/payments/students/{studentId}/records` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 24 | 缴费管理 / 催缴 | 单人催缴 | POST | `/reminders/send` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，页面当前使用批量催缴为主 |
| 25 | 缴费管理 / 催缴 | 批量催缴 | POST | `/reminders/batch` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 教师缴费页已接入，成功后刷新列表 |
| 26 | 缴费管理 / 催缴 | 催缴任务列表 | GET | `/reminders/tasks` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，任务列表页未接入 |
| 27 | 缴费管理 / 催缴 | 催缴记录列表 | GET | `/reminders/records` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，记录页未接入 |
| 28 | 线下收款确认 | 线下收款待确认列表 | GET | `/payments/offline/pending` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 财务线下收款确认页已接入 |
| 29 | 线下收款确认 | 线下收款确认 | POST | `/payments/offline/{offlinePaymentId}/confirm` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 确认后 mock 同步缴费状态 |
| 30 | 财务退费审核 | 退费列表 | GET | `/refunds` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 财务退费页已接入 |
| 31 | 财务退费审核 | 退费详情 | GET | `/refunds/{refundId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，页面使用列表弹层展示 |
| 32 | 财务退费审核 | 退费审核通过 | POST | `/refunds/{refundId}/approve` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 财务退费页已接入 |
| 33 | 财务退费审核 | 退费审核驳回 | POST | `/refunds/{refundId}/reject` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 财务退费页已接入 |
| 34 | 财务退费审核 | 执行退费 | POST | `/refunds/{refundId}/execute` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 通过后页面调用执行退费 |
| 35 | 财务退费审核 | 退费失败重试 | POST | `/refunds/{refundId}/retry` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，失败重试页面入口未接入 |
| 36 | 财务退费审核 | 补差退款列表 | GET | `/refunds/diff` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，补差页未全面接入 |
| 37 | 财务退费审核 | 补差退款确认 | POST | `/refunds/diff/{diffRefundId}/confirm` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，补差确认页面待接入 |
| 38 | 财务退费审核 | 已处理记录 | GET | `/finance/processed-records` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，已处理页待替换 |
| 39 | 缴费管理 / 催缴 | 票据列表 | GET | `/invoices` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service 已从旧路径迁移，页面未接入 |
| 40 | 缴费管理 / 催缴 | 票据详情 | GET | `/invoices/{invoiceId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 41 | 缴费管理 / 催缴 | 开具票据 | POST | `/invoices` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 待后端确认 | service/mock 已有，开票规则需后端确认 |
| 42 | 缴费管理 / 催缴 | 补打票据 | POST | `/invoices/{invoiceId}/reprint` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，页面未接入 |
| 43 | 缴费管理 / 催缴 | 作废票据 | POST | `/invoices/{invoiceId}/void` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 待后端确认 | 作废权限与状态机需后端确认 |
| 44 | 资料审核 | 资料审核列表 | GET | `/documents/reviews` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 教师资料首页已接入 |
| 45 | 资料审核 | 资料审核详情 | GET | `/documents/reviews/{documentReviewId}` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 不适用 | 是 | 是 | 已完成 | 教师资料审核页已接入 |
| 46 | 资料审核 | 资料审核通过 | POST | `/documents/reviews/{documentReviewId}/approve` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 操作后状态变更 |
| 47 | 资料审核 | 资料审核退回 | POST | `/documents/reviews/{documentReviewId}/reject` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 操作后状态变更 |
| 48 | 文件预览 / 下载 | 业务材料列表 | GET | `/materials/{bizType}/{bizId}` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，材料弹层仍以静态展示为主 |
| 49 | 助学金审核 | 助学金申请列表 | GET | `/scholarships` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 教师/财务列表已接入；政务列表 service 可用但页面待全面替换 |
| 50 | 助学金审核 | 助学金详情 | GET | `/scholarships/{scholarshipId}` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 不适用 | 是 | 是 | 已完成 | 教师/财务详情页已接入 |
| 51 | 助学金审核 | 助学金审批通过 | POST | `/scholarships/{scholarshipId}/approve` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 教师审核页已接入 |
| 52 | 助学金审核 | 助学金驳回 | POST | `/scholarships/{scholarshipId}/reject` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 教师/财务审核页已接入 |
| 53 | 助学金审核 | 助学金打款 | POST | `/scholarships/{scholarshipId}/disburse` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 财务打款页已接入 |
| 54 | 助学贷款审核 | 助学贷款列表 | GET | `/loans` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 教师/财务列表已接入；政务列表 service 可用但页面待全面替换 |
| 55 | 助学贷款审核 | 助学贷款详情 | GET | `/loans/{loanId}` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 不适用 | 是 | 是 | 已完成 | 教师/财务详情页已接入 |
| 56 | 助学贷款审核 | 助学贷款审批通过 | POST | `/loans/{loanId}/approve` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 教师审核页已接入 |
| 57 | 助学贷款审核 | 助学贷款驳回 | POST | `/loans/{loanId}/reject` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 教师/财务审核页已接入 |
| 58 | 助学贷款审核 | 助学贷款打款/冲抵 | POST | `/loans/{loanId}/disburse` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 财务打款页已接入 |
| 59 | 住宿管理 | 宿舍/住宿列表 | GET | `/dormitories/students` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，住宿页面仍有本地数据路径 |
| 60 | 住宿管理 | 学生住宿详情 | GET | `/dormitories/students/{studentId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/m2ock 已有 |
| 61 | 住宿管理 | 换宿申请列表 | GET | `/dormitory/room-change-applications` | 是 | 是 | 否 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 62 | 住宿管理 | 换宿申请详情 | GET | `/dormitory/room-change-applications/{applicationId}` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 63 | 住宿管理 | 换宿审批通过 | POST | `/dormitory/room-change-applications/{applicationId}/approve` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | mock 状态可变更，缺 service/page |
| 64 | 住宿管理 | 换宿审批驳回 | POST | `/dormitory/room-change-applications/{applicationId}/reject` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | mock 状态可变更，缺 service/page |
| 65 | 住宿管理 | 退宿申请列表 | GET | `/dormitory/withdraw-applications` | 是 | 是 | 否 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 66 | 住宿管理 | 退宿申请详情 | GET | `/dormitory/withdraw-applications/{applicationId}` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 67 | 住宿管理 | 退宿审批通过 | POST | `/dormitory/withdraw-applications/{applicationId}/approve` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | mock 状态可变更，缺 service/page |
| 68 | 住宿管理 | 退宿审批驳回 | POST | `/dormitory/withdraw-applications/{applicationId}/reject` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | mock 状态可变更，缺 service/page |
| 69 | 住宿管理 | 校外住宿申请列表 | GET | `/dormitory/non-dorm-applications` | 是 | 是 | 否 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 70 | 住宿管理 | 校外住宿申请详情 | GET | `/dormitory/non-dorm-applications/{applicationId}` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 71 | 住宿管理 | 校外住宿审批通过 | POST | `/dormitory/non-dorm-applications/{applicationId}/approve` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | mock 状态可变更，缺 service/page |
| 72 | 住宿管理 | 校外住宿审批驳回 | POST | `/dormitory/non-dorm-applications/{applicationId}/reject` | 是 | 是 | 否 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | mock 状态可变更，缺 service/page |
| 73 | 住宿管理 | 宿舍楼栋列表 | GET | `/dormitories/buildings` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 公共 | 部分 | 部分完成 | service/mock 已有 |
| 74 | 住宿管理 | 宿舍房间列表 | GET | `/dormitories/buildings/{buildingId}/rooms` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 公共 | 部分 | 部分完成 | service/mock 已有 |
| 75 | 报到确认 | 报到统计 | GET | `/checkin/statistics` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，首页统计间接使用 |
| 76 | 报到确认 | 报到学生列表 | GET | `/checkin/students` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，报到页尚未全面替换 |
| 77 | 报到确认 | 确认报到 | POST | `/checkin/students/{studentId}/confirm` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，页面待接入 |
| 78 | 报到确认 | 取消报到 | POST | `/checkin/students/{studentId}/cancel` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，页面待接入 |
| 79 | 报到确认 | 报到延期 | POST | `/checkin/students/{studentId}/delay` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | 已补入需求文档；页面待接入 |
| 80 | 报到确认 | 报到阻塞 | POST | `/checkin/students/{studentId}/block` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | 已补入需求文档；页面待接入 |
| 81 | 军训尺码 / 用品发放 | 尺码列表 | GET | `/uniform/sizes` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，页面待全面替换 |
| 82 | 军训尺码 / 用品发放 | 尺码详情 | GET | `/uniform/sizes/{studentId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 83 | 军训尺码 / 用品发放 | 尺码统计 | GET | `/uniform/sizes/statistics` | 是 | 是 | 是 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 84 | 军训尺码 / 用品发放 | 用品发放记录 | GET | `/supplies/distribution-records` | 是 | 是 | 否 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | mock 已有，缺统一 service 方法和页面接入 |
| 85 | 消息通知 | 消息列表 | GET | `/messages` | 是 | 是 | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 已完成 | 消息中心已接入 |
| 86 | 消息通知 | 未读数量 | GET | `/messages/unread-count` | 是 | 是 | 是 | 是 | 不适用 | 是 | 不适用 | 是 | 是 | 已完成 | 首页/消息中心已接入 |
| 87 | 消息通知 | 单条标记已读 | PUT | `/messages/{messageId}/read` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 消息中心已接入 |
| 88 | 消息通知 | 全部标记已读 | PUT | `/messages/read-all` | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 是 | 是 | 已完成 | 消息中心已接入 |
| 89 | 消息通知 | 单条删除 | DELETE | `/messages/{messageId}` | 是 | 是 | 是 | 是 | 不适用 | 不适用 | 是 | 是 | 是 | 已完成 | 消息中心已接入 |
| 90 | 消息通知 | 清空消息 | DELETE | `/messages` | 是 | 是 | 是 | 是 | 不适用 | 是 | 是 | 是 | 是 | 已完成 | 消息中心已接入 |
| 91 | 消息通知 | 通知模板列表 | GET | `/messages/templates` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，模板管理页未接入 |
| 92 | 消息通知 | 创建通知模板 | POST | `/messages/templates` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 待后端确认 | 模板变量和审核规则需后端确认 |
| 93 | 消息通知 | 发送通知 | POST | `/messages/send` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，发送页面未接入 |
| 94 | 消息通知 | 发送记录 | GET | `/messages/send-records` | 是 | 是 | 是 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，发送记录页未接入 |
| 95 | 文件预览 / 下载 | 文件上传 | POST | `/files/upload` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，当前管理端页面未触发上传 |
| 96 | 文件预览 / 下载 | 文件预览 Token | GET | `/files/{fileId}/preview-token` | 是 | 否 | 否 | 否 | 不适用 | 不适用 | 不适用 | 是 | 否 | 未开始 | 总体约定中存在但 mock/service 未实现；当前实现使用 `/files/{fileId}/preview` |
| 97 | 文件预览 / 下载 | 文件预览 | GET | `/files/{fileId}/preview` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，材料弹层尚未实际打开签名 URL |
| 98 | 文件预览 / 下载 | 文件下载 | GET | `/files/{fileId}/download` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有，页面下载按钮待接入 |
| 99 | 文件预览 / 下载 | 材料包下载 | POST | `/files/package` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，页面入口待接入 |
| 100 | 导出接口 | 创建导出任务 | POST | `/export/tasks` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 是 | 是 | 部分 | 部分完成 | service/mock 已有，页面导出按钮待接入 |
| 101 | 导出接口 | 查询导出任务 | GET | `/export/tasks/{taskId}` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 102 | 导出接口 | 下载导出文件 | GET | `/export/tasks/{taskId}/download` | 是 | 是 | 是 | 否 | 不适用 | 不适用 | 不适用 | 是 | 部分 | 部分完成 | service/mock 已有 |
| 103 | 业务状态事件 | 状态变更事件拉取 | GET | `/events/business-state?since=<eventId>` | 是 | 是 | 否 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 部分完成 | mock 已写状态事件，缺 service/page |
| 104 | 报表接口 | 收费进度报表 | GET | `/reports/payment/progress` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | mock 路径是 `/reports/*`，现有 reportApi 仍写成 `/report/*`，需修复 service 路径 |
| 105 | 报表接口 | 收费流水报表 | GET | `/reports/payment/transactions` | 是 | 是 | 否 | 否 | 是 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 路径少了 `s` |
| 106 | 报表接口 | 支付方式统计 | GET | `/reports/payment/methods` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 路径少了 `s` |
| 107 | 报表接口 | 收费趋势 | GET | `/reports/payment/trend` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 路径少了 `s` |
| 108 | 报表接口 | 欠费统计 | GET | `/reports/payment/arrears` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 路径少了 `s` |
| 109 | 报表接口 | 退款统计 | GET | `/reports/refunds` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 当前为 `/report/refund`，需修复 |
| 110 | 报表接口 | 补差退款统计 | GET | `/reports/diff-refunds` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 当前为 `/report/diff-refund`，需修复 |
| 111 | 报表接口 | 综合看板 | GET | `/reports/dashboard` | 是 | 是 | 否 | 否 | 不适用 | 是 | 不适用 | 是 | 部分 | 需修复 | reportApi 当前为 `/report/dashboard`，需修复 |

## 汇总统计

| 指标 | 数量 |
|---|---:|
| API 总数 | 111 |
| 已 Mock | 110 |
| 已对接 service/api | 89 |
| 已接入页面 | 37 |
| 已测试通过 | 37 |
| 未完成 | 1 |
| 待后端确认 | 4 |

说明：

- “已测试通过”按页面级真实接入或核心流程构建验证通过统计；仅 service/mock 存在但页面未接入的接口不计入“已测试通过”。
- “未完成”当前仅 `GET /files/{fileId}/preview-token`，因为需求文档总体约定中提到该接口，但实际实现选择了 `/files/{fileId}/preview`。
- 报表接口 mock 已覆盖 `/reports/*`，但 service 层路径仍为 `/report/*`，因此当前状态标记为“需修复”。

## 待处理问题清单

| 编号 | 模块 | 问题 | 影响页面 | 建议处理方式 | 优先级 |
|---|---|---|---|---|---|
| 1 | 文件预览 / 下载 | `GET /files/{fileId}/preview-token` 在需求总体约定中存在，但 mock/service 未实现 | 材料预览、资料审核、助学金审核、助学贷款审核 | 二选一：补 mock/service 的 preview-token；或将需求文档统一改为 `/files/{fileId}/preview` | P1 |
| 2 | 报表接口 | `reportApi` 使用 `/api/v1/report/*`，需求和 mock 是 `/api/v1/reports/*` | 收费报表、退款报表、综合看板 | 修复 `enroll-app/src/common/api/report.js` 路径为 `/reports/*` | P1 |
| 3 | 住宿管理 | 换宿、退宿、校外住宿审批 API 已 mock，但缺统一 service 方法且页面仍偏本地状态 | 教师/政务住宿审批相关页面 | 扩展 `dormitoryApi`，将住宿审批页改为 service 调用 | P1 |
| 4 | 报到确认 | 报到列表和确认/延期/阻塞接口已有 service/mock，但页面未全面接入 | 教师端报到确认、政务端报到确认 | 将 `teacher/checkin`、`government/checkin` 改为 `checkinApi` 拉取和提交 | P1 |
| 5 | 文件和导出 | 文件预览、下载、导出任务 service/mock 已有，但页面按钮未全面调用 | 审核材料、缴费导出、军训尺码导出 | 在对应页面补文件预览/下载/导出按钮调用，并处理文件名 | P2 |
| 6 | 设置 / 个人中心 | 修改密码、手机号、登出 service/mock 已有，但三端设置页未全面接入 | 教师/财务/政务设置页 | 设置页统一调用 `authApi`，刷新本地用户信息 | P2 |
| 7 | 政务端资助/贷款 | 政务端首页已接入，资助/贷款列表和详情 service 可用但页面仍需全面替换 | 政务端助学金、助学贷款审核页 | 按教师端模式接入 `scholarshipApi`，操作后刷新列表和统计 | P2 |
| 8 | 通知模板 | 模板和发送记录接口已有 service/mock，但没有管理页面接入 | 通知模板、发送记录页面 | 如果后续需要运营维护通知模板，再补页面；否则保持 service/mock 备用 | P3 |

## 修改文件清单

- `enroll-docs/api-todo-list.md`
- `enroll-docs/api-mock-implementation-status.md`

## 最终交付

- `enroll-docs/api-mock-implementation-status.md`
- 更新后的 `enroll-docs/api-todo-list.md`
- 修改文件清单
- 测试结果说明
- 对接状态清单
- API 需求清单（教职工端）
