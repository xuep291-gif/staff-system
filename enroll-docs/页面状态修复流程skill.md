# 页面状态修复流程 Skill

## 适用场景

uni-app H5 Vue 3 项目中，使用 `StatusTabs` 标签栏 + 列表筛选的页面，在以下两种流程中出现状态异常：

| 流程 | 描述 | 症状 |
|------|------|------|
| Flow A | 首次进入页面 | 正常（基线） |
| Flow B | 从详情页 `navigateBack` 返回后 | tab 筛选失效，切换 tab 列表不更新；或某条记录卡在所有 tab 中 |

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
        @tap.stop="onSelect(tab.key)">
        <text class="status-tab-label">{{ tab.label }}</text>
        <text class="status-tab-count">{{ tab.count }}</text>
      </view>
    </view>
    <view class="status-tabs-underline" :style="underlineStyle" />
  </view>
</template>
```

```js
// 关键：activeKey 通过 computed 从共享 reactive 单例读取，不依赖 v-model
computed: {
  activeKey() {
    const fallback = this.modelValue || this.tabs[0]?.key || ''
    return getActiveKey(this.tabGroup, fallback)
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
    setActiveKey(this.tabGroup, key)  // 写入共享 reactive state
    this.$emit('change', key)          // 通知父组件
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

<!-- 2. StatusTabs 加 @change 事件绑定 -->
<StatusTabs tabGroup="yourPageKey" :tabs="tabs" @change="onTabClick" />

<!-- 3. v-for key 包含 filterVersion，切 tab / 返回时强制重建 -->
<view v-for="stu in filteredList" :key="filterVersion + '-' + stu.uid">
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
      list: [],
      // ...
    }
  },
  computed: {
    // ✨ filteredList 依赖 this.activeTab（本地 data），追踪可靠
    filteredList() {
      // 使用 this.activeTab（data 属性）做筛选
      const statuses = STATUS_MAP[this.activeTab] || STATUS_MAP.pending
      return this.list.filter(i => statuses.includes(i.status))
    }
  },
  watch: {
    // ✨ activeTab 变化时递增版本号，强制 v-for 重建
    activeTab() { this.filterVersion++ }
  },
  methods: {
    // ✨ onTabClick 三件事：更新本地 data、更新共享 state、递增版本号
    onTabClick(key) {
      this.activeTab = key              // 更新本地 data → computed 重算
      setActiveKey('yourPageKey', key)  // 同步共享 state（跨页面持久化）
    },
  },
  onShow() {
    // ✨ 恢复上次的 tab 状态
    this.activeTab = getActiveKey('yourPageKey', 'pending')
    this.filterVersion++  // 强制 v-for 重建
    // ✨ 清除残留的 staff_back_target（修复返回按钮无效）
    try { uni.removeStorageSync('staff_back_target') } catch (e) { /* optional */ }
    this.refresh()
  },
  // ❌ 删除 onHide handler（不要设 pageVisible = false）
}
```

---

## Phase 3: 批量修改检查清单

在任一使用 `StatusTabs` 的页面中，逐项检查并修改：

| # | 检查项 | 修改内容 |
|---|--------|---------|
| 1 | `activeTab` | computed → data 属性，默认值为第一个 tab 的 key |
| 2 | `filterVersion` | 在 data 中新增 `filterVersion: 0` |
| 3 | `watch: activeTab` | 新增 watch，`activeTab()` 内执行 `this.filterVersion++` |
| 4 | `filteredXxx` computed | 确保使用 `this.activeTab`（本地 data）做筛选 |
| 5 | `StatusTabs` 标签 | 添加 `@change="onTabClick"` |
| 6 | `onTabClick` 方法 | 新增或改造，做 `this.activeTab = key` + `setActiveKey(ns, key)` |
| 7 | `v-for` key | 改为 `:key="filterVersion + '-' + item.uid"` |
| 8 | `onShow` | 首行加入 `this.activeTab = getActiveKey(ns, 'default')` + `this.filterVersion++` |
| 9 | `onShow` | 加入 `uni.removeStorageSync('staff_back_target')` |
| 10 | `SNavBar` | 添加 `fallbackUrl="/pages/teacher/home/index"`（或对应角色的首页） |
| 11 | `onHide` | 删除（如果有 `pageVisible = false` 之类的逻辑） |

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
    filterVersion: 0,   // 切 tab / onShow 都递增，用于 v-for key
    contentKey: 0,      // 仅在 onShow 递增，用于包裹 SCard 的 key
  }
},
watch: {
  activeTab() { this.selectedIds = []; this.filterVersion++ }
  // 注意：不再额外操作 contentKey
},
onTabClick(key) {
  this.activeTab = key
  setActiveKey('feeHome', key)
  // 注意：不再手动 this.filterVersion++，watch 已处理
},
onShow() {
  this.activeTab = getActiveKey('feeHome', 'unpaid')
  this.filterVersion++  // v-for 列表重建
  this.contentKey++     // SCard 包装器重建（仅返回时）
  this.refresh()
}
```

**关键区别：**
- `filterVersion`：切 tab 时 watch 递增，驱动 v-for 列表项重建
- `contentKey`：仅 onShow 递增，驱动 SCard 包装 view 重建。切 tab 时不变 → SCard 不销毁

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
| 12 | SCard 的 `:key` | 确认没有绑定 `filterVersion`。如需 Flow B 重建，改用外层 `<view :key="contentKey">` 包裹 |
| 13 | scroll-view CSS | 添加 `overflow-y: scroll` 强制滚动条常驻 |
| 14 | `onTabClick` | 确认方法内只做 `this.activeTab = key` + `setActiveKey(ns, key)`，不手动递增 `filterVersion`（由 watch 统一处理） |

---

## 常见坑

1. **`uni.removeStorageSync` 可能抛异常**：必须包裹 `try/catch`，storage 在非浏览器环境不可用
2. **`filterVersion` 要放在 key 字符串前面**：`filterVersion + '-' + uid` 而非 `uid + '-' + filterVersion`，确保 Vue diff 识别为新 key
3. **不要保留 `onHide` 中的内容销毁逻辑**：会干扰 `navigateBack` 导航动画和页面栈
4. **`fallbackUrl` 仅当 `getCurrentPages().length === 1` 时生效**：配合 `onShow` 清除 `staff_back_target` 才能正常工作
5. **切 tab 时 SCard 不能用 `filterVersion` 做 key**：会导致每次切 tab 都销毁重建，引起页面偏移。改用独立的 `contentKey` 仅在 onShow 递增
6. **不同 tab 内容高度差异大时需强制滚动条**：`overflow-y: scroll` 防止滚动条出现/消失导致水平偏移

---

## 已修复页面列表

- `src/pages/teacher/fee-home/index.vue` — 缴费管理
- `src/pages/teacher/doc-home/index.vue` — 资料审核
- `src/pages/teacher/aid-home/index.vue` — 助学金审核
- `src/pages/teacher/loan-home/index.vue` — 助学贷款
- `src/pages/teacher/room-change/index.vue` — 换宿审核
- `src/pages/teacher/dorm-withdraw/index.vue` — 退宿审核
