# 财务端真实登录跳转旧UI问题分析

> 分析日期：2026-05-31  
> 问题：Mock 登录显示新版财务端 UI，数据库真实账号登录显示旧版 UI  
> 范围：只分析，不修改代码

---

## 一、页面路径确认

**只存在一个财务端首页**：[`pages/finance/home/index`](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\pages\finance\home\index.vue)

该页面根据 `profile.position` 渲染 **三种不同 UI**：

| 条件 | 渲染内容 | 对应 |
|------|---------|------|
| `position === 'cashier'` | 收款仪表盘（今日实收、已缴/未缴人数） | **新版 UI** |
| `isApprovalRole` (student_affairs/college_leader) | 审批视图（数据范围、助学金/贷款待办） | 审批 UI |
| `else` | 迎新现场服务卡片 | **旧版 UI** |

---

## 二、Mock 登录 vs 真实 DB 登录：完整对比

### 2.1 Mock 登录返回示例

**来源**：[mock/server.js:506-521](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\mock\server.js#L506-L521)

```json
{
  "code": 0,
  "data": {
    "accessToken": "mock_token_finance_1717000000",
    "refreshToken": "mock_refresh_1717000000",
    "expiresIn": 7200,
    "user": {
      "userId": "staff_finance_001",
      "name": "陈美玲",
      "workNo": "F2026001",
      "phone": "13800138001",
      "roles": ["finance"],
      "type": 3,
      "typeList": [3],
      "hasType": true,
      "orgId": "org-001",
      "orgName": "华东科技大学",
      "departmentName": "财务处",
      "subRole": "fee_collector",
      "permissions": [
        "finance:overview", "finance:collect", "finance:records",
        "finance:refund", "finance:diff", "finance:receipt",
        "finance:urge", "finance:payout", "finance:aid-review",
        "finance:loan-review", "finance:stats"
      ],
      "dataScope": { "type": "all" },
      "accessToken": "mock_token_finance_1717000000"
    },
    "defaultRole": "finance",
    "homePage": "/pages/finance/home/index",
    "permissions": ["finance:*"]
  }
}
```

**Mock 跳转路径**：`/pages/finance/home/index`

### 2.2 真实 DB 登录返回示例

**来源**：[auth.ts:14-35](d:\study\backend\enroll-js\src\routes\staff\auth.ts#L14-L35) `buildUserResponse` + [auth.ts:38-96](d:\study\backend\enroll-js\src\routes\staff\auth.ts#L38-L96) `passwordLogin`

```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 7200,
    "user": {
      "userId": "3626",
      "name": "陈美玲",
      "avatar": null,
      "phone": "13800138001",
      "workNo": "F2026001",
      "roles": ["teacher", "finance"],
      "type": 2,
      "typeList": [2, 3],
      "hasType": true,
      "orgId": "1",
      "orgName": "",
      "departmentId": "",
      "departmentName": "",
      "subRole": "head_teacher",
      "permissions": ["teacher:*", "finance:*"],
      "dataScope": { "type": "all" }
    },
    "defaultRole": "teacher",
    "homePage": "/pages/finance/home/index",
    "permissions": ["teacher:*", "finance:*"]
  }
}
```

**真实登录跳转路径**：`/pages/finance/home/index`

### 2.3 跳转路径对比

| | Mock | 真实 DB |
|------|------|---------|
| `resolveRole()` 结果 | `finance` | `finance`（`typeList.includes('finance')`） |
| `homePage` 路径 | `/pages/finance/home/index` | `/pages/finance/home/index` |

**跳转路径相同，进入的是同一个页面。UI 差异来自页面内部的条件渲染。**

---

## 三、差异字段分析

| 字段 | Mock | 真实 DB | 影响 |
|------|------|---------|------|
| `type` | **3** (finance) | **2** (teacher) | 直接读 `type` 的代码会误判为教师 |
| `typeList` | **[3]** | **[2, 3]** | `resolveRole` 能纠正，但非规范用法 |
| `roles` | `["finance"]` | `["teacher", "finance"]` | 角色数组，`roles[0]` 始终为 teacher |
| `subRole` | `"fee_collector"` | `"head_teacher"` | **子角色完全错误！** |
| `orgName` | `"华东科技大学"` | `""`（空） | Banner 学校名为空 |
| `departmentName` | `"财务处"` | `""`（空） | 部门信息丢失 |
| `permissions` | 具体 11 项权限 | `["teacher:*", "finance:*"]` | 通配符格式 |
| `userId` | `"staff_finance_001"` | `"3626"` (DB ID) | ID 格式不同 |
| `defaultRole` | `"finance"` | `"teacher"` | 默认角色错误 |
| `homePage` | `/pages/finance/home/index` | `/pages/finance/home/index` | 相同 |

---

## 四、根因定位

### 根因 1（核心）：`auth.ts` 的 `roles` 数组构造 bug

**文件**：[enroll-js/src/routes/staff/auth.ts:53-68](d:\study\backend\enroll-js\src\routes\staff\auth.ts#L53-L68)

```typescript
// Line 53: 初始化为 teacher
let roles: string[] = ['teacher'];

// Line 58-64: 查 t_data_user_profile，追加角色
const profileRows = await db.execute(sql`
  SELECT role_code FROM t_data_user_profile WHERE user_id = ${String(user.id)} LIMIT 5
`);
for (const r of (profileRows as any[])) {
  if (r.role_code && !roles.includes(r.role_code)) roles.push(r.role_code);
  // 如果查到 role_code = 'finance' → roles = ['teacher', 'finance']
}

// Line 15: primaryRole 始终取 roles[0]
const primaryRole = roles[0] || 'teacher';  // ← 永远是 'teacher'！

// Line 16-17:
const type = ROLE_TYPE_MAP[primaryRole] || 2;  // ROLE_TYPE_MAP['teacher'] = 2
const subRole = ROLE_SUB_MAP[primaryRole] || '';  // ROLE_SUB_MAP['teacher'] = 'head_teacher'
```

**问题链**：
1. `roles` 初始值 `['teacher']`，其他角色通过 push 追加
2. `primaryRole = roles[0]` 永远等于 `'teacher'`
3. `type = 2`（教师）、`subRole = 'head_teacher'`（班主任）
4. 即使用户实际是财务，`subRole` 也被设为 `'head_teacher'` 而非 `'fee_collector'`

### 根因 2（次要）：`staffPosition` 与 `subRole` 字段不匹配

**两个文件各用各的 key**：

| 文件 | 写 | 读 |
|------|-----|-----|
| [login/index.vue:502](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\pages\login\index.vue#L502) | `subRole: userInfo.subRole` | — |
| [staffAccess.js:35](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\utils\staffAccess.js#L35) | — | `user.staffPosition` |

`saveUserInfo` 存的是 `subRole`，`getStaffProfile` 读的是 `staffPosition`。两个 key 对不上 → `staffPosition` 永远 undefined → 永远 fallback 到 `'cashier'`。

**Mock 和真实登录都受此 bug 影响**，所以这不是 UI 差异的直接原因，但意味着子角色区分功能始终未生效。

### 根因 3（次要）：`buildUserResponse` 缺少字段

**文件**：[auth.ts:14-35](d:\study\backend\enroll-js\src\routes\staff\auth.ts#L14-L35)

```typescript
return {
  // ...
  orgName: '',           // Mock 返回 '华东科技大学'
  departmentId: '',       // Mock 返回具体部门
  departmentName: '',     // Mock 返回 '财务处'
  // 缺少 staffPosition
};
```

---

## 五、为什么会显示旧版 UI

finance/home/index.vue 的三种渲染分支（[line 20-60](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\pages\finance\home\index.vue#L20-L60)）：

```html
<!-- 分支 A: 新版收款 UI -->
<view v-if="profile.position === STAFF_POSITIONS.CASHIER">  <!-- 'cashier' -->

<!-- 分支 B: 审批 UI -->
<view v-else-if="isApprovalRole">  <!-- 'student_affairs' 或 'college_leader' -->

<!-- 分支 C: 旧版迎新现场 UI -->
<view v-else>
```

`profile.position` 来自 `getStaffProfile()` → `user.staffPosition || STAFF_POSITIONS.CASHIER`。

**正常情况下**，`staffPosition` 未设置 → 默认 `'cashier'` → 显示**新版 UI**（分支 A）。

**如果用户看到旧版 UI**（分支 C），说明 `profile.position` 既不是 `'cashier'` 也不是审批角色。这可能发生在：

1. **登录响应数据结构异常**，`saveUserInfo` 存入的 `query` 对象被 `$cache` 存储后，`readUserInfo()` 解析出不正确的 `staffPosition` 值
2. **`$cache` 读出的旧缓存**未被正确清除 — 如果同一浏览器之前用其他账号登录过，`userInfo` 中可能残留旧的 `staffPosition` 值
3. **`onPwdLogin` 中的 `uni.removeStorageSync("userInfo")` 未清除 `$cache` 格式的存储** — `$cache` 写的是 `JSON + '_|_' + expire` 格式，但 `uni.getStorageSync/removeStorageSync` 用的是同一 key `userInfo`，理论上应该能清除

**最可能的原因是根因 1**：真实登录返回 `type: 2, subRole: 'head_teacher'`，这些字段被存入 userInfo。如果后续页面加载时 `readUserInfo()` 解析这些数据，且某处代码直接使用 `userInfo.type === 2` 判断角色（而非通过 `resolveRole`），就会错误地按教师身份渲染。

---

## 六、涉及文件清单

| 文件 | 行号 | 问题 |
|------|------|------|
| [enroll-js/src/routes/staff/auth.ts](d:\study\backend\enroll-js\src\routes\staff\auth.ts) | 53-68 | `roles` 初始化 `['teacher']` + push 追加，`roles[0]` 始终为 teacher |
| [enroll-js/src/routes/staff/auth.ts](d:\study\backend\enroll-js\src\routes\staff\auth.ts) | 14-35 | `buildUserResponse` 缺 `orgName`、`departmentName`、`staffPosition` |
| [enroll-js/src/routes/staff/auth.ts](d:\study\backend\enroll-js\src\routes\staff\auth.ts) | 12 | `ROLE_SUB_MAP` 映射 `finance → 'fee_collector'` 但因 `primaryRole` 错误被覆盖 |
| [login/index.vue](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\pages\login\index.vue) | 480-504 | `saveUserInfo` 存 `subRole` 但不存 `staffPosition` |
| [staffAccess.js](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\utils\staffAccess.js) | 34-42 | `getStaffProfile` 读 `staffPosition` 而非 `subRole` |
| [finance/home/index.vue](d:\study\backend\迎新收费系统教师端\迎新收费系统教师端\enroll-app\src\pages\finance\home\index.vue) | 20-60 | 三个条件分支，依赖 `profile.position` |

---

## 七、修复建议

### 修复 1（核心）：`auth.ts` 从 `t_data_user_profile` 确定主角色

```typescript
// Before
let roles: string[] = ['teacher'];
// ... push additional roles ...
const primaryRole = roles[0] || 'teacher';

// After
let roles: string[] = [];
// 从 t_data_user_profile 读取 role_code
// 如果 profile 表有数据，优先使用；否则 fallback user.type
if (profileRows.length > 0) {
  roles = profileRows.map(r => r.role_code);
} else {
  if (user.type === 3) roles = ['finance'];
  else if (user.type === 5) roles = ['government'];
  else roles = ['teacher'];
}
const primaryRole = roles[0] || 'teacher';
```

### 修复 2：`buildUserResponse` 补全字段

```typescript
orgName: orgName || '华东科技大学',  // 从数据库或配置获取
departmentName: departmentName || '',
```

### 修复 3：`login/index.vue` 存 `staffPosition`

```javascript
staffPosition: userInfo.subRole || userInfo.staffPosition || '',
```

或修改 `getStaffProfile()` 读 `subRole`：
```javascript
const position = user.staffPosition || user.subRole || STAFF_POSITIONS.CASHIER
```

### 修复 4：`auth.ts` 从 `t_data_user_profile` 读取 `sub_role`

```typescript
// 当前只读 role_code，需增加 sub_role
SELECT role_code, sub_role FROM t_data_user_profile WHERE user_id = ?
```
