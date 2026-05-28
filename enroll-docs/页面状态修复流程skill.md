# 页面状态修复流程 Skill

## 适用场景

uni-app H5 Vue 3 项目中，使用 `StatusTabs` 标签栏 + 列表筛选的页面，在以下两种流程中出现状态异常：

| 流程 | 描述 | 症状 |
|------|------|------|
| Flow A | 首次进入页面 | 正常（基线） |
| Flow B | 从详情页 `navigateBack` 返回后 | tab 筛选失效，切换 tab 列表不更新；或某条记录卡在所有 tab 中 |
| Flow C | 勾选列表项 checkbox | checkbox 视觉不更新，`selectedIds` 变了但 SCheckbox 不重渲染 |
| Flow D | 切换 tab 后列表不刷新 | tab 下标移动了但列表仍显示上一个 tab 的数据 |

---

## 根本原因

1. **StatusTabs 横线不跟随**：组件内部独立维护 `selectedIndex`，与父组件 `activeTab` 不同步
2. **`activeTab` 依赖外部 reactive 对象**：computed 属性读取 `reactive({})` 单例的属性，跨组件响应式追踪在 Flow B（页面 hide → show）后不可靠
3. **VNode 复用**：`v-for` 的 key 不变，Vue diff 算法复用了 frozen VNode，导致 DOM 不更新
4. **`staff_back_target` 残留**：`rememberStaffBackTarget` 把当前页路径存为返回目标，返回后 `resolveStaffBackTarget` 读到自身路径，`reLaunch` 到自己

---

## Phase 1: 修复 StatusTabs 横线动画

### 问题演进

#### 1.1 最初的 STabs 组件
- 内部 `selectedIndex` 状态与外层 `v-model` 形成双状态源
- 点击 tab 时内部立即更新，但外层 props 异步传入，导致横线抖动或不跟随

#### 1.2 新建 StatusTabs 组件
- 移除内部 `selectedIndex`，`activeIndex` 直接由 computed 从 props/slot 推导
- 使用 CSS Grid `grid-template-columns: repeat(N, 1fr)` 等分列
- 横线使用 `position: absolute; transform: translateX(activeIndex * 100%)` 驱动

#### 1.3 CSS v-bind 修复
- **Bug**: `v-bind('tabs.length')` 带引号被求值为字符串字面量而非属性值
- **Fix**: 改为 `:style` 内联绑定 computed `gridStyle` 对象

#### 1.4 最终方案：flex + tabState 单例

**StatusTabs.vue 最终架构**：

```html
<template>
  <view class="status-tabs-wrapper">
    <view class="status-tabs">
      <view v-for="tab in tabs" :key="tab.key"
        class="status-tab" :class="{ active: tab.key === activeKey }"
        @tap="onSelect(tab.key)">
        <text class="status-tab-label">{{ tab.label }}</text>
        <text class="status-tab-count">{{ tab.count }}</text>
      </view>
    </view>
    <view class="status-tabs-underline" :style="underlineStyle" />
  </view>
</template>
```

```js
// 关键：activeKey 优先使用父组件传入的 modelValue，fallback 到共享 reactive 单例
// 父组件传 :modelValue="activeTab" 时状态由父组件驱动，否则自动从全局 state 读取
computed: {
  activeKey() {
    if (this.modelValue) return this.modelValue       // 优先使用父组件传入的值
    const ns = this.tabGroup || 'default'
    const fallback = this.tabs[0]?.key || ''
    return getActiveKey(ns, fallback)                   // fallback：从共享 state 读取
  },
  activeIndex() {
    const idx = this.tabs.findIndex(t => t.key === this.activeKey)
    return idx >= 0 ? idx : 0
  },
  underlineStyle() {
    const pct = 100 / Math.max(this.tabs.length, 1)
    return {
      width: `${pct}%`,
      transform: `translateX(${this.activeIndex * 100}%)`
    }
  }
},
methods: {
  onSelect(key) {
    if (!this.tabs.some(t => t.key === key)) return
    const ns = this.tabGroup || 'default'
    setActiveKey(ns, key)                 // 写入共享 reactive state
    this.$emit('update:modelValue', key)  // 通知父组件（若使用 v-model）
    this.$emit('change', key)             // 通知父组件（@change 回调）
  }
}
```

```scss
.status-tabs {
  display: flex;  // flex 等分，不使用 grid
  width: 100%;
}
.status-tab {
  flex: 1;        // 每个 tab 等宽
  min-width: 0;
  // ...
}
.status-tabs-underline {
  position: absolute;
  bottom: 0; left: 0;
  height: 6rpx;
  background: var(--brand);
  border-radius: 3rpx;
  transition: transform .25s cubic-bezier(.4, 0, .2, 1);
}
```

**tabState.js — 共享响应式单例**：

```js
import { reactive } from 'vue'
const state = reactive({})

export function getActiveKey(namespace, defaultKey) {
  if (!(namespace in state)) state[namespace] = defaultKey
  return state[namespace]
}

export function setActiveKey(namespace, key) {
  state[namespace] = key
}
```

---

## Phase 2: 修复 Flow B tab 筛选失效

### 修复前（❌ 有问题的代码）

```js
// ❌ activeTab 是 computed，依赖外部 reactive 对象
computed: {
  activeTab() { return getActiveKey('feeHome', 'unpaid') },
  filteredStudents() {
    const statuses = PAYMENT_KEY_STATUS_MAP[this.activeTab] || ...
    return this.allStudents.filter(s => statuses.includes(s.payStatus))
  }
}

// ❌ StatusTabs 没有 @change 绑定，只靠 reactive state 间接联动
// ❌ onHide 设 pageVisible = false（v-if 销毁），干扰返回导航
// ❌ v-for key 不变，Vue diff 复用 frozen VNode
```

### 修复后（✅ 正确代码）

#### 模板层

```html
<!-- 1. SNavBar 加 fallbackUrl 兜底 -->
<SNavBar title="页面标题" :showBack="true" fallbackUrl="/pages/teacher/home/index" />

<!-- 2. StatusTabs 传 modelValue + @change，双向驱动 -->
<StatusTabs tabGroup="yourPageKey" :tabs="tabs" :modelValue="activeTab" @change="onTabClick" />

<!-- 3. v-for key 包含 activeTab + filterVersion + selectionVersion，切 tab / 返回 / 勾选时强制重建 -->
<view v-for="stu in filteredList" :key="activeTab + '-' + filterVersion + '-' + selectionVersion + '-' + stu.uid">

<!-- 4. SCard 用独立 contentKey 包裹，切 tab 时不销毁，仅 onShow 返回时重建 -->
<view :key="'scard-wrap-' + contentKey">
  <SCard :padding="0">
    ...
  </SCard>
</view>
```

#### 脚本层

```js
import { getActiveKey, setActiveKey } from '@/utils/tabState.js'

export default {
  data() {
    return {
      // ✨ 核心：activeTab 改为本地 data 属性
      activeTab: 'pending',       // 默认第一个 tab key
      filterVersion: 0,           // 版本号，切 tab 或 onShow 时递增
      contentKey: 0,              // SCard 包装器 key，仅 onShow 递增
      selectionVersion: 0,        // 勾选版本号，每次勾选变化递增（解决 mini-program checkbox 不刷新）
      list: [],
      selectedIds: [],
      // ...
    }
  },
  computed: {
    // ✨ filteredList 依赖 this.activeTab（本地 data），追踪可靠
    filteredList() {
      const statuses = STATUS_MAP[this.activeTab] || STATUS_MAP.pending
      return this.list.filter(i => statuses.includes(i.status))
    }
  },
  methods: {
    // ✨ onTabClick：更新本地 data + 共享 state + 递增版本号 + 清空勾选
    onTabClick(key) {
      if (this.activeTab === key) return       // 防止重复触发
      this.activeTab = key                     // 更新本地 data → computed 重算
      this.selectedIds = []                    // 清空勾选
      this.filterVersion++                     // 强制 v-for 列表重建
      this.contentKey++                        // 强制 SCard 包装器重建
      this.selectionVersion++                  // 强制 checkbox 重建
      setActiveKey('yourPageKey', key)         // 同步共享 state（跨页面持久化）
    },
    // ✨ onCheckXxx：勾选时递增 selectionVersion，触发 mini-program 原生层重渲染
    onCheckStudent(stu) {
      if (this.selectedIds.includes(stu.id)) {
        this.selectedIds = this.selectedIds.filter(id => id !== stu.id)
      } else {
        this.selectedIds = this.selectedIds.concat(stu.id)
      }
      this.selectionVersion++                  // 关键：驱动 checkbox 视觉更新
    },
  },
  onShow() {
    // ✨ 先 refresh 再读 activeTab（避免 syncActiveTabFromLastChange 双状态源不同步）
    this.filterVersion++
    this.contentKey++
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    this.refresh()
    this.activeTab = getActiveKey('yourPageKey', 'pending')
  },
  // ❌ 删除 onHide handler（不要设 pageVisible = false）
  // ❌ 删除 watch: { activeTab } — 逻辑内联到 onTabClick 中，更明确可控
}
```

---

## Phase 3: 批量修改检查清单

在任一使用 `StatusTabs` 的页面中，逐项检查并修改：

| # | 检查项 | 修改内容 |
|---|--------|---------|
| 1 | `activeTab` | computed → data 属性，默认值为第一个 tab 的 key |
| 2 | `filterVersion` | 在 data 中新增 `filterVersion: 0` |
| 3 | `selectionVersion` | 在 data 中新增 `selectionVersion: 0`（有 checkbox 勾选的页面必须加） |
| 4 | `filteredXxx` computed | 确保使用 `this.activeTab`（本地 data）做筛选 |
| 5 | `StatusTabs` 标签 | 添加 `:modelValue="activeTab"` + `@change="onTabClick"` |
| 6 | `onTabClick` 方法 | 内联处理：`activeTab = key` + `selectedIds = []` + `filterVersion++` + `contentKey++` + `selectionVersion++` + `setActiveKey(ns, key)`，并加 early return 防重复 |
| 7 | `v-for` key | 改为 `:key="activeTab + '-' + filterVersion + '-' + selectionVersion + '-' + item.uid"` |
| 8 | `onShow` | `refresh()` **之后**调用 `this.activeTab = getActiveKey(ns, 'default')`，避免 syncActiveTabFromLastChange 双状态源不同步 |
| 9 | `onShow` | 加入 `uni.removeStorageSync('staff_back_target')` |
| 10 | `SNavBar` | 添加 `fallbackUrl="/pages/teacher/home/index"`（或对应角色的首页） |
| 11 | `onHide` | 删除（如果有 `pageVisible = false` 之类的逻辑） |
| 12 | `watch: activeTab` | **删除** — 逻辑内联到 `onTabClick` 中，避免隐式副作用 |

### tabGroup 命名空间对照表

| 页面 | tabGroup | 默认 key |
|------|----------|---------|
| 缴费管理 (fee-home) | `feeHome` | `unpaid` |
| 资料审核 (doc-home) | `teacherDocHome` | `pending` |
| 助学金审核 (aid-home) | `teacherAidHome` | `pending` |
| 助学贷款 (loan-home) | `teacherLoanHome` | `pending` |
| 换宿审核 (room-change) | `teacherRoomChange` | `pending` |
| 退宿审核 (dorm-withdraw) | `teacherDormWithdraw` | `pending` |

---

## Phase 4: 修复切 tab 时页面布局横向偏移

### 问题表现

切换 tab 时，整个页面横向偏移约 17px（浏览器滚动条宽度）。通常发生在内容数量差异大的 tab 之间（如"未缴费"切到"绿色通道"）。

### 根本原因

两层问题叠加：

| 层级 | 原因 | 表现 |
|------|------|------|
| SCard `:key` 随 tab 变化 | SCard 每次切 tab 都销毁重建，内容瞬间为空 | 滚动条消失 → 偏移 |
| `overflow-y: auto`（默认） | 内容短时无滚动条，内容长时有滚动条 | 页面宽度变化 17px |

### 修复方案

#### 4.1 SCard 不随 tab 切换重建

**问题代码：**

```html
<!-- ❌ 每次切 tab 都销毁重建 SCard -->
<SCard :padding="0" :key="'scard-' + filterVersion">
```

**修复代码：**

```html
<!-- ✅ 用 contentKey 包裹，仅在 onShow 返回时重建 -->
<view :key="'scard-wrap-' + contentKey">
  <SCard :padding="0">
    ...
  </SCard>
</view>
```

```js
data() {
  return {
    filterVersion: 0,     // 切 tab / onShow 都递增，用于 v-for key
    contentKey: 0,        // 切 tab / onShow 都递增，用于包裹 SCard 的 key
    selectionVersion: 0,  // 勾选变化时递增，驱动 checkbox 原生层重渲染
  }
},
onTabClick(key) {
  if (this.activeTab === key) return
  this.activeTab = key
  this.selectedIds = []
  this.filterVersion++
  this.contentKey++       // 切 tab 时也递增，确保 SCard 内 slot 列表正确切换
  this.selectionVersion++
  setActiveKey('feeHome', key)
},
onShow() {
  this.filterVersion++
  this.contentKey++
  try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
  this.refresh()
  this.activeTab = getActiveKey('feeHome', 'unpaid')
  this.sending = false
}
```

**关键区别：**
- `filterVersion`：切 tab / onShow 时递增，驱动 v-for 列表项重建
- `contentKey`：切 tab / onShow 时都递增，驱动 SCard 包装 view 重建。解决切 tab 时 SCard slot 缓存导致列表不切换
- `selectionVersion`：勾选变化 / 切 tab 时递增，驱动 SCheckbox 组件在 uni-app 小程序端正确重渲染

#### 4.2 强制滚动条常驻

```scss
/* ✅ 强制始终显示垂直滚动条，消除内容高度变化导致的宽度跳变 */
.sbody { height: 0; flex: 1; padding-bottom: 40rpx; overflow-y: scroll; }
```

`overflow-y: scroll` 与 `overflow-y: auto` 的区别：
- `auto`：内容超出才显示滚动条（默认）→ 页面宽度不固定
- `scroll`：始终显示滚动条轨道 → 页面宽度恒定

### 检查清单（追加）

| # | 检查项 | 修改内容 |
|---|--------|---------|
| 13 | SCard 的 `:key` | 确认没有绑定 `filterVersion`。改用外层 `<view :key="contentKey">` 包裹，`contentKey` 在 `onTabClick` 和 `onShow` 中都递增 |
| 14 | scroll-view CSS | 添加 `overflow-y: scroll` 强制滚动条常驻 |
| 15 | `StatusTabs` 位置 | 移到 scroll-view **外部**，避免触摸事件冲突，`@tap` 不需 `.stop` |

---

## Phase 5: 修复首击 tab 数据不更新（syncActiveTabFromLastChange 导致的双状态源）

### 问题表现

进入页面后默认在某个 tab（如"审批中"），点击另一个 tab（如"待审批"）时，标签下划线移动了但列表数据没变，第二次点击才恢复正常。该问题仅出现在第一个 tab→第二个 tab 的切换，第三个 tab 不受影响。

### 根本原因

`onShow` 中 `refresh(true)` 内部调用 `syncActiveTabFromLastChange()`，它会通过 `setActiveKey` 修改共享 reactive state，**但不会同步更新 `this.activeTab`**。

```js
// ❌ 有问题的顺序
async onShow() {
  this.activeTab = getActiveKey('teacherLoanHome', 'pending')  // 读到旧值 'processing'
  this.filterVersion++
  this.refresh(true)  // syncActiveTabFromLastChange 可能 setActiveKey 为 'pending'
  // 此时：共享 state = 'pending'，但 this.activeTab 仍是 'processing'
}

// 用户点击"待审批" → onTabClick('pending')
// this.activeTab = 'pending' → 但原值已经是 'pending'（因为共享 state 被改了）
// Vue 视为未变化 → watch 不触发 → filteredList 不重算 → 数据不变
```

双状态源（`this.activeTab` 和共享 reactive state）不同步导致了"首击失效"。

### 修复方案

`this.activeTab = getActiveKey(...)` 移到 `refresh(true)` **之后**，确保读到最终的共享状态值：

```js
// ✅ 正确的顺序
async onShow() {
  this.filterVersion++
  try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
  this.refresh(true)  // syncActiveTabFromLastChange 先更新共享 state
  this.activeTab = getActiveKey('teacherLoanHome', 'pending')  // 再读取最终值
}
```

### 受影响页面

所有使用 `buildReviewTabs` / `filterReviewByTab` 的审核子页面：
- `loan-home` — 助学贷款
- `aid-home` — 助学金审核
- `doc-home` — 资料审核
- `dorm-withdraw` — 退宿审核
- `room-change` — 换宿审核

### 检查清单（追加）

| # | 检查项 | 修改内容 |
|---|--------|---------|
| 16 | `onShow` 中 `getActiveKey` 位置 | 必须在 `refresh(true)` **之后**调用，避免 `syncActiveTabFromLastChange` 覆盖造成的双状态源不同步 |

---

---

## Phase 6: 修复 uni-app 小程序端 checkbox 勾选不刷新

### 问题表现

在 uni-app 小程序/H5 混合模式下，点击 checkbox 勾选学生，`selectedIds` 数组已更新但 SCheckbox 组件的视觉状态（✓ 图标、背景色）不变化。切换 tab 后重新渲染才恢复正常。

### 根本原因

SCheckbox 组件通过 prop `modelValue` 控制选中态，父组件通过 `selectedIds.includes(stu.studentNo)` 传递。

Vue 2 响应式层面 `selectedIds` 替换引用（`filter`/`concat`）确实触发父组件 re-render，prop 值也更新了。但在 **uni-app 小程序运行时**，`v-for` 的 `:key` 不变时，原生层不会重新渲染子组件——即使 prop 已变化。

### 修复方案：selectionVersion 驱动强制重建

在 `data` 中新增 `selectionVersion` 计数器，每次勾选变化时 +1，纳入 `v-for` 的 `:key`：

```js
data() {
  return {
    selectedIds: [],
    selectionVersion: 0,  // 勾选版本号
    // ...
  }
},
methods: {
  onCheckStudent(stu) {
    if (this.selectedIds.includes(stu.id)) {
      this.selectedIds = this.selectedIds.filter(id => id !== stu.id)
    } else {
      this.selectedIds = this.selectedIds.concat(stu.id)
    }
    this.selectionVersion++  // 关键：递增版本号 → v-for key 变 → 原生层销毁重建 DOM
  },
  toggleSelectAll() {
    // ... 全选/取消全选逻辑
    this.selectionVersion++
  },
}
```

```html
<!-- v-for key 包含 selectionVersion -->
<view v-for="stu in filteredStudents" :key="activeTab + '-' + filterVersion + '-' + selectionVersion + '-' + stu.studentNo">
  <SCheckbox :modelValue="selectedIds.includes(stu.studentNo)" />
</view>
```

### selectionVersion 递增时机

| 操作 | 递增位置 | 目的 |
|------|---------|------|
| 勾选/取消单个 | `onCheckStudent` | 驱动该行 SCheckbox 重建 |
| 全选/取消全选 | `toggleSelectAll` | 驱动所有行 SCheckbox 重建 |
| 催缴发送 | `doSendUrge` | 清空勾选后驱动重建 |
| 切换 tab | `onTabClick` | 切换时清空勾选 + 重建列表 |

### 检查清单（追加）

| # | 检查项 | 修改内容 |
|---|--------|---------|
| 17 | `selectionVersion` | 在 data 中新增 `selectionVersion: 0` |
| 18 | `onCheckXxx` | 勾选/取消方法末尾加 `this.selectionVersion++` |
| 19 | `toggleSelectAll` | 末尾加 `this.selectionVersion++` |
| 20 | `doSendUrge` / `confirmXxx` | 清空 `selectedIds` 后加 `this.selectionVersion++` |
| 21 | `onTabClick` | 加 `this.selectionVersion++` |
| 22 | `v-for` key | 包含 `selectionVersion`：`activeTab + '-' + filterVersion + '-' + selectionVersion + '-' + item.id` |

---

## Phase 7: 催缴按钮按 tab 显隐 + 动态人数

### 问题表现

"一键催缴"和"确认发送"按钮在"已缴费"和"绿色通道"tab 下仍然可见，且按钮文案写死"全部待缴费"，未显示实际可催缴人数。

### 修复方案

```html
<!-- 按钮区域仅未缴费 / 部分未缴费可见 -->
<view class="btn-area" v-if="activeTab === 'unpaid' || activeTab === 'partial'">
  <SButton @click="confirmSendSelected">确认发送（{{ selectedIds.length }}人）</SButton>
  <SButton @click="confirmSendAll">一键催缴（{{ urgeCount }}人）</SButton>
</view>
```

```js
computed: {
  // 全部可催缴学生数（unpaid + overdue + partial）
  urgeCount() {
    return this.allStudents.filter(this.isUrgeEligible).length
  }
},
methods: {
  isUrgeEligible(stu) {
    return ['unpaid', 'overdue', 'partial'].includes(stu.payStatus)
  }
}
```

---

## 常见坑

1. **`uni.removeStorageSync` 可能抛异常**：必须包裹 `try/catch`，storage 在非浏览器环境不可用
2. **`filterVersion` 要放在 key 字符串前面**：确保 Vue diff 将变化后的 key 识别为新 key
3. **不要保留 `onHide` 中的内容销毁逻辑**：会干扰 `navigateBack` 导航动画和页面栈
4. **`fallbackUrl` 仅当 `getCurrentPages().length === 1` 时生效**：配合 `onShow` 清除 `staff_back_target` 才能正常工作
5. **切 tab 时 SCard 不能用 `filterVersion` 做 key**：会导致每次切 tab 都销毁重建，引起页面偏移。改用独立的 `contentKey`，且在 `onTabClick` 中也递增
6. **不同 tab 内容高度差异大时需强制滚动条**：`overflow-y: scroll` 防止滚动条出现/消失导致水平偏移
7. **不要用 `watch: activeTab`**：副作用隐式触发 `filterVersion++`，容易遗漏、难以调试。改为在 `onTabClick` 中显式内联所有版本号递增
8. **uni-app 小程序端 checkbox 必须用 `selectionVersion` 做 key**：原生层不会响应用 prop 更新来重绘子组件，必须通过改变 `:key` 销毁重建
9. **`StatusTabs` 放 scroll-view 外部**：避免触摸事件冲突，`@tap` 不需要 `.stop`。同时传 `:modelValue="activeTab"` 让父组件显式驱动
10. **`onShow` 中 `getActiveKey` 放 `refresh()` 之后**：避免 `syncActiveTabFromLastChange` 修改共享 state 后 `this.activeTab` 仍然过时

---

## 已修复页面列表

- `src/pages/teacher/fee-home/index.vue` — 缴费管理
- `src/pages/teacher/doc-home/index.vue` — 资料审核
- `src/pages/teacher/aid-home/index.vue` — 助学金审核
- `src/pages/teacher/loan-home/index.vue` — 助学贷款
- `src/pages/teacher/room-change/index.vue` — 换宿审核
- `src/pages/teacher/dorm-withdraw/index.vue` — 退宿审核
