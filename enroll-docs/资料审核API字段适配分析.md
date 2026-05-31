# 资料审核 API 字段适配分析

> 生成时间：2026-05-31
> 状态：分析完成，待修复

---

## 一、涉及文件

| 层级 | 文件路径 | 用途 |
|------|---------|------|
| 列表页 | [src/pages/teacher/doc-home/index.vue](enroll-app/src/pages/teacher/doc-home/index.vue) | 资料审核列表（待审核/已通过/已退回 Tab） |
| 详情页 | [src/pages/teacher/doc-review/index.vue](enroll-app/src/pages/teacher/doc-review/index.vue) | 资料审核详情 + 审核操作 |
| 已完成页 | [src/pages/teacher/doc-done/index.vue](enroll-app/src/pages/teacher/doc-done/index.vue) | 审核完成（全是 Mock 硬编码，未接 API） |
| API 层 | [src/common/api/document.js](enroll-app/src/common/api/document.js) | API 定义 + normalizeReview/normalizeReviewList/normalizeReviewDetail |
| Mock 服务 | [src/mock/server.js](enroll-app/src/mock/server.js) | Mock API 实现（L92-113 种子数据，L969-973 路由） |
| 业务状态 | [src/utils/businessState.js](enroll-app/src/utils/businessState.js) | localStorage Mock 数据 + withStudent() 学生信息合并 |
| 请求层 | [src/common/request.js](enroll-app/src/common/request.js) | uni.request 封装 |
| Promise | [src/common/toPromise.js](enroll-app/src/common/toPromise.js) | 响应解析：`raw = res.data ? res.data : res` |

---

## 二、API 接口

| API | Method | 路径 | 用途 |
|-----|--------|------|------|
| getReviewList | GET | `/api/v1/documents/reviews` | 资料审核列表 |
| getReviewDetail | GET | `/api/v1/documents/reviews/:id` | 资料审核详情 |
| approveReview | POST | `/api/v1/documents/reviews/:id/approve` | 审核通过 |
| rejectReview | POST | `/api/v1/documents/reviews/:id/reject` | 审核退回 |

---

## 三、响应数据链路

```
后端 JSON → uni.request → toPromise 解包（取 res.data） → normalizeXxx → 页面 data
```

### 3.1 Mock 模式下的响应格式

Mock 直接返回 `ok(data)` → `{ code: 0, data: filterList 结果 }`，不再经过 uni.request 嵌套。

```
Mock 列表响应：
{
  code: 0,
  data: {
    list: [...],    // withStudentRows() 已合并学生信息
    items: [...],   // 同上（filterList 同时输出 list 和 items）
    total: 6,
    ...
  }
}
```

Mock 的 `withStudentRows()` 即将学生表字段（name, college, className, phone 等）**打平**到每个 document 记录上，所以 Mock 数据天然带有所有需要的字段。

### 3.2 真实 API 模式下的响应格式

经 `toPromise` 解包后（`raw = res.data`）：

```
真实 API 列表响应（toPromise 解包后）：
{
  code: 0,
  data: {
    list: [{ documentReviewId, studentId, studentNo, name, status, submittedAt, materialTags, ... }],
    total: 6
  }
}
```

**注意**：真实 API 的 `data` 中只有 `list`，**没有 `items`**。

---

## 四、Bug 根因分析

### Bug #1：【致命】列表页取 `res.data.items`，真实 API 不返回该字段

**位置**：[doc-home/index.vue:70](enroll-app/src/pages/teacher/doc-home/index.vue#L70)

```js
// 当前代码
this.list = (res.data.items || []).map(i => ({ ... }))
```

- Mock：`res.data.items` 存在（filterList 同时输出 `list` 和 `items`）→ 正常
- 真实 API：`res.data.items` 为 `undefined`，`[]`→ **list 永远为空**

**影响字段**：全部（姓名、学号、学院、材料标签、时间、状态等所有字段都因为列表为空而不显示）

### Bug #2：【致命】normalizeReviewList 被跳过，items 未经 normalize 处理

**位置**：[document.js:19-24](enroll-app/src/common/api/document.js#L19-L24)

```js
function normalizeReviewList(res) {
  const data = res?.data?.data       // ← 真实 API：res.data = { list, total }，res.data.data = undefined
  if (!data || data.list || !Array.isArray(data.items)) return res  // ← !data → true，直接返回
  data.list = data.items.map(normalizeReview)
  return res
}
```

- `res?.data?.data` → 真实 API 在 `toPromise` 解包后是 `{ code: 0, data: { list, ... } }`，`res.data.data` 不存在
- 即使修了 Bug #1，`normalizeReview` 也不会对 `data.list` 的每一项执行字段映射
- `materialTags` → `tags` 的字段名转换不会发生

### Bug #3：【严重】详情页字段映射缺失 college / className

**位置**：[doc-review/index.vue:169-188](enroll-app/src/pages/teacher/doc-review/index.vue#L169-L188)

```js
// 当前 item 映射 — 缺少 college 和 className
this.item = {
  uid: raw.documentReviewId || uid,
  name: raw.studentName || raw.name || '未知学生',
  id: raw.studentNo || raw.id || '',
  submittedAt: raw.submittedAt || '',
  time: raw.submittedAt || '',
  status: raw.status || MATERIAL_STATUS.PENDING,
  statusLabel: raw.statusLabel || '待审核',   // ← 真实 API 不返回 statusLabel
  badgeColor: raw.badgeColor || 'wa',          // ← 真实 API 不返回 badgeColor
  logs: raw.auditLogs || raw.logs || [],
  materials: raw.materials || [],
  // ❌ 缺少: college, className
}
```

**位置**：[doc-review/index.vue:10](enroll-app/src/pages/teacher/doc-review/index.vue#L10)

```html
<!-- 模板中学院和班级被硬编码 -->
<text class="meta">{{ item.id }} · 计算机学院 2026级1班 · 提交于 {{ item.submittedAt || item.time }}</text>
```

- `college` / `className` 在模板中**硬编码**为 "计算机学院 2026级1班"
- 即使 API 返回了这两个字段，也不会显示真实值

### Bug #4：【中等】详情页材料预览使用静态假数据

**位置**：[doc-review/index.vue:148-153](enroll-app/src/pages/teacher/doc-review/index.vue#L148-L153)

```js
// data() 中的 materials — 完全静态，不来自 API
materials: [
  { label: '身份证', checked: true },
  { label: '录取通知书', checked: true },
  { label: '户口本', checked: true },
  { label: '证件照', checked: true }
]
```

而 API 返回的材料数据 `raw.materials`（已正确存入 `this.item.materials`）完全没有被使用。材料预览弹窗展示的是硬编码数据。

### Bug #5：【中等】normalizeReviewDetail 同样被跳过

**位置**：[document.js:26-38](enroll-app/src/common/api/document.js#L26-L38)

```js
function normalizeReviewDetail(res) {
  const data = res?.data?.data       // ← 真实 API：res.data 直接就是单个对象，无嵌套 data
  if (!data || data.name) return res  // ← !data → true，直接返回
  const student = data.student || {}
  res.data.data = normalizeReview({
    ...data,
    studentName: student.name,
    studentNo: student.studentNo,
    className: student.className,
    college: student.college
  })
  return res
}
```

即使真实 API 返回嵌套结构（如 `{ student: { name, college, ... } }`），这个 flatten 逻辑也不会执行，因为 `res?.data?.data` 不存在。

---

## 五、字段映射表

### 5.1 列表页字段（doc-home）

| 模板使用 | Mock 字段来源 | 真实 API 字段（预期） | 是否丢失 | 原因 |
|---------|-------------|---------------------|---------|------|
| `item.name` | `withStudentRows` 合并 → 扁平 `name` | `list[].name` 或 `list[].student.name` | ✅ 丢失 | Bug #1：列表为空 |
| `item.id` | `normalizeReview` → `item.id \|\| item.studentNo` | `list[].studentNo` 或 `list[].id` | ✅ 丢失 | Bug #1 |
| `item.college` | `withStudentRows` 合并 → 扁平 `college` | `list[].college` 或 `list[].student.college` | ✅ 丢失 | Bug #1 |
| `item.submittedAt` | Mock 种子数据直接提供 | `list[].submittedAt` | ✅ 丢失 | Bug #1 |
| `item.tags` | `normalizeReview` → `item.tags \|\| item.materialTags` | `list[].materialTags` | ✅ 丢失 | Bug #1 + Bug #2（字段名转换未执行） |
| `item.avatar` | `withStudentRows` 计算 → `name.charAt(0)` | 无（需前端计算） | ✅ 丢失 | Bug #1 |
| `item.badgeColor` | 页面 refresh() 中按 status 计算 | 无（需前端计算） | ✅ 丢失 | Bug #1 |
| `item.status` | Mock 种子数据直接提供 | `list[].status` | ✅ 丢失 | Bug #1 |

### 5.2 详情页字段（doc-review）

| 模板使用 | 当前代码取值 | 真实 API 字段（预期） | 是否丢失 | 原因 |
|---------|------------|---------------------|---------|------|
| `item.name` | `raw.studentName \|\| raw.name` | `data.name` 或 `data.studentName` 或 `data.student.name` | ⚠️ 取决于 API 结构 | 若 API 返回嵌套 student 则丢失 |
| `item.id` | `raw.studentNo \|\| raw.id` | `data.studentNo` 或 `data.id` 或 `data.student.studentNo` | ⚠️ 同上 | 同上 |
| `item.college` | **硬编码** "计算机学院" | `data.college` 或 `data.student.college` | ✅ 丢失 | Bug #3：硬编码 |
| `item.className` | **硬编码** "2026级1班" | `data.className` 或 `data.student.className` | ✅ 丢失 | Bug #3：硬编码 |
| `item.submittedAt` | `raw.submittedAt` | `data.submittedAt` | ⚠️ 部分可用 | 若 API 有该字段则正常 |
| `item.status` | `raw.status \|\| MATERIAL_STATUS.PENDING` | `data.status` | ⚠️ 部分可用 | 若 API 有该字段则正常 |
| `item.statusLabel` | `raw.statusLabel \|\| '待审核'` | **API 不返回此字段** | ⚠️ 降级到默认值 | 真实 API 不包含前端 UI 标签，需前端根据 status 计算 |
| `item.badgeColor` | `raw.badgeColor \|\| 'wa'` | **API 不返回此字段** | ⚠️ 降级到默认值 | 同上，需前端根据 status 计算 |
| `item.logs` | `raw.auditLogs \|\| raw.logs` | `data.auditLogs` | ⚠️ 部分可用 | 取决于 API 字段名 |
| `item.materials` | `raw.materials` | `data.materials` | ⚠️ 部分可用 | 但材料预览用的是 `this.materials`（硬编码），而不是 `this.item.materials` |
| 材料预览 | `this.materials`（data 中硬编码） | `data.materials` 或 `/api/v1/materials/:bizType/:bizId` | ✅ 丢失 | Bug #4：静态假数据 |

---

## 六、normalizeXxx 系列函数的问题总结

三个 normalize 函数都试图通过 `res?.data?.data` 取到「业务数据层」，但：

| 函数 | 预期数据位置 | 真实 API 解包后数据位置 | 结果 |
|------|-----------|---------------------|------|
| `normalizeReviewList` | `res.data.data` | `res.data`（toPromise 已解包到这一层） | **永远被跳过** |
| `normalizeReviewDetail` | `res.data.data` | `res.data`（同上） | **永远被跳过** |

这两个函数的 `res?.data?.data` 设计，似乎是针对以下嵌套场景：

```
uni.request → { data: { code: 0, data: { data: { list: ... } } } }
                                        ↑ 业务数据在 res.data.data.data
```

但实际 `toPromise` 已经做了 `raw = res.data` 解包：

```
uni.request → { data: { code: 0, data: { list: ... } } }
              → toPromise: raw = res.data → { code: 0, data: { list: ... } }
                                          ↑ 业务数据在 res.data
```

**结论**：`normalizeReviewList` 和 `normalizeReviewDetail` 中的 `res?.data?.data` 均应改为 `res?.data`，且需要真正的字段映射逻辑。

---

## 七、doc-done 页面问题

[doc-done/index.vue](enroll-app/src/pages/teacher/doc-done/index.vue) 全页使用硬编码 Mock 数据：

```js
data() {
  return {
    reviewResult: {
      studentName: '王明辉',
      studentId: '2026010001',
      result: '初核通过',
      reviewer: '刘晓华（班主任）',
      reviewTime: '2026-05-16 10:23'
    }
  }
}
```

该页面没有接入任何 API，属于 `初始完成状态` 占位页面，需另行规划。

---

## 八、修复建议优先级

| 优先级 | 问题 | 影响 |
|--------|------|------|
| **P0** | Bug #1：列表页 `res.data.items` → 应改为从正确路径取值 | 列表页完全空白 |
| **P0** | Bug #2：normalizeReviewList 字段映射不生效 | materialTags → tags 等字段名转换 |
| **P1** | Bug #3：详情页 college/className 硬编码 | 所有学生显示同一个学院班级 |
| **P1** | Bug #5：normalizeReviewDetail 不生效 | 若 API 返回嵌套 student 结构则字段全部丢失 |
| **P2** | Bug #4：材料预览用静态数据 | 材料预览与实际不符 |
| **P2** | doc-done 全硬编码 | 该页面不可用 |
| **P3** | statusLabel / badgeColor 依赖 API 返回 | 需要前端按 status 值自行计算 |
