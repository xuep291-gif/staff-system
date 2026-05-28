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

## 常见坑

1. **`uni.removeStorageSync` 可能抛异常**：必须包裹 `try/catch`，storage 在非浏览器环境不可用
2. **`filterVersion` 要放在 key 字符串前面**：`filterVersion + '-' + uid` 而非 `uid + '-' + filterVersion`，确保 Vue diff 识别为新 key
3. **不要保留 `onHide` 中的内容销毁逻辑**：会干扰 `navigateBack` 导航动画和页面栈
4. **`fallbackUrl` 仅当 `getCurrentPages().length === 1` 时生效**：配合 `onShow` 清除 `staff_back_target` 才能正常工作

---

## 已修复页面列表

- `src/pages/teacher/fee-home/index.vue` — 缴费管理
- `src/pages/teacher/doc-home/index.vue` — 资料审核
- `src/pages/teacher/aid-home/index.vue` — 助学金审核
- `src/pages/teacher/loan-home/index.vue` — 助学贷款
- `src/pages/teacher/room-change/index.vue` — 换宿审核
- `src/pages/teacher/dorm-withdraw/index.vue` — 退宿审核
