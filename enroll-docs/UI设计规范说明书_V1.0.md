# 高校收费管理系统 UI 设计规范说明书

**版本：** V1.0  
**日期：** 2026-05-30  
**状态：** 定稿  
**依据：** 项目现有设计令牌体系（v3.1）、32 个共享组件、页面布局实践

---

## 一、概述

### 1.1 适用范围

本规范适用于高校收费管理系统的全部四个终端（学生端、教师端、财务/职工端、后台管理端），涵盖颜色、字体、间距、圆角、阴影、组件库及页面布局的标准定义。

### 1.2 设计原则

| 原则 | 说明 |
|------|------|
| **令牌驱动** | 所有视觉属性通过 CSS 自定义属性（Design Tokens）统一管理，禁止硬编码颜色/字号 |
| **角色感知** | 三套角色主题色（教师蓝 / 财务绿 / 行政紫），通过 body class 一键切换 |
| **组件化** | 32 个共享组件覆盖全部 UI 模式，新页面通过组合现有组件构建 |
| **8px 网格** | 间距体系基于 8rpx 网格，确保视觉节奏一致 |
| **移动优先** | 以小程序/H5 为主要设计载体，PC 端复用相同令牌体系 |

### 1.3 文件架构

```
enroll-app/src/
├── uni.scss                          # uni-app 入口，引入令牌
├── App.vue                           # 根组件，角色主题应用
├── styles/
│   ├── tokens/
│   │   ├── index.scss                # 令牌总入口
│   │   ├── _variables.scss           # 统一摘要（CSS变量 + SCSS变量）
│   │   ├── _colors.scss              # 颜色令牌
│   │   ├── _typography.scss          # 排版令牌
│   │   ├── _spacing.scss             # 间距令牌
│   │   ├── _radius.scss              # 圆角令牌
│   │   ├── _shadows.scss             # 阴影令牌
│   │   └── _components.scss          # 组件级令牌
│   └── globalStyle/
│       ├── globalStyle.scss          # 全局样式类
│       └── global-background.scss    # 背景样式
└── components/
    └── shared/                       # 32 个共享组件
        └── index.js                  # 统一导出
```

---

## 二、设计令牌（Design Tokens）

### 2.1 颜色系统

#### 2.1.1 角色主题色

三套主题色通过 CSS 变量实现角色切换。`body` 默认使用教师主题，添加 `.rf` 类切换财务主题，`.ra` 类切换行政主题。

| 令牌 | 教师（默认） | 财务（.rf） | 行政（.ra） | 用途 |
|------|-------------|------------|------------|------|
| `--tc` / `--fc` / `--ac` | `#2B6CB0` | `#15803D` | `#7C3AED` | 角色主色 |
| `--tc-t` / `--fc-t` / `--ac-t` | `#DBEAFE` | `#DCFCE7` | `#EDE9FE` | 角色浅底色 |
| `--tc-d` / `--fc-d` / `--ac-d` | `#1E4D8C` | `#166534` | `#6D28D9` | 角色深色（按压态） |
| `--brand` | `var(--tc)` | `var(--fc)` | `var(--ac)` | **品牌色（动态）** |
| `--brand-t` | `var(--tc-t)` | `var(--fc-t)` | `var(--ac-t)` | 品牌浅底色 |
| `--brand-d` | `var(--tc-d)` | `var(--fc-d)` | `var(--ac-d)` | 品牌深色 |
| `--brand-s` | `#EFF6FF` | `#F0FDF4` | `#F5F3FF` | 品牌柔和背景 |

#### 2.1.2 语义色

用于状态标识，覆盖成功、警告、错误、信息、特殊等场景。

| 令牌 | 色值 | 浅底色 | 边框色 | 用途 |
|------|------|--------|--------|------|
| `--ok` | `#16A34A` | `--ok-bg: #F0FDF4` | `--ok-bd: #86EFAC` | 成功 / 已通过 / 已报到 |
| `--wa` | `#D97706` | `--wa-bg: #FEF3C7` | `--wa-bd: #FCD34D` | 警告 / 待处理 / 未报到 |
| `--er` | `#DC2626` | `--er-bg: #FEF2F2` | `--er-bd: #FCA5A5` | 错误 / 逾期 / 已驳回 / 已延期 |
| `--in` | `#4B5563` | `--in-bg: #F9FAFB` | `--in-bd: #7DD3FC` | 信息 / 审批中 / 延期按钮 |
| `--pu` | `#7C3AED` | `--pu-bg: #EDE9FE` | `--pu-bd: #C4B5FD` | 特殊 / 绿色通道 / 绿通 |

**语义色使用规范：**

| 状态场景 | 推荐颜色 | Badge/标签示例 |
|----------|----------|---------------|
| 已通过、已完成、已报到、已缴 | `ok` | `<SBadge color="ok">已通过</SBadge>` |
| 待审核、待处理、未报到、未缴 | `wa` | `<SBadge color="wa">待审核</SBadge>` |
| 已驳回、逾期、已延期、欠费 | `er` | `<SBadge color="er">已驳回</SBadge>` |
| 审批中、部分未缴 | `in` | `<SBadge color="in">审批中</SBadge>` |
| 绿色通道、特殊标记 | `pu` | `<SBadge color="pu">绿色通道</SBadge>` |

#### 2.1.3 中性灰阶

| 令牌 | 色值 | 用途 |
|------|------|------|
| `--N900` | `#111827` | 主要文字、标题 |
| `--N800` | `#1F2937` | 次要标题 |
| `--N700` | `#374151` | 正文、列表项文字 |
| `--N600` | `#4B5563` | 辅助文字 |
| `--N500` | `#6B7280` | 次要辅助文字、label |
| `--N400` | `#9CA3AF` | 占位文字、表头、禁用态 |
| `--N300` | `#D1D5DB` | 禁用边框 |
| `--N200` | `#E5E7EB` | 分割线、边框 |
| `--N150` | `#F0F2F5` | 浅色背景 |
| `--N100` | `#F3F4F6` | 卡片内背景 |
| `--N50` | `#F9FAFB` | **页面底色** |
| `--N25` | `#FAFBFC` | 极浅背景 |
| `--white` / `--wh` | `#FFFFFF` | 卡片、导航栏、按钮文字 |

#### 2.1.4 颜色使用规则

1. **页面背景**统一使用 `var(--N50)`
2. **卡片背景**统一使用 `var(--white)`
3. **主要文字**使用 `var(--N900)`，次要文字 `var(--N500)`
4. **禁止**在组件中硬编码色值，必须使用令牌变量
5. 角色主题色通过 `--brand` 引用，**不要**直接使用 `--tc`/`--fc`/`--ac`

---

### 2.2 排版系统

#### 2.2.1 字体族

```css
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
```

#### 2.2.2 字号体系（rpx）

| 令牌 | rpx 值 | 近似 px（375 屏宽） | 用途 |
|------|--------|---------------------|------|
| `--fs-9` | 18rpx | 9px | 极小辅助文字 |
| `--fs-10` | 20rpx | 10px | TabBar 文字、角标小字 |
| `--fs-11` | 22rpx | 11px | Badge、进度条标签、表头、辅助信息 |
| `--fs-12` | 24rpx | 12px | 正文辅助、列表描述、placeholder |
| `--fs-13` | 26rpx | 13px | 正文、列表标题、Tab 文字、label |
| `--fs-14` | 28rpx | 14px | **常规正文**、按钮文字、信息行值 |
| `--fs-15` | 30rpx | 15px | 卡片标题、列表主要标题、学生姓名 |
| `--fs-16` | 32rpx | 16px | 次级大标题 |
| `--fs-18` | 36rpx | 18px | 页面大标题、金额数字 |
| `--fs-20` | 40rpx | 20px | 导航栏标题、TabBar 图标 |
| `--fs-22` | 44rpx | 22px | 统计数据大数字、头像文字 |
| `--fs-24` | 48rpx | 24px | 突出展示数字 |
| `--fs-28` | 56rpx | 28px | 仪表盘主数字 |
| `--fs-36` | 72rpx | 36px | 特大金额展示 |

#### 2.2.3 字重

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--fw-400` | 400 | 正文、描述文字 |
| `--fw-500` | 500 | 列表项文字、label |
| `--fw-600` | 600 | 标题、导航栏、Badge |
| `--fw-700` | 700 | 金额数字、重点数据、TabBar 活动态 |

#### 2.2.4 行高

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--lh-1` | 1.0 | 按钮、Badge |
| `--lh-1-2` | 1.2 | 数字展示 |
| `--lh-1-4` | 1.4 | 列表 |
| `--lh-1-5` | 1.5 | 信息行、正文 |
| `--lh-1-6` | 1.6 | 长文本、地址 |

---

### 2.3 间距系统（基于 8rpx 网格）

| 令牌 | rpx 值 | 近似 px | 用途 |
|------|--------|---------|------|
| `--sp-4` | 8rpx | 4px | 极小间距、图标与文字间距 |
| `--sp-8` | 16rpx | 8px | 组件内小间距 |
| `--sp-10` | 20rpx | 10px | 列表项之间 |
| `--sp-12` | 24rpx | 12px | 常规内间距 |
| `--sp-14` | 28rpx | 14px | 卡片外边距 |
| `--sp-16` | 32rpx | 16px | 卡片内边距、组件间距 |
| `--sp-20` | 40rpx | 20px | 区域间距 |
| `--sp-24` | 48rpx | 24px | 大区域间距 |

**间距使用规范：**
- 页面内容区 padding：`28rpx`（约 `--sp-14`）
- 卡片之间 margin-top：`20rpx`（约 `--sp-10`）
- 列表项 padding：`20rpx 0`
- SCard 默认内边距：`16px`（`--sp-8` 两倍）

---

### 2.4 圆角系统

| 令牌 | rpx 值 | 用途 |
|------|--------|------|
| `--r-3` | 6rpx | 进度条 |
| `--r-8` | 16rpx | 按钮、输入框、搜索框、小图标框 |
| `--r-10` | 20rpx | 次小圆角 |
| `--r-12` | 24rpx | 输入框（强调）、支付方式卡片 |
| `--r-14` | 28rpx | **卡片**、统计卡片 |
| `--r-20` | 40rpx | Badge、Pill 按钮、圆角标签 |
| `--r-full` | 50% | 头像、圆形按钮、通知圆点 |

---

### 2.5 阴影系统

| 令牌 | 值 | 用途 |
|------|-----|------|
| `--card-shadow-low` | `0 1px 3px rgba(0,0,0,.06)` | 普通卡片、列表 |
| `--card-shadow-high` | `0 4px 16px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)` | 浮动卡片、弹窗 |
| `--tabbar-shadow` | `0 -2px 8px rgba(0,0,0,.06)` | 底部导航栏 |
| `--toast-bg` | `rgba(0,0,0,.78)` | Toast 背景 |

---

## 三、共享组件库

> 所有共享组件位于 `@/components/shared/`，通过 `index.js` 统一导出。

### 3.1 导航与布局

#### 3.1.1 SNavBar — 导航栏

**用途：** 页面顶部导航栏，支持返回按钮、标题、右侧操作。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | String | `''` | 居中标题文字 |
| `showBack` | Boolean | `true` | 是否显示返回按钮 |
| `backIcon` | String | `'←'` | 返回按钮文字 |
| `placeholder` | Boolean | `true` | 是否渲染占位元素（fixed 定位时需要） |
| `variant` | String | `'white'` | `'white'` / `'brand'` |
| `fallbackUrl` | String | `''` | 无页面栈时的回退 URL |

**Slots：** `title`（自定义标题）、`right`（右侧操作区）

**样式规格：**
- 高度：`104rpx`（`--navbar-h`）
- 内边距：`0 32rpx`（`--navbar-padding`）
- 白色变体：背景 `#FFF`，底部边框 `1px solid var(--N200)`
- 品牌色变体：背景 `var(--brand)`，白色文字
- 标题字号：`var(--fs-16)`，字重 600
- z-index：100，position：fixed

**使用示例：**
```html
<!-- 白色导航栏（默认） -->
<SNavBar title="学生详情" :showBack="true" />
<!-- 品牌色导航栏 -->
<SNavBar title="缴费管理" variant="brand" />
<!-- 带右侧操作 -->
<SNavBar title="设置">
  <template #right><text>保存</text></template>
</SNavBar>
```

---

#### 3.1.2 SBanner — 横幅

**用途：** 页面顶部个人信息横幅，展示头像、姓名、副标题，支持操作插槽。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `avatar` | String | `''` | 头像文字（取姓名首字） |
| `name` | String | `''` | 用户名称 |
| `sub` | String | `''` | 副标题（角色/班级等） |

**Slots：** `avatar`、`info`、`actions`

**样式规格：**
- 背景：`var(--brand)`
- 内边距：`32rpx 36rpx 88rpx`（底部大间距给 FloatCard 留空间）
- 头像：`96rpx` 圆形，半透明白色背景，`4rpx` 白色边框
- 名称字号：`var(--fs-20)`，白色，字重 700
- 副标题：白色 70% 透明度
- 操作按钮：`72rpx` 圆形，半透明白色背景

**使用示例：**
```html
<SBanner avatar="刘" name="刘晓华" sub="计算机学院 · 2026级1班 班主任">
  <template #actions>
    <view class="banner-bell" @click="goMessages">
      <text>🔔</text>
      <view class="bell-dot" v-if="unreadCount > 0" />
    </view>
  </template>
</SBanner>
```

---

#### 3.1.3 STabBar — 底部导航栏

**用途：** 页面底部固定导航栏。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | Array | `[]` | `{ text, icon, badge }` 对象数组 |
| `modelValue` | Number | `0` | 当前活动索引 |

**样式规格：**
- 高度：`120rpx`（`--tabbar-h`）
- 背景：白色
- 顶部边框：`1px solid var(--N200)`
- 阴影：`var(--tabbar-shadow)`
- 图标字号：`var(--fs-20)`
- 文字字号：`var(--fs-10)`，颜色 `var(--N400)`
- 活动态文字颜色：`var(--brand)`
- 角标：绝对定位，`var(--er)` 背景，白色文字，`var(--r-20)` 圆角

---

### 3.2 卡片与容器

#### 3.2.1 SFloatCard — 浮动卡片

**用途：** 悬在 Banner 下方、带有大阴影的统计卡片。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `offset` | Number | `-28` | 上偏移（px），实现与 Banner 重叠效果 |

**样式规格：**
- 背景：`var(--white)`
- 圆角：`var(--r-14)`
- 水平边距：`28rpx`
- 内边距：`32rpx`
- 阴影：`var(--card-shadow-high)`
- z-index：2，position：relative

---

#### 3.2.2 SCard — 卡片

**用途：** 最常用的内容容器。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | String | `''` | 卡片标题 |
| `actionText` | String | `''` | 右侧操作文字 |
| `padding` | Number | `16` | 内容区内边距（px） |
| `variant` | String | `''` | 变体：`'urgent'` / `'ok-c'` / `'info-c'` |

**Slots：** `header`、`action`、default

**样式规格：**
- 背景：`var(--white)`
- 圆角：`var(--r-14)`
- 边距：`28rpx`（上下各 14rpx）
- 阴影：`var(--card-shadow-low)`
- 标题：`var(--fs-15)`，字重 600，`var(--N900)`
- 操作文字：`var(--fs-12)`，`var(--brand)`，字重 500

**变体：**
- `.scard-urgent`：红色边框阴影（`--er-bd`）
- `.scard-ok-c`：绿色边框（`--ok-bd`）
- `.scard-info-c`：蓝色边框（`--brand`）

---

### 3.3 信息展示

#### 3.3.1 SInfoRow — 信息行

**用途：** 标签-值配对的信息展示行。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | String | `''` | 左侧标签文字 |

**Slot：** default（右侧值内容，可嵌入任意组件）

**样式规格：**
- flex 行布局，`align-items: flex-start`
- 内边距：`20rpx 0`
- Label：最小宽度 `160rpx`，`var(--N500)`，flex-shrink: 0
- Value：flex 1，`var(--N900)`，字重 500

**使用示例：**
```html
<SInfoRow label="学号">2026010001</SInfoRow>
<SInfoRow label="缴费状态">
  <SBadge color="wa">待审核</SBadge>
</SInfoRow>
```

---

#### 3.3.2 SListItem — 列表项

**用途：** 带头像和可选箭头的列表项。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `avatar` | String | `''` | 头像文字 |
| `avatarBg` | String | `'var(--brand-t)'` | 头像背景色 |
| `showArrow` | Boolean | `false` | 是否显示右箭头 |

**样式规格：**
- 内边距：`24rpx 0`
- 底边框：`1px solid var(--N50)`
- 头像：`80rpx` 圆形，`var(--brand-t)` 背景

---

#### 3.3.3 SAmount — 金额展示

**用途：** 金额数字格式化展示。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | Number | `0` | 金额数值 |
| `symbol` | String | `'¥'` | 货币符号 |
| `suffix` | String | `''` | 后缀文字 |
| `size` | String | `'md'` | `'sm'` / `'md'` / `'lg'` / `'xl'` |
| `color` | String | `''` | 自定义颜色 |

**尺寸规格：**
- sm：`var(--fs-14)`
- md：`var(--fs-18)`
- lg：`var(--fs-24)`
- xl：`var(--fs-32)`

---

### 3.4 状态标识

#### 3.4.1 SBadge — 徽章

**用途：** 状态标签、数量标记。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | String | `'brand'` | `'brand'` / `'ok'` / `'wa'` / `'er'` / `'in'` / `'pu'` / `'gy'` |
| `variant` | String | `'fill'` | `'fill'`（实心）/ `'outline'`（轮廓） |

**样式规格：**
- inline-flex
- 最小高度：`40rpx`
- 内边距：`4rpx 16rpx`
- 圆角：`var(--r-20)`
- 字号：`var(--fs-11)`
- 实心变体：浅色背景 + 深色文字
- 轮廓变体：透明背景 + `1px solid` 边框

**各颜色效果：**

| color | 背景色 | 文字色 |
|-------|--------|--------|
| `brand` | `var(--brand-t)` | `var(--brand-d)` |
| `ok` | `var(--ok-bg)` | `var(--ok)` |
| `wa` | `var(--wa-bg)` | `var(--wa)` |
| `er` | `var(--er-bg)` | `var(--er)` |
| `in` | `var(--in-bg)` | `var(--in)` |
| `pu` | `var(--pu-bg)` | `var(--pu)` |
| `gy` | `var(--N100)` | `var(--N600)` |

---

#### 3.4.2 SStatusTag — 状态标签

**用途：** 小型状态标签，比 SBadge 更紧凑。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `color` | String | `'in'` | 同 SBadge 颜色枚举 |

**样式规格：**
- 字号：`var(--fs-11)`，字重 600
- 内边距：`4rpx 16rpx`
- 圆角：`var(--r-20)`

---

#### 3.4.3 SProgressBar — 进度条

**用途：** 展示百分比进度。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `percent` | Number | `0` | 进度百分比（0-100） |
| `color` | String | `'brand'` | `'brand'` / `'ok'` / `'wa'` / `'er'` |
| `headLabel` | String | `''` | 头部左侧标签 |
| `headPercent` | Boolean | `false` | 头部右侧是否显示百分比 |

**样式规格：**
- 轨道：高度 `12rpx`，背景 `var(--N200)`，圆角 `6rpx`
- 填充：过渡 0.6s，语义色填充
- 头部：flex space-between，字号 `var(--fs-11)`，`var(--N500)`

---

#### 3.4.4 SEmpty — 空状态

**用途：** 无数据时的占位展示。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | String | `'📋'` | 图标（emoji 或文字） |
| `text` | String | `'暂无数据'` | 提示文字 |

**样式规格：**
- flex 列，居中
- 内边距：`96rpx 48rpx`
- 图标：`96rpx`，透明度 0.4
- 文字：`var(--fs-14)`，`var(--N400)`

---

#### 3.4.5 SAlertBar — 警示条

**用途：** 页面级提示信息。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | String | `'info'` | `'info'` / `'success'` / `'warning'` / `'error'` |
| `message` | String | `''` | 提示文字 |
| `closable` | Boolean | `false` | 是否可关闭 |

**样式规格：**
- 内边距：`24rpx 32rpx`
- 圆角：`var(--r-8)`
- 字号：`var(--fs-12)`，行高 1.5

---

### 3.5 操作组件

#### 3.5.1 SButton — 按钮

**用途：** 统一按钮组件。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | String | `'primary'` | `'primary'` / `'secondary'` / `'ghost'` / `'danger'` / `'warning'` / `'pill'` |
| `size` | String | `'md'` | `'sm'` / `'md'` / `'lg'` |
| `block` | Boolean | `false` | 是否块级（100% 宽度） |
| `disabled` | Boolean | `false` | 禁用态 |
| `loading` | Boolean | `false` | 加载态 |

**尺寸规格：**

| size | padding | 最小高度 | 用途 |
|------|---------|----------|------|
| `sm` | `12rpx 28rpx` | `56rpx` | 小按钮、操作项 |
| `md` | `20rpx 40rpx` | `88rpx` | 常规按钮 |
| `lg` | `28rpx 48rpx` | `104rpx` | CTA 按钮 |

**变体：**

| variant | 背景 | 文字色 | 说明 |
|---------|------|--------|------|
| `primary` | `var(--brand)` | `#FFF` | 主要操作 |
| `secondary` | `var(--N50)` | `var(--N900)` | 次要操作 |
| `ghost` | 透明 | `var(--brand)` | 幽灵按钮（1px 边框） |
| `danger` | `var(--er)` | `#FFF` | 危险操作 |
| `warning` | `var(--wa-bg)` | `#92400E` | 警告操作 |
| `pill` | `var(--brand)` | `#FFF` | 胶囊按钮（大圆角 `var(--r-20)`） |

---

#### 3.5.2 SPayButton — 支付按钮

**用途：** 固定底部的缴费 CTA 按钮。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | String | `'去缴费'` | 按钮文字 |
| `amount` | Number | `0` | 金额展示 |
| `disabled` | Boolean | `false` | 禁用态 |
| `loading` | Boolean | `false` | 加载态 |

**样式规格：**
- 全宽，最小高度 `88rpx`
- 圆角 `var(--r-8)`
- 品牌色背景，白色文字，字重 700
- 禁用态：opacity 0.5

---

#### 3.5.3 SCheckbox — 复选框

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | Boolean | `false` | 选中状态 |
| `disabled` | Boolean | `false` | 禁用态 |

**样式规格：**
- `32rpx` 方形
- 圆角 `8rpx`
- 未选中：`2rpx solid var(--N200)`
- 选中：`var(--brand)` 背景，白色对勾
- 禁用：`var(--N50)` 背景

---

### 3.6 选择与导航

#### 3.6.1 STabs — 选项卡

**用途：** 等宽选项卡切换。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | Array | `[]` | `{ label, count }` 对象 |
| `modelValue` | Number | `0` | 活动索引 |

**样式规格：**
- 白色背景
- 底部边框：`1px solid var(--N200)`
- Tab 最小高度：`80rpx`
- 字号：`var(--fs-13)`，字重 500
- 活动态：`6rpx` 底部下划线 `var(--brand)`，文字 `var(--N800)`
- 按压态：背景 `var(--N50)`

---

#### 3.6.2 StatusTabs — 状态选项卡

**用途：** 带下滑线动画的选项卡，支持按 key 持久化。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | String | `''` | 活动 key |
| `tabs` | Array | `[]` | `{ key, label, count }` 对象 |
| `tabGroup` | String | `''` | 持久化命名空间 |

**样式规格：**
- 与 STabs 相似
- 活动下划线：`6rpx` 高，`var(--brand)`，`3rpx` 圆角
- 下划线动画：`transform 0.25s`

---

#### 3.6.3 STabSelector — 标签选择器

**用途：** 水平滚动标签选择。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tabs` | Array | `[]` | `{ label, count }` 对象 |
| `modelValue` | Number | `0` | 活动索引 |

---

#### 3.6.4 SBottomSheet — 底部弹窗

**用途：** 从底部滑出的模态面板。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | Boolean | `false` | 显示/隐藏 |
| `title` | String | `''` | 标题 |
| `closable` | Boolean | `true` | 是否可点击遮罩关闭 |

**Slots：** `header`、`footer`、default

**样式规格：**
- 遮罩：`rgba(0,0,0,.45)`，过渡 0.25s
- 面板：从底部滑入，顶部圆角 `40rpx`
- 最大高度：`70vh`
- 拖拽手柄：`72rpx × 8rpx`，`var(--N200)`，顶部居中
- 内容区：`padding: 32rpx`，最大高度 `50vh`
- 过渡：`transform 0.28s cubic-bezier(.32,.72,0,1)`

---

#### 3.6.5 SPaymentMethods — 支付方式选择器

**用途：** 支付方式多选一。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `methods` | Array | `[]` | `{ icon, label }` 对象 |
| `modelValue` | Number | `0` | 选中索引 |

**样式规格：**
- 选项间距：`16rpx`
- 每个选项：flex 1，padding `24rpx 16rpx`，圆角 `var(--r-12)`，`1.5px solid var(--N200)` 边框
- 选中态：边框 `var(--brand)`，背景 `var(--brand-t)`，标签文字品牌色
- 单选框：`36rpx` 圆形，`3rpx` 边框

---

### 3.7 表单与输入

#### 3.7.1 SSearchBar — 搜索栏

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | String | `''` | 搜索文字 |
| `placeholder` | String | `'搜索'` | 占位文字 |
| `clearable` | Boolean | `true` | 可清除 |

**样式规格：**
- 背景：`var(--N50)`
- 圆角：`var(--r-8)`
- 高度：`72rpx`
- 输入字号：`var(--fs-14)`，`var(--N900)`
- 清除按钮：`40rpx` 圆形，`var(--N200)` 背景

---

#### 3.7.2 SFormGroup — 表单组

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | String | `''` | 标签 |
| `hint` | String | `''` | 提示文字 |
| `error` | String | `''` | 错误信息 |
| `required` | Boolean | `false` | 必填标记 |

**样式规格：**
- 标签：`var(--fs-13)`，字重 600，`var(--N700)`
- 必填标记：`var(--er)`，字重 700
- 提示：`var(--fs-11)`，`var(--N400)`
- 错误：`var(--fs-11)`，`var(--er)`

---

### 3.8 流程展示

#### 3.8.1 STimeline — 时间线 / 审核链

**用途：** 审核流程、操作日志的垂直时间线展示。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | Array | `[]` | `{ state, step, title, who, desc, time, color }` |

**节点状态：**
- `'ok'` / `'done'`：绿色实心圆
- `'cur'`：品牌色轮廓圆 + 光晕动画（当前步骤）
- `'pending'` / `'p'`：灰色轮廓圆
- `'brand'`：品牌色实心圆
- `'wa'`：橙色圆
- `'er'`：红色圆

**样式规格：**
- 节点圆：`20rpx` 直径，`4rpx` 边框，右边距 `24rpx`
- 连接线：`position: absolute`，left `8rpx`，top `36rpx`，`4rpx` 宽，`var(--N200)`
- 完成态连接线变 `var(--ok)`
- 标题：`var(--fs-13)`，字重 600，`var(--N900)`
- 副文本：`var(--fs-11)`，`var(--N500)`

---

#### 3.8.2 SSteps — 步骤条

**用途：** 垂直步骤进度。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `steps` | Array | `[]` | 字符串或 `{ title, desc }` |
| `current` | Number | `0` | 当前步骤索引 |

**样式规格：**
- 节点：`48rpx` 圆形
- 默认：`var(--N50)` 背景
- 当前：`var(--brand)` 背景
- 完成：`var(--ok)` 背景
- 连接线：`4rpx` 宽，`var(--N200)`，完成 → `var(--ok)`

---

#### 3.8.3 SReviewProgress — 审核进度

**用途：** 带脉冲动画的审核流程展示。

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `steps` | Array | `[]` | `{ label, sub, done, current, popping }` |
| `animatingLine` | Number | `-1` | 动画线索引 |

**动画：**
- 脉冲：当前节点 `1.4s` 循环缩放 + 光晕
- 线辉光：`0.6s` 从品牌色过渡到 ok 色

---

### 3.9 其他组件

#### 3.9.1 SUploadGrid — 上传网格

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `files` | Array | `[]` | `{ url, progress }` 对象 |
| `maxCount` | Number | `9` | 最大上传数 |
| `removable` | Boolean | `true` | 可删除 |

**样式规格：**
- flex wrap 网格，项间距 `8rpx`
- 每项：`144rpx` 方形，`var(--r-8)` 圆角，`1px solid var(--N200)`
- 添加按钮：`1.5px dashed var(--N200)`，`var(--N25)` 背景

---

#### 3.9.2 SChecklist — 检查清单

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | Array | `[]` | `{ title, sub, state, tag, tagType, arrow }` |

**状态图标：** `'todo'`（灰色数字）、`'done'`（绿色对勾）、`'cur'`（品牌色省略号）、`'err'`（红色感叹号）

---

#### 3.9.3 SSuccessPage — 成功页

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `icon` | String | `'✓'` | 图标 |
| `iconType` | String | `'ok'` | `'ok'` / `'wa'` / `'er'` |
| `title` | String | `''` | 标题 |
| `sub` | String | `''` | 副标题 |

**样式规格：**
- 图标：`144rpx` 圆形，语义色背景
- 标题：`var(--fs-18)`，字重 700
- 副标题：`26rpx`，`var(--N500)`，行高 1.6

---

## 四、页面布局规范

### 4.1 标准页面结构

所有端（教师/财务/行政）的页面遵循统一的布局层级：

```
┌─────────────────────────────┐
│  SNavBar (固定顶部)          │  ← 104rpx, z-index: 100
├─────────────────────────────┤
│  scroll-view (flex: 1)      │
│  ┌───────────────────────┐  │
│  │  SBanner              │  │  ← 首页使用，子页可选
│  │  ┌─────────────────┐  │  │
│  │  │  SFloatCard     │  │  │  ← 首页统计卡片
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  SCard                │  │  ← 内容区
│  │    SInfoRow / Badge   │  │
│  │    SListItem          │  │
│  │    SProgressBar       │  │
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │  SCard                │  │
│  │    ...                │  │
│  └───────────────────────┘  │
│           ...               │
├─────────────────────────────┤
│  STabBar (固定底部)          │  ← 120rpx, z-index: 100
└─────────────────────────────┘
```

### 4.2 页面 CSS 模板

```scss
// 所有页面基础样式
.page {
  min-height: 100vh;
  background: var(--N50);          // 统一页面底色
  padding-bottom: var(--tabbar-h); // 有底部 TabBar 时
  display: flex;
  flex-direction: column;
}

// 滚动区域（放在 SNavBar 下方时）
.scroll-body {
  height: 0;
  flex: 1;
}
```

### 4.3 卡片间距规范

```
卡片外边距:    margin: 28rpx;        (水平)
卡片纵向间距:  margin-top: 20rpx;    (卡片之间)
卡片内边距:    padding: 32rpx;       (SCard padding=16)
列表项内边距:  padding: 20rpx 0;    (信息行/列表项)
分割线:       border-bottom: 1px solid var(--N50);
```

### 4.4 典型页面模式

#### 模式 A：首页（Banner + FloatCard + 卡片列表）

用于：教师/财务/行政仪表盘。

```
SBanner → SFloatCard → SCard(待办) → SCard(快捷) → STabBar
```

#### 模式 B：列表页（NavBar + Tabs + 列表）

用于：缴费列表、审核列表。

```
SNavBar → 统计区 + StatusTabs → scroll-view(SCard + 列表项)
```

#### 模式 C：详情页（NavBar + 多卡片）

用于：学生详情、审核详情。

```
SNavBar → SCard(信息) → SCard(状态) → SCard(记录) → SCard(操作)
```

#### 模式 D：审核详情页（NavBar + 审核进度 + 列表 + 操作）

用于：助学金审核、贷款审核、资料审核。

```
SNavBar → SCard(基本信息) → SCard(SReviewProgress) → SCard(SInfoRow 信息行) → 操作按钮组
```

---

## 五、文案规范

### 5.1 状态文案统一

| 实体 | 状态值 | 展示文案 | Badge 颜色 |
|------|--------|----------|------------|
| 缴费 | unpaid | 未缴 | `wa` |
| 缴费 | overdue | 逾期 | `er` |
| 缴费 | partial | 部分未缴 | `in` |
| 缴费 | paid | 已缴 | `ok` |
| 缴费 | channel | 绿通 | `pu` |
| 报到 | false | 待报到 | `wa` |
| 报到 | true | 已报到 | `ok` |
| 报到 | deferred | 已延期 | `er` |
| 审核 | pending | 待审核 | `wa` |
| 审核 | first_pass | 初审通过 | `ok` |
| 审核 | review_pass | 复审通过 | `ok` |
| 审核 | final_pass | 终审通过 | `ok` |
| 审核 | rejected | 已驳回 | `er` |
| 退费 | pending | 待审核 | `wa` |
| 退费 | approved | 待财务确认打款 | `wa` |
| 退费 | refunded | 已完结 | `ok` |
| 退费 | rejected | 已驳回 | `er` |

### 5.2 空状态文案

| 场景 | 文案 |
|------|------|
| 列表无数据 | 暂无数据 |
| 无缴费记录 | 暂无缴费记录 |
| 无票据 | 缴费完成后生成票据 |
| 无消息 | 暂无消息通知 |

### 5.3 按钮文案

| 场景 | 主按钮 | 次按钮 |
|------|--------|--------|
| 提交审核 | 确认通过 | 驳回 |
| 催缴 | 确认发送 | 取消 |
| 延期 | 确定 | 取消 |
| 确认收款 | 确认收款 | — |
| 确认退费 | 确认退费 | — |

---

## 六、平台适配

### 6.1 小程序/H5 适配

- 使用 `rpx` 作为尺寸单位（750rpx = 屏幕宽度）
- 导航栏和 TabBar 采用 `position: fixed`
- 滚动区域使用 `<scroll-view>` 组件
- 底部操作按钮使用 `safe-area-inset-bottom`

### 6.2 PC 端适配

PC 后台管理端复用相同的设计令牌，但布局为侧边栏 + 主内容区模式：

- 侧边栏宽度：`240px`
- 顶部导航高度：`56px`
- 主内容区使用 CSS Grid 或 Flexbox 布局
- 表格、表单等大屏组件另行定义

---

## 七、快速参考

### 7.1 常用 CSS 变量速查

```css
/* 颜色 */
var(--brand)     /* 品牌主色 */
var(--brand-t)   /* 品牌浅底 */
var(--ok)        /* 成功绿 */
var(--wa)        /* 警告橙 */
var(--er)        /* 错误红 */
var(--in)        /* 信息灰蓝 */
var(--pu)        /* 特殊紫 */
var(--N50)       /* 页面底色 */
var(--N200)      /* 分割线 */
var(--N500)      /* 辅助文字 */
var(--N900)      /* 主要文字 */
var(--white)     /* 卡片白 */

/* 字号 */
var(--fs-11)     /* 辅助标签 */
var(--fs-12)     /* 正文描述 */
var(--fs-13)     /* 列表项 */
var(--fs-14)     /* 常规正文 */
var(--fs-15)     /* 卡片标题 */
var(--fs-18)     /* 大标题 */
var(--fs-22)     /* 统计数字 */

/* 圆角 */
var(--r-8)       /* 按钮/输入框 */
var(--r-14)      /* 卡片 */
var(--r-20)      /* Badge/标签 */
var(--r-full)    /* 圆形(50%) */

/* 间距 */
var(--sp-8)      /* 16rpx 组件内间距 */
var(--sp-16)     /* 32rpx 卡片内边距 */
var(--sp-14)     /* 28rpx 卡片外边距 */

/* 阴影 */
var(--card-shadow-low)   /* 卡片 */
var(--card-shadow-high)  /* 浮动卡片 */
```

### 7.2 常用组件引用

```js
import SNavBar from '@/components/shared/SNavBar.vue'
import SCard from '@/components/shared/SCard.vue'
import SInfoRow from '@/components/shared/SInfoRow.vue'
import SBadge from '@/components/shared/SBadge.vue'
import SButton from '@/components/shared/SButton.vue'
import SProgressBar from '@/components/shared/SProgressBar.vue'
import SEmpty from '@/components/shared/SEmpty.vue'
import StatusTabs from '@/components/shared/StatusTabs.vue'
import SBanner from '@/components/shared/SBanner.vue'
import SFloatCard from '@/components/shared/SFloatCard.vue'
import STabBar from '@/components/shared/STabBar.vue'
import SBottomSheet from '@/components/shared/SBottomSheet.vue'
import SAlertBar from '@/components/shared/SAlertBar.vue'
import SAmount from '@/components/shared/SAmount.vue'
import SListItem from '@/components/shared/SListItem.vue'
import SSearchBar from '@/components/shared/SSearchBar.vue'
import SCheckbox from '@/components/shared/SCheckbox.vue'
import STimeline from '@/components/shared/STimeline.vue'
import SReviewProgress from '@/components/shared/SReviewProgress.vue'
import SFormGroup from '@/components/shared/SFormGroup.vue'
```

---

*华东科技大学迎新管理系统 · UI 设计规范说明书 V1.0 · 2026-05-30*
