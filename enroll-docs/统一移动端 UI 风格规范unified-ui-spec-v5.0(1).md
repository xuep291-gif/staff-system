# 统一移动端 UI 风格规范 v5.0

> 适用于：华东科技大学迎新缴费小程序（学生端 + 教职工端）及后续移动端页面
> 设计基准：375 × 812 pt（iPhone 13 逻辑分辨率）
> 最后更新：2026-05-22
> 变更摘要：v4.0 → v5.0 新增角色主题系统、12 个组件、Toast/BottomSheet/Timeline 等交互模式

---

## 1 设计原则

| 原则 | 说明 |
|------|------|
| 信息克制 | 单屏聚焦一个核心任务，避免信息过载 |
| 状态可感知 | 每个操作即时反馈（Badge / Toast / 骨架屏） |
| 色彩语义化 | 颜色即含义——蓝=主操作、绿=成功、橙=警告、红=危险、紫=助学 |
| 触控友好 | 最小可触控区域 44pt，关键 CTA 不低于 52pt |
| 安全区适配 | 底部 TabBar / 底部按钮必须适配 `env(safe-area-inset-bottom)` |
| 角色一致性 | 不同角色共享组件骨架，仅通过 `--brand` Token 切换主题色 |

---

## 2 色彩体系

### 2.1 品牌色 & 角色主题系统

系统通过 `--brand` / `--brand-t` / `--brand-d` 三个 Token 实现多角色主题切换。组件中所有涉及主色的地方统一引用 `--brand`，不再直接写 `--primary`。

```css
:root {
  --tc: #2B6CB0;  --tc-t: #DBEAFE;  --tc-d: #1E4D8C;  /* 教师/学生 蓝 */
  --fc: #15803D;  --fc-t: #DCFCE7;  --fc-d: #166534;  /* 财务 绿 */
  --ac: #7C3AED;  --ac-t: #EDE9FE;  --ac-d: #6D28D9;  /* 政务 紫 */

  --brand: var(--tc);  --brand-t: var(--tc-t);  --brand-d: var(--tc-d);
}
body.rf { --brand: var(--fc); --brand-t: var(--fc-t); --brand-d: var(--fc-d); }
body.ra { --brand: var(--ac); --brand-t: var(--ac-t); --brand-d: var(--ac-d); }
```

| 角色 | `--brand` | 色系 | 适用场景 |
|------|-----------|------|----------|
| 学生端 / 班主任 | `--tc` `#2B6CB0` | 蓝 | 学生缴费、班主任审核 |
| 财务职工 | `--fc` `#15803D` | 绿 | 收款确认、退费审批 |
| 政务职工 | `--ac` `#7C3AED` | 紫 | 换房审批、助学金终审 |

### 2.2 基础主色（学生端默认）

| Token | 色值 | 用途 |
|-------|------|------|
| `--primary` | `#2B6CB0` | 主按钮、主文字链接、激活态 Tab、进度条 |
| `--primary-pressed` | `#1E4D8C` | 按钮按下态 |
| `--primary-tint` | `#DBEAFE` | 主色浅底（步骤图标背景、选中态底色） |
| `--primary-surface` | `#EFF6FF` | 主色极浅底（TabBar 激活底色） |
| `--primary-dark` | `#1E3A5F` | 深色背景标题文字 |

> **迁移指引**：新组件一律使用 `--brand` / `--brand-t` / `--brand-d`；`--primary` 系列保留给学生端硬编码场景。

### 2.3 语义色

| 语义 | 文字色 | 浅底色 | 边框色 | 使用场景 |
|------|--------|--------|--------|----------|
| 成功 success | `#15803D` | `#DCFCE7` | `#86EFAC` | 缴费成功、步骤完成、已通过 |
| 警告 warning | `#D97706` | `#FEF3C7` | `#FCD34D` | 待缴提醒、审核中、金额高亮 |
| 危险 danger | `#B91C1C` | `#FEE2E2` | `#FCA5A5` | 逾期账单、紧急操作、已退回 |
| 信息 info | `#0369A1` | `#E0F2FE` | `#7DD3FC` | 退款中、一般提示 |
| 助学 purple | `#7C3AED` | `#EDE9FE` | `#C4B5FD` | 助学金、奖助学相关 |

### 2.4 中性色

| Token | 色值 | 用途 |
|-------|------|------|
| `--N900` | `#111827` | 主标题、重要数值 |
| `--N700` | `#374151` | 正文、卡片标题 |
| `--N500` | `#6B7280` | 辅助文字、标签值 |
| `--N400` | `#9CA3AF` | 占位符、禁用态、时间戳 |
| `--N200` | `#E5E7EB` | 分割线、未激活 Badge 边框 |
| `--N50` | `#F2F3F5` | 页面背景、列表项分隔条 |
| `--N25` | `#F8F9FB` | 票据卡片背景、表单项背景 |
| `--white` | `#FFFFFF` | 卡片背景、TabBar 背景 |

---

## 3 字体与排版

### 3.1 字体栈

```css
font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
```

### 3.2 字号梯度

| 角色 | 字号 | 字重 | 行高 | 颜色 Token |
|------|------|------|------|------------|
| 页面大数字（金额） | 36px / 28px | 700 | — | `--warning` / `--brand` |
| 卡片数值 | 22px / 18px / 16px | 700 | 1.2 | `--brand` / 语义色 |
| 页标题 | 16px ~ 17px | 600 | — | `--N900`（白色背景）/ 白色（品牌色背景） |
| 用户名 / 大号标题 | 18px | 700 | 1.2 | 白色 |
| 卡片标题 | 15px | 600 | — | `--N900` |
| 按钮文字 | 14px | 600 | — | 白色 / `--brand` |
| 正文列表 | 13px | 600 / 400 | — | `--N700` / `--N900` |
| 辅助描述 | 12px | 400 / 600 | 1.4 ~ 1.5 | `--N500` |
| 时间戳 | 11px / 10px | 400 | — | `--N400` |
| Section 标签 | 10px | 600 | — | `--N400` |
| TabBar 标签 | 10px | 500 ~ 600 | — | `--brand` / `--N400` |

> **Section 标签规范**：全大写（`text-transform: uppercase`），`letter-spacing: 0.5px`。

---

## 4 间距与圆角

### 4.1 间距系统（8px 基础网格）

| 场景 | 学生端 | 教职工端 | 说明 |
|------|--------|----------|------|
| 卡片内边距 | 16px | 12px ~ 14px | 教职工端更紧凑 |
| 页面内容区左右 | 14px | 14px | 一致 |
| 卡片间距 | 12px | 10px | 教职工端信息密度更高 |
| 按钮组内间距 | 10px | 8px | — |
| 网格项间距 | 8px | 1px（分隔线） | 两种模式均支持 |
| 页面上下内边距 | 16px ~ 20px | 14px | — |

### 4.2 圆角规范

| 元素 | 圆角 |
|------|------|
| 卡片（Card） | 14px |
| 浮动卡片（Float Card） | 14px |
| 输入框 / 文本域 | 12px |
| 上传区域 / 素材缩略图 | 12px / 8px |
| 按钮（主/次/危险） | 8px |
| 胶囊按钮（Pill） | 20px |
| Badge / Tag | 20px |
| 图标容器（Grid Icon） | 12px |
| 步骤图标容器 | 12px |
| Tab 选择器（外层/内项） | 10px / 8px |
| Toast | 20px |
| Bottom Sheet（顶部） | 20px 20px 0 0 |
| Avatar | 50%（圆形） |
| 通知红点 | 50%（圆形） |
| Spinner | 50%（圆形） |

---

## 5 阴影系统

| Token | 定义 | 用途 |
|-------|------|------|
| `--card-shadow-high` | `0 4px 16px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)` | 浮动卡片、弹出层 |
| `--card-shadow-low` | `0 1px 3px rgba(0,0,0,.06)` | 普通卡片 |
| TabBar shadow | `0 -2px 8px rgba(0,0,0,.06)` | 底部导航上投影 |
| Phone frame | `0 24px 64px rgba(0,0,0,.25), 0 4px 16px rgba(0,0,0,.12)` | 原型演示用 |
| Toast | 内联 `rgba(0,0,0,.78)` 背景 | 浮层提示 |

---

## 6 组件规范

### 6.1 导航栏（NavBar）

**两种形态：**

#### 白底导航栏（子页面默认）
```
┌─────────────────────────────────┐
│  [←]  页面标题          右侧操作 │
└─────────────────────────────────┘
```
- 高度：52px，`padding: 0 16px`
- 背景：`--white`，底部边框 `1px solid --N200`
- 返回图标：20×20px SVG / 22px Icon，`--N700`
- 标题：16px，600，`--N900`，居中（`flex: 1; text-align: center`）
- 右侧操作：13px，`--brand`

#### 品牌色导航栏（一级页面 / 全屏沉浸式）
- 高度：52px
- 背景：`--brand`，无底边框
- 返回 / 标题 / 操作均为白色
- `transition: background .3s` 跟随角色切换

### 6.2 Status Bar（状态栏模拟）

- 高度：44px
- 背景：`--brand`，跟随角色主题，`transition: background .3s`
- 左侧时间：15px，600，白色
- 右侧图标组：白色 SVG 图标（信号 / WiFi / 电量），间距 5px

### 6.3 TabBar（底部导航）

```
┌─────────────────────────────────┐
│   首页    缴费    资料    我的    │
└─────────────────────────────────┘
```

- 高度：56px ~ 60px + `env(safe-area-inset-bottom)`
- 背景：`--white`，顶部边框 `1px solid --N200`，可选 `box-shadow: 0 -2px 8px rgba(0,0,0,.06)`
- 图标大小：22px（SVG `stroke-width: 1.8`）或 22px 字体图标
- 图标容器：24×24px 容器，激活态 `background: --brand-t` + `border-radius: 8px`
- 激活态：图标 `--brand`，文字 `--brand`，600
- 未激活态：图标和文字 `--N400`，500
- 标签文字：10px
- 每项：`flex: 1`，居中对齐，`gap: 2px`

#### TabBar 计数徽标（新增）

```css
.tbbadge {
  position: absolute;
  top: 4px;
  right: calc(50% - 22px);
  background: var(--er);
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}
```

- 红色圆角胶囊，白色 9px 加粗数字
- 超过 99 显示 "99+"
- 无数字时移除 DOM

### 6.4 Banner（首页顶部横幅）

- 背景：`--brand`，`transition: background .3s`
- 内边距：`16px 18px 44px`（底部多留空间给浮动卡片）
- 用户头像：40×48px 圆形，`rgba(255,255,255,.2)` 背景，2px 白色边框
- 用户名：18px，700，白色
- 副标题（院系·学号/职务）：11px，白色 70% 透明度
- 通知铃铛按钮：36×36px 圆形，15% 透明白色背景，红色圆点 `8px`

### 6.5 浮动卡片（Float Card）

- 背景：`--white`
- 阴影：`--card-shadow-high`
- 圆角：14px
- 内边距：16px
- 位置：`margin-top: -28px`，`z-index: 2 ~ 10`
- `transition: background .3s`（跟随角色切换无闪烁）

### 6.6 进度条

```
报到进度                          83.3%
██████████████░░░░░░░░░░░░░░░░░░
```

- 外层：`height: 6px`，`border-radius: 3px`，背景 `--N200`（教职工端）/ `--N50`（学生端）
- 填充：`height: 100%`，`border-radius: 3px`，背景 `--brand`
- 支持百分比动画 `transition: width .6s, background .3s`
- **语义色进度条**：低于阈值可变色（`background: --wa` / `--er`）
- 可选头部标签行：`font-size: 11px`，`--N500`，左侧文字 + 右侧百分比

### 6.7 统计数据行（Stats Row）

```
┌──────────┬──────────┬──────────┐
│ 42       │   35     │    7     │
│ 班级总人数│ 已报到   │ 未报到    │
└──────────┴──────────┴──────────┘
```

- 三列等分 `flex: 1`，`1px solid --N200` 分隔
- 数值：22px（默认）/ 18px（紧凑）/ 16px（迷你），700，`--brand` / 语义色
- 标签：10px，`--N400`，`letter-spacing: .3px ~ .5px`

### 6.8 卡片（Card）

- 背景：`--white`
- 边框：`1px solid rgba(0,0,0,.07)`
- 阴影：`--card-shadow-low`
- 圆角：14px
- `overflow: hidden`

**卡片头部（Card Header）：**
```
┌─────────────────────────────────┐
│ 卡片标题                 右侧操作 │ ← 12px 14px, border-bottom: --N50
├─────────────────────────────────┤
│ 卡片内容                        │ ← 12px 14px
└─────────────────────────────────┘
```
- 标题：15px，600，`--N900`
- 右侧操作：12px，`--brand`，或 Badge

**特殊变体：**
- `.urgent` → `border-color: --danger-border`
- 无边框/阴影变体（如财务端快捷网格）→ 只用 `border-radius: 14px`

### 6.9 Badge / 标签

| 变体 | 文字色 | 背景色 | 边框色 |
|------|--------|--------|--------|
| success | `--success` | `--success-bg` | `--success-border` |
| warning | `#92400E` | `--warning-bg` | `--warning-border` |
| danger | `--danger` | `--danger-bg` | `--danger-border` |
| info | `--info` | `--info-bg` | `--info-border` |
| purple | `--purple` | `--purple-bg` | `--purple-border` |
| neutral | `--N500` | `--N50` | `--N200` |

- 尺寸：`padding: 2px ~ 3px 8px ~ 10px`，`border-radius: 20px`，11px，600
- 图标内嵌：10px，`gap: 3px ~ 4px`
- 行为：`inline-flex`，`white-space: nowrap`
- **警告 Badge 文字色**：统一为 `#92400E`（深褐色），非 `--warning` 橙色，保证可读性

### 6.10 按钮

#### 主按钮（btn-primary / btn-p）
- 高度：44px，全宽，`border-radius: 8px`
- 背景：`--brand`，文字白色，14px，600
- 按下态：`--brand-d`，`transition: background .15s`
- 图标 + 文字间距：4px ~ 6px

#### 强调主按钮（CTA）
- 高度：52px，`border-radius: 14px`，字号 16px
- 用于支付确认等关键操作

#### 次按钮（btn-secondary / btn-s）
- 高度：44px，`border: 1.5px solid --brand`
- 背景透明，文字 `--brand`，14px，600

#### 危险按钮（btn-danger / btn-e）
- 高度：44px，`border: 1px solid --danger-border`
- 背景 `--danger-bg`，文字 `--danger`，14px，600

#### 按钮行（brow）
```html
<div class="brow">
  <button class="btn-e">拒绝</button>
  <button class="btn-p">通过</button>
</div>
```
- `display: flex; gap: 8px`，每项 `flex: 1`
- 常见组合：危险 + 主按钮 / 次按钮 + 主按钮

#### 胶囊按钮（pill）
- 高度：28px ~ 32px，`border-radius: 20px`
- 实心款：`background: --brand`，白色，11px ~ 12px
- 浅底款：`background: --brand-t`，`--brand`，11px

#### 胶囊描边按钮（btn-pill-outline）
- 高度：32px ~ 44px，`border-radius: 20px`（或 8px）
- `border: 1px solid --N200`，文字 `--N500`，11px

### 6.11 步骤列表（Steps）

**学生端样式（左侧图标 + 标题 + 右侧 Badge）：**
```
[图标] 步骤标题              [Badge]
       步骤描述
```
- 图标容器：36×36px，`border-radius: 12px`
  - 完成态：`--success-bg` + `--success`
  - 进行中：`--brand-t` + `--brand`
  - 待办态：`--N50` + `--N400`

### 6.12 快捷入口网格（Quick Entry Grid）

**模式 A — 卡片内网格（学生端）：**
- 3 列等分，`gap: 8px`，`padding: 12px 16px 14px`
- 图标容器：44×44px，`border-radius: 12px`
- 文字：13px，600，`--N700`

**模式 B — 分隔线网格（教职工端）：**
- 3 列等分，`gap: 1px`，`background: --N50` 作分隔线
- 每格：`background: #fff`，`padding: 14px 8px`，居中
- 图标：22px emoji / 字体图标
- 文字：11px，600，`--N700`

### 6.13 通知/消息列表（Notice List）

**学生端（左圆点指示器）：**
- 未读圆点：8px，`--brand`
- 已读圆点：8px，`--N200`

**教职工端（卡片内消息）：**
- 每条消息为独立卡片
- 标题行左侧带 emoji + 语义色文字，右侧时间
- 描述正文 13px

### 6.14 待办事项列表（Todo Items，新增）

```html
<div class="ti">
  <div class="tico" style="background:#EFF6FF">📋</div>
  <div class="titx">
    <div class="titt">资料待初核</div>
    <div class="tisc">8 名同学材料待审核</div>
  </div>
  <span class="b ber">8</span>
  <div class="tarr">›</div>
</div>
```

- 高度：自动，`padding: 10px 14px`
- 左图标容器：36×36px，`border-radius: 8px`，emoji/icon + 语义色浅底
- 中间：标题 13px 600 `--N900` + 描述 11px `--N500`
- 右侧：Badge 计数 + 箭头图标 14px `--N400`
- 按下态：`background: --N50`，`transition: background .15s`

### 6.15 列表项（List Item，通用）

**教职工端学生列表：**
```html
<div class="li">
  <div class="lav">王</div>
  <div class="linf">
    <div class="ln">王明辉</div>
    <div class="ls">2026010001 · 逾期 12 天</div>
  </div>
  <div class="lm">
    <span class="lamt">¥5,800</span>
    <span class="b ber">逾期</span>
  </div>
</div>
```

- `padding: 12px 14px`，`border-bottom: 1px solid --N50`
- 头像：40×40px 圆形，`--brand-t` 底，`--brand` 色姓氏首字，15px 700
- 信息区：标题 13px 600 `--N900` + 描述 11px `--N500`
- 右侧：金额 14px 600 `--danger` / `--brand` + Badge
- 按下态：`background: --N50`

### 6.16 信息行（Info Rows，新增）

```html
<div class="ir">
  <span class="ik">学费</span>
  <span class="iv">¥5,800.00 未缴</span>
</div>
```

- `padding: 10px 0`，`border-bottom: 1px solid --N50`
- 键：13px，`--N500`，`flex-shrink: 0`
- 值：13px，`--N900`，500，右对齐，`max-width: 200px`
- 用于详情卡片内 key-value 展示

### 6.17 表单控件

#### 输入框（finput）
- 高度：44px，`border-radius: 12px`
- `border: 1.5px solid --N200`，`--white` 背景
- 内边距：`0 12px`
- 文字：13px ~ 14px，`--N900`
- 聚焦态：`border-color: --brand`

#### 文本域（fta）
- `padding: 10px 12px`，`border-radius: 12px`
- `min-height: 72px` ~ 80px，`resize: none`

#### 金额输入（famt，新增）
```html
<div class="famt">
  <span class="famt-pre">¥</span>
  <input type="number" class="famt-in" value="4000">
</div>
```
- 前缀：16px，600，`--N500`
- 输入框：高度 44px，`border: 1.5px solid --N200`，`border-radius: 12px`
- 字号 20px，700，`--brand`，居中突出

#### 表单行（frow / frows）
- `frow`：`display: flex; flex-direction: column; gap: 4px`
- `frows`：多个 frow 的容器，`gap: 12px`
- 标签（flabel）：12px，600，`--N700`，`margin-bottom: 4px`
- 提示文字（fhint）：11px，`--N400`

#### 下拉选择
- 与输入框同尺寸，`appearance: none`，自定义右侧箭头 SVG

#### 上传区域
- `border: 1.5px dashed --N200`，`border-radius: 12px`
- 背景 `--N25`，`padding: 20px`，居中
- 图标：28px，`--N400`
- 文字：12px，`--N500`

### 6.18 支付方式选择器

- 每项：`padding: 12px`，`border-radius: 12px`，`border: 1.5px solid --N200`
- 选中态：`border-color: --brand`，`background: --brand-t`（注意：v4.0 用 `--primary-surface`，v5.0 统一为 `--brand-t`）
- 图标：24px
- 名称：14px，600，`--N700`
- 单选圆圈：18px，选中态填 `--brand` + 6px 白色内圆

### 6.19 Tab 选择器（Segment Control）

**学生端（胶囊式）：**
- 外层：`background: --N50`，`border-radius: 10px`，`padding: 3px`
- 每项：`height: 32px`，`border-radius: 8px`，13px，600，`--N500`
- 激活态：`background: --white`，`--brand`，`box-shadow: 0 1px 4px rgba(0,0,0,.1)`

**教职工端（下划线式，新增）：**
```css
.tbar { display: flex; background: #fff; border-bottom: 1px solid --N200; overflow-x: auto; }
.tab  { flex: 1; min-width: 60px; padding: 10px 4px; text-align: center;
        font-size: 12px; color: --N400; border-bottom: 2px solid transparent;
        font-weight: 500; transition: all .2s; }
.tab.on { color: --brand; border-bottom-color: --brand; font-weight: 600; }
```
- 可横滑（`overflow-x: auto`，隐藏滚动条）
- 激活态：文字 `--brand` + 底部 2px `--brand` 边框
- 支持内嵌 Badge 计数

### 6.20 缴费记录列表

- 左侧：标题 13px 600 `--N700` / `--N900` + 时间 11px `--N400`
- 右侧：金额 14px ~ 15px 600 ~ 700 + Badge

### 6.21 票据卡片（Receipt Card）

- 容器：`background: --N25`，`border-radius: 12px`，`border: 1px solid --N200`
- 每行：`padding: 5px 0`，`border-bottom: 1px dashed --N200`，12px
- 键：`--N500`，值：`--N700`，600
- 合计行：加粗，`--brand` / `--primary` 色大号金额

### 6.22 提示条（Alert Banner）

```html
<div class="abar awa">⚠️ 提示文字</div>
<div class="abar ain">ℹ️ 提示文字</div>
<div class="abar aer">⚠️ 提示文字</div>
```

- `border-radius: 8px`（v5.0 统一为 8px，v4.0 的 12px 仍兼容）
- `padding: 10px 14px`
- 图标 + 文字横排，`gap: 8px`
- 变体：`--warning-bg` / `--info-bg` / `--danger-bg`，`border: 1px solid` 对应边框色
- 文字：12px，`line-height: 1.4 ~ 1.5`

| 变体 | class | 背景 | 文字 | 边框 |
|------|-------|------|------|------|
| 警告 | `.abar.awa` | `--wa-bg` | `#92400E` | `--wa-bd` |
| 信息 | `.abar.ain` | `--in-bg` | `--in` | `--in-bd` |
| 危险 | `.abar.aer` | `--er-bg` | `--er` | `--er-bd` |

### 6.23 空状态

- 居中布局，`padding: 40px 20px`
- 图标：36px ~ 48px，`opacity: .4`
- 文字：13px ~ 14px，600，`--N500`

### 6.24 Toast 浮层提示（新增）

```css
#gtoast {
  position: fixed;
  bottom: 84px;  /* TabBar 上方 */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,.78);
  color: #fff;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  z-index: 9999;
  white-space: nowrap;
  pointer-events: none;
}
```

- 居中底部，TabBar 上方
- 黑色半透明胶囊，白色 13px 文字
- 自动消失 2500ms
- 用法：`toast('✅ 操作成功')`

### 6.25 Bottom Sheet（底部操作面板，新增）

```css
.ovl { position: fixed; inset: 0; background: rgba(0,0,0,0);
       z-index: 300; pointer-events: none; transition: background .25s; }
.ovl.on { background: rgba(0,0,0,.45); pointer-events: all; }

.sheet { position: absolute; bottom: 0; left: 0; right: 0;
         background: #fff; border-radius: 20px 20px 0 0;
         padding: 0 0 34px;
         transform: translateY(100%);
         transition: transform .28s cubic-bezier(.32,.72,0,1);
         max-height: 86vh; overflow-y: auto; }
.ovl.on .sheet { transform: translateY(0); }
```

**结构：**
```
┌─────────────────────────────────┐
│          ━━━━ (handle)          │ ← 36×4px, --N200, border-radius: 2px
│  面板标题                       │ ← 16px 600, --N900, border-bottom: --N50
├─────────────────────────────────┤
│  内容区                         │ ← padding: 16px, gap: 12px
│  - 提示条 / 信息行 / 表单       │
│  - 操作按钮                     │
└─────────────────────────────────┘
```

- 遮罩层：`rgba(0,0,0,.45)`，250ms 渐变
- 面板：从底部滑入 `cubic-bezier(.32,.72,0,1)` 弹性曲线
- 拖拽手柄：36×4px，`--N200`，居中，`margin: 10px auto 0`
- 标题：16px，600，`--N900`，`padding: 14px 16px 12px`
- 内容区：`padding: 16px`，`gap: 12px`，`flex-direction: column`
- 最大高度：`86vh`，超出可滚动
- 点击遮罩关闭（`onclick` 冒泡拦截：`event.stopPropagation()`）

**常见用途：** 催缴确认、退费审批、资料退回原因选择、收款确认

### 6.26 Timeline / 审批链（新增）

```
  ●━━━━━ ① 学生申请 ¥4,000
          2026-05-14 16:22

  ●━━━━━ ② 班主任初审通过
          刘晓华 · 建议 ¥4,000

  ◉      ③ 学院复审（当前步骤）
          待：周婷婷

  ○      ④ 学工处终审
          待上一步完成后解锁
```

**结构：**
```html
<div class="tl">
  <div class="tli">
    <div class="tll">
      <div class="tldot ok"></div>    <!-- 已完成：filled --ok -->
      <div class="tlline"></div>       <!-- 连接线 -->
    </div>
    <div class="tlc">
      <div class="tlstep">步骤文字</div>
      <div class="tlwho">操作人</div>
      <div class="tltime">时间</div>
    </div>
  </div>
</div>
```

**圆点状态：**
| class | 样式 | 含义 |
|-------|------|------|
| `.tldot`（默认） | `background: --brand; border: 2px solid --brand` | 已完成 |
| `.tldot.ok` | `background: --ok; border-color: --ok` | 已通过 |
| `.tldot.cur` | `background: --brand; border-color: --brand` | 当前步骤 |
| `.tldot.p` | `background: #fff; border-color: --N200` | 待办（空心） |

- 圆点：10×10px，`border: 2px solid`
- 连接线：`width: 1px`，`background: --N200`，`flex: 1`，`min-height: 20px`
- 步骤文字：12px，600，`--N900`（当前步骤用 `--brand`）
- 操作人：11px，`--N500`
- 时间：10px，`--N400`
- 步骤间距：`margin-bottom: 16px`

### 6.27 素材缩略图网格（Material Thumbnails，新增）

```html
<div class="mgrid">
  <div class="mth">
    <div class="mth-ico">🪪</div>
    <div class="mth-lbl">身份证正面</div>
    <div class="mth-ok"></div>      <!-- 已上传标记 -->
  </div>
</div>
```

- 网格：`display: flex; flex-wrap: wrap; gap: 8px`
- 每项：72×72px，`border-radius: 8px`
- 边框：`1px solid --N200`，背景 `--N50`
- 图标：22px
- 标签：9px，`--N500`，居中
- 已上传标记：14×14px 圆形，`--ok` 背景，白色 ✓（8px）
- 点击可预览（Toast 或全屏）

### 6.28 复选框 & 单选框（新增）

**复选框（审核清单）：**
```css
input[type=checkbox] {
  width: 16px; height: 16px;
  accent-color: var(--brand);
}
```
- 标签文字：13px，`--N900`
- 间距：`gap: 10px`

**单选框（Bottom Sheet 内）：**
```css
input[type=radio] {
  accent-color: var(--brand);
}
```
- 标签文字：13px，`--N700` / `--N900`
- 间距：`gap: 8px`

### 6.29 Loading Spinner（新增）

```css
.spin {
  width: 16px; height: 16px;
  border: 2px solid --N200;
  border-top-color: --brand;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- 容器：`display: flex; align-items: center; justify-content: center; gap: 8px`
- 文字：13px，`--N400`
- 用法：表单提交、API 请求时的加载态

### 6.30 成功/结果页（新增）

```
┌─────────────────────────┐
│        ✅ (icon)        │  ← 72×72px 圆形，语义色浅底
│     操作结果标题         │  ← 18px 700, --N900
│    描述文字（居中）      │  ← 13px, --N500
│                         │
│  ┌───────────────────┐  │
│  │ 信息行 1           │  │  ← Card + Info Rows
│  │ 信息行 2           │  │
│  └───────────────────┘  │
│                         │
│  [返回/继续 按钮]       │  ← btn-primary, margin-top: 16px
└─────────────────────────┘
```

- 全页居中，`padding-top: 40px`
- 图标：72×72px 圆形，语义色浅底（成功 `--ok-bg`、警告 `--wa-bg`）
- 按钮：`width: 100%; margin-top: 16px`

### 6.31 绑定/引导流程（Onboarding Wizard，新增）

三步流程：① 验证手机号 → ② 绑定业务账号 → ③ 绑定成功

**结构：**
```
┌─────────────────────────┐
│ 品牌色 Hero 区           │ ← --brand 背景，角色标签 + Logo + 标题
├─────────────────────────┤
│ ┌───────────────────┐   │
│ │ 步骤卡片           │   │  ← 圆角 20px 20px 0 0，--N50 背景
│ │ ① 输入项 + 按钮    │   │
│ │ 提示条             │   │
│ │ [下一步]           │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

- Hero：`background: --brand`，`padding: 32px 24px 52px`
- Logo：60×60px，`border-radius: 16px`，半透明白色背景
- 角色标签：`border-radius: 20px`，半透明白色背景 + 文字
- 内容区：`background: --N50`，`border-radius: 20px 20px 0 0`，`margin-top: -20px`

---

## 7 布局模式

### 7.1 通用页面结构

```
┌─────────────────────┐
│   Status Bar (44px) │  ← --brand 背景
├─────────────────────┤
│   NavBar / Banner   │  ← 品牌色 或 白底
├─────────────────────┤
│                     │
│   Scroll Area       │  ← flex: 1, overflow-y: auto
│   (.sbody)          │
│                     │
│   ┌─────────────┐   │
│   │ Section Label│   │  ← 10px, --N400, uppercase
│   └─────────────┘   │
│   ┌─────────────┐   │
│   │   Card      │   │
│   └─────────────┘   │
│                     │
├─────────────────────┤
│  TabBar (56px+safe) │  ← 可选
└─────────────────────┘
```

### 7.2 内容区规范

- 背景：`--N50`
- 内边距：学生端 `padding: 20px 14px 100px`（有 TabBar）/ 教职工端 `padding: 14px`（`gap: 10px`）
- 主轴排列：`flex-direction: column`
- 滚动区域：`-webkit-overflow-scrolling: touch`，隐藏滚动条（`scrollbar-width: none`）

### 7.3 子页面结构（无 TabBar）

- 用 NavBar 替代 Banner
- 底部不再预留 100px

### 7.4 屏幕切换模型（新增）

教职工端使用绝对定位叠层 + opacity 切换：

```css
.screens { flex: 1; overflow: hidden; position: relative; }
.scr { position: absolute; inset: 0; display: flex; flex-direction: column;
       opacity: 0; pointer-events: none; transition: opacity .18s; }
.scr.on { opacity: 1; pointer-events: all; }
```

- 所有屏幕叠在同一容器内
- JS 切换 `.on` class
- 滚动位置重置：`sb.scrollTop = 0`
- 过渡时长 180ms

---

## 8 交互与动效

| 交互 | 规则 |
|------|------|
| 按钮按下 | 背景色变化 150ms ease |
| 可点击项按下 | `background: --N50` 150ms |
| 进度条变化 | `transition: width .6s, background .3s` |
| Tab 切换 | `transition: all .15s ~ .2s` |
| 支付方式选中 | `transition: border-color .15s` |
| 输入框聚焦 | 边框颜色切换无延迟 |
| 角色主题切换 | `transition: background .3s` |
| Bottom Sheet 入场 | `transform .28s cubic-bezier(.32,.72,0,1)` |
| Bottom Sheet 遮罩 | `background .25s ease` |
| Toast 淡入 | `display: none → block`，无动画（2500ms 后自动隐藏） |
| Spinner 旋转 | `animation: spin .7s linear infinite` |
| 屏幕切换 | `opacity .18s` |
| 禁用长按弹窗 | `-webkit-tap-highlight-color: transparent` |

---

## 9 图标规范

### 9.1 图标库

- **Tabler Icons**（`@tabler/icons-webfont`）：学生端首选
- **内联 SVG**：教职工端首选（无外部依赖）
- 两种方式可混用，需保持视觉一致

### 9.2 引用方式

```html
<!-- Tabler Icons -->
<i class="ti ti-home"></i>

<!-- Inline SVG -->
<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
```

### 9.3 常用尺寸

| 尺寸 | 场景 |
|------|------|
| 14px | 列表箭头、Badge 内嵌 |
| 16px | 状态栏图标 |
| 18px ~ 20px | 步骤图标、通知图标、导航栏图标 |
| 20px ~ 22px | TabBar 图标、快捷入口 |
| 24px | 支付方式图标 |
| 28px | 上传区域 |
| 32px ~ 36px | 空状态、成功页图标 |
| 48px | 空状态大图标 |

### 9.4 图标映射（扩展）

| 场景 | Tabler | SVG / Emoji |
|------|--------|-------------|
| 首页 | `ti-home` | `🏠` |
| 账单/缴费 | `ti-file-text` / `ti-credit-card` | `💰` / `💵` |
| 票据 | `ti-receipt` | `🧾` |
| 我的 | `ti-user` | — |
| 铃铛 | `ti-bell` | `🔔` |
| 返回 | `ti-arrow-left` | `<polyline points="15 18 9 12 15 6"/>` |
| 成功 | `ti-check` / `ti-circle-check` | `✅` |
| 警告 | `ti-alert-triangle` / `ti-alert-circle` | `⚠️` |
| 时钟 | `ti-clock` | — |
| 助学金 | `ti-heart-handshake` | `⭐` |
| 资料审核 | `ti-clipboard-check` | `📋` |
| 宿舍 | `ti-home` | `🏠` |
| 退费 | `ti-arrow-back-up` | `↩️` |
| 上传 | `ti-cloud-upload` | `📤` |
| 催缴 | — | `📢` |
| 审批链 | — | `📤` |
| 补差 | — | `🔄` |
| 微信 | `ti-brand-wechat` | — |
| 支付宝 | `ti-brand-alipay` | — |

---

## 10 适配与响应式

| 项目 | 规则 |
|------|------|
| 基准宽度 | 375pt |
| 缩放策略 | `viewport: width=device-width, initial-scale=1.0, maximum-scale=1.0` |
| 安全区 | 底部使用 `env(safe-area-inset-bottom)` |
| 小屏（<375pt） | 字号不缩，间距可微调（`-2px`） |
| 大屏（>414pt） | 内容区最大宽度保持 375pt 居中，或等比放大间距 |
| 横屏 | 不支持 |
| 禁用数字输入箭头 | `input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none }` |

---

## 11 页面级规范速查

### 学生端

| 页面 | 结构要点 |
|------|----------|
| 首页 | Banner + Float Card（进度 + 统计）+ 内容区（账单 → 步骤 → 快捷入口 → 通知）+ TabBar |
| 在线缴费 | 品牌色 NavBar + 副标题 + Float Card（金额 + Tab选择器）+ 支付方式 + 警告提示 + CTA |
| 缴费记录 | NavBar + Tab 选择器（全部/在线缴费/退费）+ 按学年分组列表 |
| 我的票据 | NavBar + 票据卡片列表（信息行 + 合计 + 操作按钮） |
| 助学金申请 | NavBar + 紫色提示条 + 表单 + 上传 + 提交 + 申请记录 |
| 消息中心 | NavBar（"全部已读"）+ Tab 选择器 + 消息列表（图标 + 标题 + 时间 + 描述） |

### 教职工端 — 班主任

| 页面 | 结构要点 |
|------|----------|
| 首页 | Banner + Float Card（统计 + 进度条）+ 待办列表 + 快捷网格（分隔线模式）+ TabBar |
| 缴费管理 | 品牌色 NavBar + 统计卡 + 危险提示条 + 学生列表 + 一键催缴按钮 |
| 账单详情 | NavBar + 学生信息卡 + 应缴明细（Info Rows）+ 联系方式 + 催缴按钮 |
| 资料审核 | NavBar + 下划线 Tab（待审核/已通过/已退回）+ 学生列表（含材料 Badge） |
| 资料初核 | NavBar + 学生信息 + 素材缩略图网格 + 审核清单（复选框）+ 意见文本域 + 退回/通过 |
| 审核完成 | NavBar + 成功页（图标 + 标题 + 信息卡 + 继续按钮） |
| 助学金审核 | NavBar + 下划线 Tab + 列表 + Bottom Sheet 审批 |
| 助学金初审 | NavBar + 学生信息 + 申请详情 + 佐证材料 + 金额输入 + 意见文本域 |
| 消息中心 | NavBar + 卡片消息列表 |

### 教职工端 — 财务职工

| 页面 | 结构要点 |
|------|----------|
| 首页 | Banner（绿色主题）+ Float Card（今日实收 + 统计）+ 待办列表 + TabBar（带计数徽标） |
| 线下收款 | NavBar + Tab + 学生列表 + Bottom Sheet 确认 |
| 退费审批 | NavBar + Tab（待审核/处理中/已完结）+ 列表 + Bottom Sheet 审批 |
| 补差退款 | NavBar + 信息提示条 + 列表 + Bottom Sheet 确认 |
| 票据补打 | NavBar + 待处理/已处理分组 |
| 催缴任务 | NavBar（"新建"操作）+ 警告提示条 + 进行中任务（含进度条）+ 历史列表 |

### 教职工端 — 政务职工

| 页面 | 结构要点 |
|------|----------|
| 首页 | Banner（紫色主题）+ Float Card（全校统计 + 进度条）+ 待办列表 + TabBar |
| 换房审批 | NavBar + Tab + 列表 + 详情（Info Rows + 目标宿舍）+ 通过/拒绝 |
| 助学金审批 | NavBar + Tab（复审/终审/已完结）+ 列表 |
| 复审详情 | NavBar + 学生信息 + **Timeline 审批链** + 复审意见（金额输入 + 文本域） |
| 终审详情 | NavBar + 完整 Timeline + 终审决定（金额 + 发放方式下拉 + 意见） |
| 报到统计看板 | NavBar（"实时"标签）+ Float Card + 学院进度列表（语义色进度条）+ 关键环节完成率 |

### 通用

| 页面 | 结构要点 |
|------|----------|
| 绑定流程 | Hero 区 + 步骤卡片（手机号验证 → 工号绑定 → 成功页）+ Spinner + Toast |

---

## 附录 A：CSS 变量完整清单

```css
:root {
  /* 角色主题色 */
  --tc: #2B6CB0;   --tc-t: #DBEAFE;   --tc-d: #1E4D8C;
  --fc: #15803D;   --fc-t: #DCFCE7;   --fc-d: #166534;
  --ac: #7C3AED;   --ac-t: #EDE9FE;   --ac-d: #6D28D9;

  /* 品牌主题（动态切换） */
  --brand: var(--tc);  --brand-t: var(--tc-t);  --brand-d: var(--tc-d);

  /* 学生端主色（兼容） */
  --primary: #2B6CB0;
  --primary-pressed: #1E4D8C;
  --primary-tint: #DBEAFE;
  --primary-surface: #EFF6FF;
  --primary-dark: #1E3A5F;

  /* 语义色 */
  --success: #15803D;   --success-bg: #DCFCE7;   --success-border: #86EFAC;
  --warning: #D97706;   --warning-bg: #FEF3C7;   --warning-border: #FCD34D;
  --danger: #B91C1C;    --danger-bg: #FEE2E2;    --danger-border: #FCA5A5;
  --info: #0369A1;      --info-bg: #E0F2FE;      --info-border: #7DD3FC;
  --purple: #7C3AED;    --purple-bg: #EDE9FE;    --purple-border: #C4B5FD;

  /* 教职工端语义色别名 */
  --ok: #15803D;    --ok-bg: #DCFCE7;    --ok-bd: #86EFAC;
  --wa: #D97706;    --wa-bg: #FEF3C7;    --wa-bd: #FCD34D;
  --er: #B91C1C;    --er-bg: #FEE2E2;    --er-bd: #FCA5A5;
  --in: #0369A1;    --in-bg: #E0F2FE;    --in-bd: #7DD3FC;
  --pu: #7C3AED;    --pu-bg: #EDE9FE;    --pu-bd: #C4B5FD;

  /* 中性色 */
  --N900: #111827;
  --N700: #374151;
  --N500: #6B7280;
  --N400: #9CA3AF;
  --N200: #E5E7EB;
  --N50: #F2F3F5;
  --N25: #F8F9FB;
  --white: #FFFFFF;

  /* 阴影 */
  --card-shadow-high: 0 4px 16px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06);
  --card-shadow-low: 0 1px 3px rgba(0,0,0,.06);
}
```

## 附录 B：全局 Reset

```css
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body { height: 100%; overflow: hidden; }
button { font-family: inherit; cursor: pointer; border: none; outline: none; }
input, textarea, select { font-family: inherit; outline: none; }
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,.15); border-radius: 2px; }
input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
```

## 附录 C：版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v4.0 | 2026-05-22 | 初始版本，基于 student-miniapp-prototype.html 提取 |
| v5.0 | 2026-05-22 | 对齐 staff-miniapp-v1.html，新增角色主题系统、Toast、Bottom Sheet、Timeline、素材缩略图、Spinner、绑定流程等 12 个组件；统一 Badge 警告文字色；补充导航模型和屏幕切换规范 |

## 附录 D：v4.0 → v5.0 变更清单

| 类别 | 变更 |
|------|------|
| **新增** | `--brand` / `--brand-t` / `--brand-d` 角色主题 Token |
| **新增** | `--ok` / `--wa` / `--er` / `--in` / `--pu` 语义色别名（教职工端） |
| **新增** | 6.14 待办事项列表 |
| **新增** | 6.15 通用列表项 |
| **新增** | 6.16 信息行（Info Rows） |
| **新增** | 6.24 Toast 浮层提示 |
| **新增** | 6.25 Bottom Sheet |
| **新增** | 6.26 Timeline / 审批链 |
| **新增** | 6.27 素材缩略图网格 |
| **新增** | 6.28 复选框 & 单选框 |
| **新增** | 6.29 Loading Spinner |
| **新增** | 6.30 成功/结果页 |
| **新增** | 6.31 绑定/引导流程 |
| **新增** | 6.10 按钮行（brow）、金额输入（famt） |
| **新增** | 6.19 教职工端下划线式 Tab |
| **新增** | 6.3 TabBar 计数徽标 |
| **新增** | 7.4 屏幕切换模型 |
| **修正** | Badge 警告文字色统一为 `#92400E`（v4.0 用 `--warning`） |
| **修正** | 进度条背景 `--N200`（v4.0 用 `--N50`） |
| **修正** | TabBar 高度统一 56px ~ 60px（v4.0 56px） |
| **修正** | 提示条圆角统一 8px（v4.0 12px） |
| **扩展** | NavBar 增加品牌色背景变体 |
| **扩展** | 进度条支持语义色变体 |
| **扩展** | Tab 选择器增加下划线式 |
| **扩展** | 快捷入口网格增加分隔线模式 |
| **扩展** | 图标映射增加 Emoji / SVG 备选 |
