# Enroll-js 业务接口对接文档

> 本机: `http://localhost:3100` | 远程: **`http://192.168.0.199:3100`**（前端同事用这个）  
> 协议: HTTP + JSON  
> 说明: 报名/教务/宿舍管理系统业务接口

---

## 1. 概述

enroll-js 是一个**高校教务管理系统**的业务接口层，涵盖学院管理、学生教师、宿舍分配、缴费等模块。所有接口返回标准 JSON，无需额外认证（可在前面加统一网关做鉴权）。

### 业务数据表一览

| 模块 | 实体表 | 说明 |
|------|--------|------|
| 学院管理 | `college`, `college_department`, `college_major`, `college_class` | 学院 → 系 → 专业 → 班级 |
| 学生教师 | `student`, `teacher`, `college_student`, `college_teacher` | 学生和教师 |
| 宿舍楼宇 | `building_info`, `building_floor`, `building_room`, `building_room_bed` | 楼栋 → 楼层 → 房间 → 床位 |
| 宿舍分配 | `dormset_assignment_rule`, `dormset_select_batch`, `dormset_student_select_priority`, `dormset_assignment_record`, `dormset_assign_log` | 选宿舍批次/优先级/分配记录 |
| 缴费系统 | `fee_subject`, `fee_item`, `fee_standard`, `fee_dorm_standard`, `billing` | 费用科目/标准/账单 |
| 系统配置 | `system_config`, `user_profile`, `contact_info` | 配置和个人信息 |

---

## 2. 健康检查

### GET /health

检查服务状态和数据库连接。

响应：
```json
{
    "status": "ok",
    "database": "connected"
}
```

数据库断开时返回 `{ "status": "degraded", "database": "disconnected", "error": "..." }`，HTTP 503。

---

## 3. 实体管理

### 3.1 GET /api/entities

获取所有 EAV 实体列表（最多 100 条）。

响应：
```json
[
    {
        "id": 2,
        "entityName": "student",
        "entityType": "DS_ENTITY",
        "tableName": "t_data_student",
        "orgId": 1
    },
    {
        "id": 32,
        "entityName": "dormset_assignment_record",
        "entityType": "DS_ENTITY",
        "tableName": null,
        "orgId": 1
    }
]
```

### 3.2 GET /api/entities/:id

获取单个实体详情。

示例：`GET /api/entities/2`

响应：
```json
{
    "id": 2,
    "entityName": "student",
    "entityType": "DS_ENTITY",
    "tableName": "t_data_student",
    "description": "Student entity for educational management system",
    "orgId": 1,
    "appid": null,
    "deleteFlag": 0,
    "searchFields": null,
    "resourceIdentifier": null,
    "storageMode": null,
    "statusCounts": null,
    "orderBy": null,
    "createdAt": "2026-05-13T14:46:27.984Z",
    "updatedAt": "2026-05-21T20:40:24.151Z"
}
```

实体不存在时返回 `{ "error": "Entity not found" }`，HTTP 404。

---

## 4. 教师管理

### 4.1 GET /api/teachers/:teacherNo/classes

根据教师编号查询该教师所带的所有班级。

示例：`GET /api/teachers/T001/classes`

响应：
```json
{
    "teacher": {
        "id": 1,
        "teacher_no": "T001",
        "name": "刘老师"
    },
    "classes": [
        {
            "id": 1,
            "code": "CLS-1778942566853",
            "name": "测试计科2401班",
            "grade": 2024,
            "college_id": 2,
            "major_id": 1,
            "disabled": 0,
            "created_at": "2026-05-22T03:04:53.402Z",
            "updated_at": "2026-05-22T03:04:53.402Z"
        }
    ],
    "total": 1
}
```

教师不存在时返回 `{ "error": "Teacher not found: T002" }`，HTTP 404。

### 前端调用示例

```javascript
// 查刘老师的班级
const res = await fetch('http://localhost:3100/api/teachers/T001/classes');
const data = await res.json();
// data.teacher.name  → "刘老师"
// data.classes[0].name → "测试计科2401班"
```

---

## 5. 宿舍房间管理

### 5.1 GET /api/rooms/report

检查所有楼栋的期望房间数和实际房间数的差异（预览，不修改数据）。

会跨 4 张表 JOIN 计算：每栋楼的所有楼层 × 所有房型 = 期望房间数，然后与已有房间对比。

响应：
```json
{
    "summary": {
        "total": 120,
        "existing": 95,
        "missing": 25
    },
    "details": [
        {
            "building_code": "B01",
            "building_name": "一号宿舍楼",
            "floor": 1,
            "floor_type": "标准层",
            "unit_no": "101",
            "house_type": "四人间",
            "room_no": "1-101",
            "action": "create",
            "existing_room_id": null,
            "created_at": null
        },
        {
            "building_code": "B01",
            "building_name": "一号宿舍楼",
            "floor": 1,
            "floor_type": "标准层",
            "unit_no": "102",
            "house_type": "四人间",
            "room_no": "1-102",
            "action": "skip",
            "existing_room_id": 15,
            "created_at": "2026-05-20T...Z"
        }
    ]
}
```

| 字段 | 说明 |
|------|------|
| `action` | `skip`（已存在）或 `create`（缺失） |
| `room_no` | 规则生成的房间号：`楼层-房号` |

### 5.2 POST /api/rooms/generate

根据报告结果，自动补建缺失的房间。**会写入数据**。

响应（201）：
```json
{
    "summary": {
        "total": 120,
        "created": 25,
        "skipped": 95
    },
    "created": [
        {
            "building_code": "B01",
            "building_name": "一号宿舍楼",
            "floor": 1,
            "unit_no": "101",
            "room_no": "1-101",
            "created_at": "2026-05-24T00:00:00.000Z"
        }
    ]
}
```

如果所有房间已存在，返回：
```json
{
    "summary": { "total": 120, "created": 0, "skipped": 120 },
    "message": "All rooms already exist, nothing to create."
}
```

### 前端调用示例

```javascript
// 1. 先查报告
const report = await fetch('http://localhost:3100/api/rooms/report');
const { summary, details } = await report.json();
console.log(`总房间数: ${summary.total}, 缺失: ${summary.missing}`);

// 2. 确认后，生成缺失房间
const result = await fetch('http://localhost:3100/api/rooms/generate', {
    method: 'POST'
});
const data = await result.json();
console.log(`创建了 ${data.summary.created} 个房间`);
```

---

## 6. 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功（POST /api/rooms/generate） |
| 404 | 资源不存在 |
| 503 | 数据库连接断开 |

---

## 7. 完整对接流程示例

### 场景：查看刘老师的班级，检查宿舍，补建缺失房间

```javascript
// Step 1: 查教师班级
const tRes = await fetch('http://localhost:3100/api/teachers/T001/classes');
const teacherData = await tRes.json();
console.log(`${teacherData.teacher.name} 带了 ${teacherData.total} 个班`);
// → 刘老师 带了 1 个班

// Step 2: 查班级学生（需配合 EAV Service 的 row 接口）
// GET http://localhost:3333/cli/execute
// body: { command: "cfg", subcommand: "entity", args: ["data","list","college_class"] }

// Step 3: 查宿舍情况
const rRes = await fetch('http://localhost:3100/api/rooms/report');
const roomData = await rRes.json();
console.log(`缺失 ${roomData.summary.missing} 个房间`);

// Step 4: 补建房间
if (roomData.summary.missing > 0) {
    const genRes = await fetch('http://localhost:3100/api/rooms/generate', { method: 'POST' });
    const genData = await genRes.json();
    console.log(`已创建 ${genData.summary.created} 个房间`);
}
```

---

## 8. 学生端业务接口 (50 APIs)

### 8.1 认证与用户 (6 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-001 | POST | `/api/student/auth/login-code` | 验证码登录 (sid, phone, code) | 否 |
| API-002 | POST | `/api/student/auth/login-pwd` | 密码登录 (account, password) | 否 |
| API-003 | POST | `/api/student/auth/logout` | 退出登录 | 否 |
| API-004 | GET | `/api/student/profile` | 获取个人信息 | Token |
| API-005 | PUT | `/api/student/profile` | 更新个人信息 | Token |
| API-006 | POST | `/api/student/auth/send-code` | 发送验证码 (phone, sid) | 否 |

### 8.2 迎新材料提交 (5 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-007 | GET | `/api/student/orientation/status` | 迎新流程状态 | Token |
| API-008 | GET | `/api/student/orientation/documents` | 已上传材料列表 | Token |
| API-009 | POST | `/api/student/orientation/upload-document` | 上传单个材料 (form-data) | Token |
| API-010 | POST | `/api/student/orientation/submit-documents` | 提交全部材料 | Token |
| API-011 | GET | `/api/student/orientation/review-status` | 材料审核状态 | Token |

### 8.3 宿舍选择 (8 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-012 | GET | `/api/student/dorm/buildings` | 楼栋列表 (?gender=) | Token |
| API-013 | GET | `/api/student/dorm/floors` | 楼层列表 (?buildingId=) | Token |
| API-014 | GET | `/api/student/dorm/rooms` | 房间列表 (?floorId=) | Token |
| API-015 | GET | `/api/student/dorm/beds` | 床位列表 (?roomId=) | Token |
| API-016 | POST | `/api/student/dorm/select` | 确认选宿 | Token |
| API-017 | POST | `/api/student/dorm/no-dorm` | 放弃选宿 | Token |
| API-018 | GET | `/api/student/dorm/info` | 宿舍信息(含室友) | Token |
| API-019 | POST | `/api/student/dorm/change-apply` | 申请换宿 (reason) | Token |

### 8.4 缴费与账单 (9 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-020 | GET | `/api/student/bill/list` | 账单列表 (?year=) | Token |
| API-021 | GET | `/api/student/bill/detail` | 账单详情 (?billId=) | Token |
| API-022 | POST | `/api/student/payment/order` | 创建支付订单 | Token |
| API-023 | GET | `/api/student/payment/result` | 支付结果查询 (?orderId=) | Token |
| API-024 | GET | `/api/student/payment/history` | 缴费记录 (?page=&pageSize=&status=) | Token |
| API-025 | GET | `/api/student/payment/receipts` | 电子票据列表 | Token |
| API-026 | GET | `/api/student/payment/receipt/download` | 下载票据 (?receiptId=) | Token |
| API-027 | GET | `/api/student/payment/prepay` | 预缴费余额 | Token |
| API-028 | GET | `/api/student/bill/reminders` | 催缴通知列表 | Token |

### 8.5 退费 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-029 | POST | `/api/student/payment/refund` | 退费申请 (orderId, reason) | Token |
| API-030 | GET | `/api/student/payment/refund-history` | 退费记录 | Token |

### 8.6 助学金 (3 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-031 | GET | `/api/student/scholarship/types` | 助学金类型列表 | 否 |
| API-032 | POST | `/api/student/scholarship/apply` | 提交申请 | Token |
| API-033 | GET | `/api/student/scholarship/records` | 申请记录 | Token |

### 8.7 助学贷款 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-034 | POST | `/api/student/loan/apply` | 贷款申请 | Token |
| API-035 | GET | `/api/student/loan/records` | 贷款记录 | Token |

### 8.8 消息通知 (3 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-036 | GET | `/api/student/messages` | 消息列表 | Token |
| API-037 | POST | `/api/student/messages/read` | 标记已读 (messageId) | Token |
| API-038 | POST | `/api/student/messages/read-all` | 全部已读 | Token |

### 8.9 签到确认 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-039 | GET | `/api/student/checkin/status` | 签到状态 | Token |
| API-040 | POST | `/api/student/checkin/confirm` | 确认签到 (dormId) | Token |

### 8.10 预缴费 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-041 | GET | `/api/student/payment/prepay/records` | 预缴费记录 | Token |
| API-042 | POST | `/api/student/payment/prepay/order` | 预缴费充值 (amount, method) | Token |

### 8.11 地址管理 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-043 | GET | `/api/student/address/list` | 地址列表 | Token |
| API-044 | POST | `/api/student/address/save` | 保存地址 | Token |

### 8.12 院系专业 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-045 | GET | `/api/student/orgs` | 院系列表 | 否 |
| API-046 | GET | `/api/student/communities` | 专业/班级列表 (?orgId=) | 否 |

### 8.13 便民评价 (1 API)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-047 | POST | `/api/student/feedback/submit` | 提交评价 (rating, comment) | Token |

### 8.14 文件上传 (1 API)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-048 | POST | `/api/student/upload` | 通用文件上传 (?type=) | Token |

### 8.15 全局配置 (2 APIs)

| 编号 | 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|------|
| API-049 | GET | `/form` | 全局配置 (?id=1) | 否 |
| API-050 | GET | `/api/cms/notice/notices` | 公告列表 | 否 |

---

## 9. 三个服务的关系

```
前端 (enroll-app)
 │
 ├── User Service          ← 登录拿 Token / 用户管理
 │     POST /api/app/auth/user/login
 │
 ├── enroll-js (:3100)     ← 主要学生端业务接口 (50 APIs)
 │     /api/student/*              全部学生端业务
 │     /api/teachers/:id/classes  查教师班级
 │     /api/rooms/report          查宿舍报告
 │     /api/entities              查实体列表
 │     /form?id=1                 全局配置
 │     /api/cms/notice/notices    公告列表
 │
 └── EAV Service (:3333)   ← 管理员后台
       POST /cli/execute          动态配置表结构
```
