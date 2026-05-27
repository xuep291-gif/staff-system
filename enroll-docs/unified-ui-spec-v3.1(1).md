# 华东科技大学 · 迎新管理系统 — 统一移动端 UI 风格规范

> 合并学生端 v3.1(1) 与教职工端 v1.0 · 全端统一 Design Tokens
> 适用 UniApp 小程序 / H5 · 版本 v3.0 · 2026-05-22

---

## 一、审查摘要

### 1.1 审查来源

| 文档 | 端 | 版本 |
|------|-----|------|
| `移动端UI风格规范-v2.md` | 学生端 | v2.0 |
| `staff-miniapp-v1.html` | 教职工端（班主任/财务/政务） | v1.0 |
| `miniapp-design-spec.md` | 学生端设计规范 | v1.0 |

### 1.2 发现的关键差异

| 差异项 | 学生端 v2 | 教职工端 v1 | 统一方案 |
|--------|-----------|-------------|----------|
| CSS 变量名 | `--brand` / `--ok` 等 | `--tc` / `--fc` / `--ac` + `--brand` 别名 | **统一用 `--brand` 系列** |
| 角色主题切换 | 无 | `body.rf` / `body.ra` 动态切换 `--brand` | **保留，推广到学生端** |
| 主按钮高度 | 48px | 44px | **统一 44px**（触控最小尺寸） |
| 主按钮圆角 | 12px | 8px | **统一 8px**（与设计规范一致） |
| 支付按钮 | 52px + 渐变 + 发光阴影 | 无专用样式 | **保留，但渐变改纯色**（禁止渐变） |
| 导航栏高度 | 52px | 52px | **一致** |
| TabBar Tab 数 | 4 个 | 4-5 个（按角色） | **按角色配置** |
| 徽章圆角 | 20px | 20px | **一致** |
| BottomSheet | 20px 圆角 | 20px 圆角 | **一致** |
| AlertBar 类型 | 无 `.aok` | 有 `.aok`（成功提示） | **补全，四色齐全** |
| 步骤指示器 | 有 | 有 Timeline | **两者并存，场景不同** |
| 资料上传网格 | 3×2 网格 | 自适应网格 | **统一 3 列** |
| 绑定流程 | 3 步 | 3 步 | **一致** |

---

## 二、Design Tokens（唯一真相源）

### 2.1 CSS 变量

```css
:root {
  /* ═══ 品牌色（默认蓝色 = 学生端 / 班主任端） ═══ */
  --brand:   #2B6CB0;
  --brand-d: #1E4D8C;
  --brand-t: #DBEAFE;
  --brand-s: #EFF6FF;

  /* ═══ 语义色：文字 / 背景 / 边框 三件套 ═══ */
  --ok:      #15803D;  --ok-bg: #DCFCE7;  --ok-bd: #86EFAC;
  --wa:      #D97706;  --wa-bg: #FEF3C7;  --wa-bd: #FCD34D;
  --er:      #B91C1C;  --er-bg: #FEE2E2;  --er-bd: #FCA5A5;
  --in:      #0369A1;  --in-bg: #E0F2FE;  --in-bd: #7DD3FC;
  --pu:      #7C3AED;  --pu-bg: #EDE9FE;  --pu-bd: #C4B5FD;

  /* ═══ 中性灰 ═══ */
  --N900: #111827;  --N700: #374151;  --N500: #6B7280;
  --N400: #9CA3AF;  --N200: #E5E7EB;  --N50: #F2F3F5;
  --N25: #F8F9FB;   --white: #FFFFFF;

  /* ═══ 阴影 ═══ */
  --sh-lo: 0 1px 3px rgba(0,0,0,.06);
  --sh-md: 0 4px 12px rgba(0,0,0,.09);
  --sh-hi: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
  --sh-tab: 0 -2px 8px rgba(0,0,0,.06);

  /* ═══ 字体 ═══ */
  --font-stack: -apple-system, BlinkMacSystemFont, "PingFang SC",
                "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}
```

### 2.2 角色主题切换（教职工端核心特性）

财务职工和政务职工使用不同品牌色，通过 body class 切换：

```css
/* 财务职工 → 绿色品牌 */
body.rf {
  --brand:   var(--ok);
  --brand-d: #166534;
  --brand-t: var(--ok-bg);
  --brand-s: #DCFCE7;
}

/* 政务职工 → 紫色品牌 */
body.ra {
  --brand:   var(--pu);
  --brand-d: #6D28D9;
  --brand-t: var(--pu-bg);
  --brand-s: #EDE9FE;
}
```

> **设计意图**：所有组件（导航栏、按钮、标签等）统一使用 `--brand` 变量。角色切换时只改变 `--brand` 的值，无需修改任何组件样式。学生端始终使用默认蓝色 `--brand`。

### 2.3 SCSS 变量（UniApp 项目直接引用）

```scss
// _variables.scss
$brand:   #2B6CB0;  $brand-d: #1E4D8C;  $brand-t: #DBEAFE;  $brand-s: #EFF6FF;
$ok:      #15803D;  $ok-bg:   #DCFCE7;  $ok-bd:   #86EFAC;
$wa:      #D97706;  $wa-bg:   #FEF3C7;  $wa-bd:   #FCD34D;
$er:      #B91C1C;  $er-bg:   #FEE2E2;  $er-bd:   #FCA5A5;
$in:      #0369A1;  $in-bg:   #E0F2FE;  $in-bd:   #7DD3FC;
$pu:      #7C3AED;  $pu-bg:   #EDE9FE;  $pu-bd:   #C4B5FD;
$N900:    #111827;  $N700:    #374151;  $N500:    #6B7280;
$N400:    #9CA3AF;  $N200:    #E5E7EB;  $N50:     #F2F3F5;
$N25:     #F8F9FB;  $white:   #FFFFFF;
$sh-lo: 0 1px 3px rgba(0,0,0,.06);
$sh-md: 0 4px 12px rgba(0,0,0,.09);
$sh-hi: 0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06);
```

### 2.4 语义色使用矩阵

| 语义 | 文字 | 背景 | 边框 | 学生端场景 | 教职工端场景 |
|------|------|------|------|-----------|-------------|
| 品牌/主色 | `--brand` | `--brand-t` | — | 导航栏、主按钮、步骤当前态 | 导航栏、主按钮、Tab 选中 |
| 成功/完成 | `--ok` | `--ok-bg` | `--ok-bd` | 缴费成功、步骤完成、已入住 | 审核通过、收款确认、已发放 |
| 警告/进行中 | `--wa` | `--wa-bg` | `--wa-bd` | 待缴费、补差提醒、待审核 | 待初审、换房申请中、待确认 |
| 错误/逾期 | `--er` | `--er-bg` | `--er-bd` | 逾期催缴、支付失败、已作废 | 逾期标记、审批拒绝、退费待审 |
| 信息/提示 | `--in` | `--in-bg` | `--in-bd` | 提示条、审核进度、宿舍信息 | 提示条、审批进度、系统通知 |
| 紫色/选宿 | `--pu` | `--pu-bg` | `--pu-bd` | 选宿相关、楼栋选择 | 政务职工品牌色、换房审批 |
| 禁用/弱化 | `--N400` | `--N50` | `--N200` | 已占用床位、不可选项 | 已处理项、历史记录 |

---

## 三、字体排版

### 3.1 字体族

```css
font-family: var(--font-stack);
```

### 3.2 字号阶梯（统一）

| 字号 | 用途 | 适用端 |
|------|------|--------|
| 28px / 24px | 大额金额、首页应缴总额、实收金额 | 双端 |
| 22px | 统计数字、支付结果金额 | 学生端 |
| 20px | 页面大标题、结果页标题 | 双端 |
| 18px | Banner 姓名、卡片大标题 | 双端 |
| 16px | 导航栏标题 | 双端 |
| 15px | 卡片标题、按钮文字 | 双端 |
| 13px | 列表标题、正文、表单标签 | 双端 |
| 12px | 辅助说明、表单标签、Tab 切换 | 双端 |
| 11px | 描述文字、时间、角标、提示 | 双端 |
| 10px | TabBar 标签、Tag 小字 | 双端 |
| 9px | 步骤标签、角标数字 | 双端 |

### 3.3 字重

| 字重 | 用途 |
|------|------|
| **700** | 金额数字、大标题、步骤编号、Banner 姓名 |
| **600** | 卡片标题、按钮文字、列表主标题、Tag 文字、Tab 激活态 |
| **500** | 正文、表单标签、列表描述 |
| **400** | 辅助文字、时间戳（默认） |

> **规则：仅使用 400 / 500 / 600 / 700 四档。禁止 300（过细）和 800/900（过重）。**

### 3.4 数字专用

```css
.f-num { font-weight: 700; font-variant-numeric: tabular-nums; }
```

所有金额、统计数字统一使用等宽数字。

---

## 四、页面布局

### 4.1 手机框架（原型展示用）

```
┌─ Shell (flex col, centered, gap:10px) ────────────┐
│  ┌─ Phone (375×780, radius:40px) ─────────────┐   │
│  │  Status Bar (44px, brand bg)                │   │
│  │  ┌─ Screens ───────────────────────────────┐│   │
│  │  │  NavBar (52px) / Banner + FloatCard     ││   │
│  │  │  Body (flex:1, overflow-y:auto, N50 bg) ││   │
│  │  │  TabBar (60px + safe-area)              ││   │
│  │  └─────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┘
```

### 4.2 导航栏 NavBar（统一 52px）

```css
.nbar {
  height: 52px; background: var(--brand);
  display: flex; align-items: center;
  padding: 0 16px; gap: 8px; flex-shrink: 0;
}
.nbar.wh {
  background: var(--white);
  border-bottom: 1px solid var(--N200);
}
```

| 元素 | 品牌栏（首页类） | 白色栏（子页类） |
|------|-----------------|-----------------|
| 背景 | `--brand` | `--white` + 底边线 |
| 返回按钮 | 白色 SVG 20×20 | `--N700` SVG 20×20 |
| 标题 | 白色 16px / 600 / 居中 | `--N900` 16px / 600 / 居中 |
| 右侧操作 | 白色 13px / 右对齐 | `--brand` 13px / 右对齐 |

### 4.3 品牌横幅 Banner

```css
.banner {
  background: var(--brand);
  padding: 16px 18px 44px;  /* 底部多余 padding 供浮动卡片覆盖 */
  display: flex; align-items: center; gap: 12px;
}
```

- **头像**：48px 圆形，`rgba(255,255,255,.2)` 背景 + 白色文字/emoji
- **姓名**：18px / 700 / 白色
- **副标题**：11px / `rgba(255,255,255,.7)`
- **铃铛按钮**：36px 圆形，`rgba(255,255,255,.15)` 背景，红点角标 8px

> **规则：Banner 背景为品牌实色，禁止使用渐变。**

### 4.4 浮动卡片 FloatCard（首页核心）

```css
.fc {
  background: var(--white); border-radius: 14px;
  box-shadow: var(--sh-hi);
  margin: -28px 14px 0; padding: 16px;
  position: relative; z-index: 2;
}
```

负 margin 使其视觉上叠压 Banner 底部，形成层次感。

**内容布局**：
- 统计行 `.fstats`：flex 等分，竖线分隔
- 数字 `.fnum`：22px / 700 / `--brand`（警告 `--wa`，错误 `--er`，灰色 `--N500`）
- 标签 `.flbl`：10px / `--N400`
- 进度条 `.prog-wrap`：6px 高度，`--N200` 轨道 + `--brand` 填充

### 4.5 底部标签栏 TabBar（统一 60px）

```css
.tabbar {
  height: 60px; background: var(--white);
  border-top: 1px solid var(--N200);
  display: flex; align-items: stretch; flex-shrink: 0;
  box-shadow: var(--sh-tab);
  padding-bottom: env(safe-area-inset-bottom);
}
```

| 属性 | 值 |
|------|-----|
| 图标 | SVG 22×22, `stroke: var(--N400)`, stroke-width: 1.8 |
| 图标容器（激活） | `background: var(--brand-t); border-radius: 8px` |
| 图标（激活） | `stroke: var(--brand)` |
| 标签文字 | 10px / 500, 默认 `--N400`, 激活 `--brand` / 600 |
| 角标 | 红色 `--er`, 9px / 600 / 白色, 圆角 10px, 绝对定位右上 |

**学生端 Tab**：首页 / 账单 / 宿舍 / 我的（4 个）

**教职工端 Tab（按角色）**：
- 班主任：首页 / 缴费 / 资料 / 助学金 / 报到（5 个）
- 财务职工：首页 / 收款 / 退费 / 催缴 / 消息（5 个）
- 政务职工：首页 / 宿舍 / 助学金 / 报到 / 消息（5 个）

---

## 五、统一样式规范

> 以下所有规范为双端共用。标记 🟢 表示双端一致，🔵 表示仅学生端，🟣 表示仅教职工端。

### 5.1 卡片 Card 🟢

```css
.card {
  background: var(--white); border-radius: 14px;
  border: 1px solid rgba(0,0,0,.07);
  box-shadow: var(--sh-lo); overflow: hidden;
}
```

| 变体 | 附加类 | 样式 | 场景 |
|------|--------|------|------|
| 默认 | — | 白底 + 微阴影 | 通用内容 |
| 紧急/逾期 | `.urgent` | `border-color: var(--er-bd)` + 红色外发光 | 催缴卡片 |
| 信息提示 | `.info-c` | `border-color: var(--in-bd)` | 通知卡片 |
| 成功确认 | `.ok-c` | `border-color: var(--ok-bd)` | 选宿确认 |

**卡片结构**：
```
┌──────────────────────────────────┐
│ Card Header (.ch)                │  ← 标题 15px/600 + 右侧链接 12px
│  padding: 12px 14px              │
│  border-bottom: 1px solid N50    │
├──────────────────────────────────┤
│ Card Body (.cb)                  │  ← padding: 12px 14px
│                                  │
└──────────────────────────────────┘
```

> **与 v2 差异**：`border-radius` 从 v2 的 12px 统一为 14px，与教职工端和设计规范一致。

### 5.2 按钮 Button 🟢

```css
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  height: 44px; border-radius: 8px;
  font-size: 14px; font-weight: 600;
  border: none; cursor: pointer;
  transition: all .15s;
}
.btn:active { filter: brightness(.95); transform: scale(.97); }
```

| Class | 高度 | 圆角 | 字号 | 背景 | 文字色 | 边框 |
|-------|------|------|------|------|--------|------|
| `.btn-brand` | 44px | 8px | 14px/600 | `--brand` | `#fff` | — |
| `.btn-outline` | 44px | 8px | 14px/600 | transparent | `--brand` | 1.5px `--brand` |
| `.btn-danger` | 44px | 8px | 14px/600 | `--er-bg` | `--er` | 1px `--er-bd` |
| `.btn-warning` | 44px | 8px | 13px/600 | `--wa-bg` | `#92400E` | 1px `--wa-bd` |
| `.btn-disabled` | 44px | 8px | 14px/600 | `--N50` | `--N400` | — |
| `.btn-block` | 44px | 8px | 14px/600 | 继承 | 继承 | `width:100%` |
| `.btn-sm` | 32px | 20px | 12px/600 | 继承 | 继承 | `胶囊形` |

> **与 v2 差异**：高度从 48px→44px（触控最小尺寸），圆角从 12px→8px（与 miniapp-design-spec 一致）。

**并排布局**：
```css
.btn-row { display: flex; gap: 8px; }
.btn-row .btn-brand, .btn-row .btn-outline, .btn-row .btn-danger { flex: 1; }
```

### 5.3 支付按钮 PayBtn 🔵

```css
.pay-btn {
  width: 100%; height: 44px;
  background: var(--brand);  /* 纯色，禁止渐变 */
  color: #fff; border-radius: 8px;
  font-size: 14px; font-weight: 600;
  box-shadow: 0 4px 12px rgba(43,108,176,.3);
}
```

> **与 v2 差异**：高度从 52px→44px（统一），圆角从 14px→8px（统一），`linear-gradient`→纯色（符合设计规范禁止渐变的要求）。

### 5.4 徽章 Badge 🟢

```css
.b {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 8px; border-radius: 20px;
  font-size: 11px; font-weight: 600;
  border: 1px solid; white-space: nowrap;
}
```

| Class | 文字 | 背景 | 边框 | 双端通用场景 |
|-------|------|------|------|-------------|
| `.bok` | `--ok` | `--ok-bg` | `--ok-bd` | 已缴/已完成/审核通过 |
| `.bwa` | `#92400E` | `--wa-bg` | `--wa-bd` | 待审核/待处理/进行中 |
| `.ber` | `--er` | `--er-bg` | `--er-bd` | 逾期/未缴/已拒绝 |
| `.bin` | `--in` | `--in-bg` | `--in-bd` | 审批中/处理中 |
| `.bpu` | `--pu` | `--pu-bg` | `--pu-bd` | 选宿相关/换房 |
| `.bgy` | `--N500` | `--N50` | `--N200` | 未开始/禁用/已作废 |

### 5.5 列表项 ListItem 🟢

```css
.li {
  padding: 12px 14px; display: flex; align-items: flex-start; gap: 8px;
  cursor: pointer; border-bottom: 1px solid var(--N50);
  transition: background .15s;
}
.li:active { background: var(--N50); }
.li:last-child { border-bottom: none; }
```

**结构**：
```
┌──────────────────────────────────────────┐
│ [图标]  标题 (13px/600)   金额 (14px/600)│
│  40×40  描述 (11px/N500)   标签 + 箭头   │
│  圆角8                                   │
└──────────────────────────────────────────┘
```

- **左侧图标 `.lav`**：40×40 圆角方形（8px），语义色背景 + emoji
- **中间 `.linf`**：flex:1，标题 + 描述
- **右侧 `.lm`**：右对齐区域，金额 + 标签
- **箭头 `.larr`**：SVG 14×14，stroke: `--N400`

### 5.6 信息行 InfoRow 🟢

```css
.ir {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 8px 0; border-bottom: 1px solid var(--N50);
}
.ir:last-child { border-bottom: none; }
.ik { font-size: 13px; color: var(--N500); flex-shrink: 0; }
.iv { font-size: 13px; color: var(--N900); font-weight: 500; text-align: right; max-width: 200px; }
```

### 5.7 标签切换 Tabs 🟢

```css
.tbar {
  display: flex; background: var(--white);
  border-bottom: 1px solid var(--N200);
  flex-shrink: 0; overflow-x: auto;
}
.tbar::-webkit-scrollbar { display: none; }
.tab {
  flex: 1; min-width: 60px; padding: 8px 4px; text-align: center;
  font-size: 12px; color: var(--N400); cursor: pointer;
  border-bottom: 2px solid transparent; font-weight: 500;
  transition: all .2s; white-space: nowrap;
}
.tab.on {
  color: var(--brand); border-bottom-color: var(--brand); font-weight: 600;
}
.tp { display: none; }
.tp.on { display: block; }
```

### 5.8 底部弹出 BottomSheet 🟢

```css
.ovl {
  position: fixed; inset: 0; background: rgba(0,0,0,0);
  z-index: 300; pointer-events: none;
  transition: background .25s;
}
.ovl.on { background: rgba(0,0,0,.45); pointer-events: all; }
.sheet {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: var(--white); border-radius: 20px 20px 0 0;
  padding: 0 0 36px; transform: translateY(100%);
  transition: transform .28s cubic-bezier(.32,.72,0,1);
  max-height: 88vh; overflow-y: auto;
}
.ovl.on .sheet { transform: translateY(0); }
.shandle { width: 36px; height: 4px; background: var(--N200); border-radius: 2px; margin: 8px auto 0; }
.stitle {
  font-size: 16px; font-weight: 600; color: var(--N900);
  padding: 14px 16px 12px; border-bottom: 1px solid var(--N50);
}
.sbody2 { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
```

> **与 v2 差异**：`.shandle` margin 从 10px→8px；`max-height` 从 86vh→88vh（避免过度截断）。

### 5.9 提示条 AlertBar 🟢

```css
.abar {
  padding: 8px 12px; border-radius: 8px; display: flex;
  gap: 8px; align-items: flex-start;
  font-size: 12px; line-height: 1.5;
}
```

| Class | 背景 | 文字 | 边框 | 用途 |
|-------|------|------|------|------|
| `.awa` | `--wa-bg` | `#92400E` | `--wa-bd` | 警告提示 |
| `.ain` | `--in-bg` | `--in` | `--in-bd` | 信息提示 |
| `.aer` | `--er-bg` | `--er` | `--er-bd` | 错误/催缴 |
| `.aok` 🆕 | `--ok-bg` | `--ok` | `--ok-bd` | 成功提示 |

> **优化**：补充了 `.aok`（成功提示），v2 中缺失此变体。padding 和 border-radius 统一为 8px。

### 5.10 空状态 Empty 🟢

```css
.empty { padding: 40px 20px; text-align: center; }
.empty-ico { font-size: 40px; opacity: .4; }
.empty-t { font-size: 14px; font-weight: 600; color: var(--N500); margin-top: 8px; }
.empty-s { font-size: 12px; color: var(--N400); margin-top: 4px; }
```

### 5.11 全局 Toast 🟢

```css
#gtoast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,.78); color: #fff;
  padding: 8px 18px; border-radius: 20px;
  font-size: 13px; z-index: 9999;
  pointer-events: none; white-space: nowrap;
}
```

### 5.12 分割区域 Divider 🟣

```css
.divider { height: 8px; background: var(--N50); margin: 0 -14px; }
```

8px 灰色带，卡片内区分内容区块。

### 5.13 表单输入 🟢

```css
.finput {
  width: 100%; height: 44px; padding: 0 12px;
  border: 1.5px solid var(--N200); border-radius: 12px;
  font-size: 13px; color: var(--N900); background: var(--white);
}
.finput:focus { border-color: var(--brand); }
.fta {
  width: 100%; padding: 8px 12px;
  border: 1.5px solid var(--N200); border-radius: 12px;
  font-size: 13px; color: var(--N900); background: var(--white);
  resize: none; min-height: 72px;
}
.fta:focus { border-color: var(--brand); }
.flabel { font-size: 12px; font-weight: 600; color: var(--N700); margin-bottom: 4px; }
.fhint { font-size: 11px; color: var(--N400); }
.frow { display: flex; flex-direction: column; gap: 4px; }
.frows { display: flex; flex-direction: column; gap: 12px; }
```

金额输入特殊样式：
```css
.famt { display: flex; align-items: center; gap: 8px; }
.famt-pre { font-size: 16px; font-weight: 600; color: var(--N500); }
.famt-in { flex: 1; height: 44px; padding: 0 12px;
  border: 1.5px solid var(--N200); border-radius: 12px;
  font-size: 20px; font-weight: 700; color: var(--brand); }
```

---

## 六、业务组件规范

### 6.1 统计行 StatsRow 🔵🟣

```css
.fstats { display: flex; }
.fst {
  flex: 1; text-align: center; padding: 4px 0;
  border-right: 1px solid var(--N200);
}
.fst:last-child { border-right: none; }
.fnum { font-size: 22px; font-weight: 700; color: var(--brand); line-height: 1.2; }
.fnum.w { color: var(--wa); }
.fnum.e { color: var(--er); }
.fnum.g { color: var(--N500); }
.flbl { font-size: 10px; color: var(--N400); margin-top: 2px; letter-spacing: .3px; }
```

### 6.2 进度条 Progress 🟢

```css
.prog-wrap { margin-top: 12px; }
.prog-lbl { display: flex; justify-content: space-between; font-size: 11px; color: var(--N500); margin-bottom: 4px; }
.prog-track { height: 6px; background: var(--N200); border-radius: 3px; overflow: hidden; }
.prog-fill { height: 100%; border-radius: 3px; background: var(--brand); transition: width .5s; }
```

### 6.3 步骤指示器 Steps 🔵

适用于学生端报到流程。

```css
.steps { display: flex; align-items: center; padding: 12px 14px; }
.step-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
}
.step-line { flex: 1; height: 2px; background: var(--N200); margin: 0 4px; }
```

| 状态 | Dot 样式 | Line 样式 |
|------|----------|-----------|
| 完成 `.done` | `bg:--ok color:#fff` ✓ | `bg:--ok` |
| 当前 `.cur` | `bg:--brand color:#fff`, 外发光 `0 0 0 3px var(--brand-t)` | 默认灰 |
| 待完成 `.todo` | `bg:--N200 color:--N400` | 默认灰 |
| 异常 `.err` | `bg:--er color:#fff` ! | 默认灰 |

### 6.4 时间线 Timeline 🟣

适用于教职工端审批流程。

```css
.tl { padding: 4px 0; }
.tli { display: flex; gap: 8px; margin-bottom: 16px; }
.tli:last-child { margin-bottom: 0; }
.tll { display: flex; flex-direction: column; align-items: center; width: 24px; }
.tldot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--brand); background: var(--brand); flex-shrink: 0; }
.tldot.p { background: #fff; border-color: var(--N200); }
.tldot.ok { background: var(--ok); border-color: var(--ok); }
.tldot.cur { background: var(--brand); border-color: var(--brand); }
.tlline { width: 1px; flex: 1; background: var(--N200); margin-top: 3px; min-height: 20px; }
.tlc { flex: 1; }
.tlstep { font-size: 12px; font-weight: 600; color: var(--N900); }
.tlwho { font-size: 11px; color: var(--N500); margin-top: 1px; }
.tltime { font-size: 10px; color: var(--N400); margin-top: 1px; }
```

### 6.5 报到清单 Checklist 🔵

```css
.check-item { display: flex; align-items: center; gap: 8px; padding: 8px 14px; border-bottom: 1px solid var(--N50); }
.check-ico {
  width: 20px; height: 20px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; flex-shrink: 0;
}
```

| 状态 | 类名 | 图标样式 | 说明 |
|------|------|----------|------|
| 已完成 | `.done` | `bg:--ok color:#fff` ✓ | 步骤已完成 |
| 进行中 | `.cur` | `bg:--brand color:#fff` ⋯ | 当前步骤 |
| 待完成 | `.todo` | `bg:--N200 color:--N400` 编号 | 尚未开始 |
| 异常 | `.err` | `bg:--er color:#fff` ! | 逾期/阻塞 |

### 6.6 资料上传网格 🔵

```css
.upload-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.upload-item {
  aspect-ratio: 1; border-radius: 8px;
  border: 1.5px dashed var(--N200);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; background: var(--N25); position: relative; overflow: hidden;
}
.upload-item:active { background: var(--brand-s); border-color: var(--brand); }
.upload-item.done { border-style: solid; border-color: var(--ok-bd); background: var(--ok-bg); }
```

- 未上传：虚线框 + 图标(24px) + 标签(10px)
- 已上传：实线绿框 + 绿色背景 + 右上角 ✓ 圆标(14px)

### 6.7 材料缩略图（审核用）🟣

```css
.mgrid { display: flex; flex-wrap: wrap; gap: 8px; }
.mth {
  width: 72px; height: 72px; border-radius: 8px;
  background: var(--N50); border: 1px solid var(--N200);
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; cursor: pointer; position: relative;
}
.mth-ico { font-size: 22px; }
.mth-lbl { font-size: 9px; color: var(--N500); margin-top: 2px; text-align: center; }
.mth-ok { position: absolute; bottom: 3px; right: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--ok); display: flex; align-items: center; justify-content: center; }
.mth-ok::after { content: '✓'; color: #fff; font-size: 8px; font-weight: 700; }
```

### 6.8 床位选择 🔵

**楼栋按钮**：
```css
.bld-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--N200);
  font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.bld-btn.on { background: var(--brand); color: #fff; border-color: var(--brand); }
```

**床位网格**：
```css
.bed-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.bed-card { padding: 16px 8px; border: 2px solid var(--N200); border-radius: 8px; text-align: center; cursor: pointer; }
```

| 状态 | 边框 | 背景 | 文字 |
|------|------|------|------|
| 可选 | `--N200` | `--white` | `--N900` + 绿 tag |
| 已选 `.selected` | `--brand` | `--brand-t` | `--brand` + 蓝 tag |
| 已占用 `.occupied` | `--N200` | `--N50` | `--N400`（不可点击, opacity:.6） |

### 6.9 支付方式选择 🔵

```css
.pay-methods { display: flex; gap: 8px; }
.pm {
  flex: 1; padding: 12px 8px; border-radius: 8px;
  border: 2px solid var(--N200); text-align: center; cursor: pointer;
}
.pm.on { border-color: var(--brand); background: var(--brand-t); }
```

### 6.10 倒计时 Countdown 🔵

```css
.countdown { display: flex; gap: 4px; align-items: center; }
.cd-box { background: var(--brand); color: #fff; border-radius: 4px;
  padding: 2px 6px; font-size: 13px; font-weight: 700;
  font-variant-numeric: tabular-nums; min-width: 24px; text-align: center; }
.cd-sep { font-size: 13px; font-weight: 700; color: var(--brand); }
```

### 6.11 结果页 Result 🟢

```css
.result-wrap {
  display: flex; flex-direction: column; align-items: center;
  padding: 48px 20px 24px; gap: 12px;
}
.result-ico {
  width: 72px; height: 72px; border-radius: 50%; font-size: 32px;
  display: flex; align-items: center; justify-content: center;
}
.result-ico.ok { background: var(--ok-bg); }
.result-ico.wa { background: var(--wa-bg); }
.result-ico.er { background: var(--er-bg); }
.result-title { font-size: 20px; font-weight: 700; color: var(--N900); }
.result-sub { font-size: 13px; color: var(--N500); text-align: center; line-height: 1.6; }
```

### 6.12 账单项目 BillItem 🔵

```css
.bill-item { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-bottom: 1px solid var(--N50); }
.bill-name { font-size: 13px; color: var(--N900); font-weight: 500; }
.bill-sub { font-size: 11px; color: var(--N500); margin-top: 1px; }
.bill-amt { font-size: 14px; font-weight: 600; color: var(--er); }
.bill-amt.ok { color: var(--ok); }
.bill-amt.gy { color: var(--N400); text-decoration: line-through; }
```

### 6.13 待办项 TodoItem 🟣

```css
.ti {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  cursor: pointer; border-bottom: 1px solid var(--N50);
  transition: background .15s;
}
.ti:last-child { border-bottom: none; }
.ti:active { background: var(--N50); }
.tico {
  width: 36px; height: 36px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
```

---

## 七、角色切换器（教职工端）🟣

```css
.rsw {
  display: flex; gap: 6px; background: var(--white); padding: 5px 7px;
  border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,.14);
  position: sticky; top: 8px; z-index: 200; flex-shrink: 0;
}
.rbtn {
  padding: 6px 13px; border-radius: 14px; font-size: 12px; font-weight: 600;
  cursor: pointer; border: none; color: var(--N400);
  background: transparent; transition: all .2s;
}
.rbtn.at { background: var(--brand-t); color: #2B6CB0; }    /* 班主任激活 */
.rbtn.af { background: var(--ok-bg); color: var(--ok); }     /* 财务激活 */
.rbtn.aa { background: var(--pu-bg); color: var(--pu); }     /* 政务激活 */
```

---

## 八、绑定流程（首次使用）🟣

三步骤：验证手机号 → 绑定工号/学号 → 绑定成功。

```css
.bind-wrap { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
.bind-hero { background: var(--brand); padding: 32px 24px 52px; flex-shrink: 0; }
.bind-body { flex: 1; background: var(--N50); border-radius: 20px 20px 0 0;
  margin-top: -20px; padding: 24px 16px; display: flex; flex-direction: column; gap: 16px; }
.bind-role-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px;
  border-radius: 20px; font-size: 12px; font-weight: 600;
  background: rgba(255,255,255,.25); color: #fff; border: 1px solid rgba(255,255,255,.3); }
.bind-logo { width: 60px; height: 60px; border-radius: 16px;
  background: rgba(255,255,255,.2); display: flex; align-items: center;
  justify-content: center; font-size: 28px; margin-bottom: 14px; }
.bind-hero-title { font-size: 20px; font-weight: 700; color: #fff; }
.bind-hero-sub { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 4px; }
```

---

## 九、间距与圆角

### 9.1 间距（统一 4px 基准）

| 值 | 用途 |
|-----|------|
| 4px | 紧密元素 gap、表单内间距、倒计时数字间距 |
| 8px | 网格 gap、按钮并排 gap、图标与文字间距、列表项 gap |
| 12px | 卡片 padding、header gap、表单字段组 gap |
| 16px | 导航栏/Banner padding、页面水平 margin |
| 20px | 结果页 padding |
| 24px | 区块间距、大标题下方 |

> **规则：所有间距为 4 的倍数。禁止使用 5/6/7/9/10/11/13/14/15px 作为间距值。**

### 9.2 圆角（统一）

| 元素 | 圆角 |
|------|------|
| 手机框 | 40px |
| 弹窗 Sheet | 20px 20px 0 0 |
| 徽章/Badge | 20px |
| Toast | 20px |
| 楼栋筛选/胶囊按钮 | 20px |
| 卡片/Card | 14px |
| Tab icon 容器 | 8px |
| 表单输入框 | 12px |
| 按钮 btn | 8px |
| 床位卡片/上传项 | 8px |
| 支付方式卡片 | 8px |
| 提示条 AlertBar | 8px |
| 列表图标 | 8px |
| 头像 | 50% |
| 进度条 | 3px |
| 倒计时数字 | 4px |

---

## 十、阴影层级

| 层级 | 变量 | 值 | 用途 |
|------|------|-----|------|
| 低 | `--sh-lo` | `0 1px 3px rgba(0,0,0,.06)` | 普通卡片 |
| 中 | `--sh-md` | `0 4px 12px rgba(0,0,0,.09)` | 浮层/下拉 |
| 高 | `--sh-hi` | `0 8px 24px rgba(0,0,0,.12), 0 2px 6px rgba(0,0,0,.06)` | 浮动卡片 .fc |
| TabBar | — | `0 -2px 8px rgba(0,0,0,.06)` | 底部标签栏 |
| 外发光（选中） | — | `0 0 0 3px var(--brand-t)` | 步骤当前点 |
| 外发光（床位） | — | `0 0 0 2px var(--brand-t)` | 床位选中 |

---

## 十一、交互动效

| 交互 | 实现 |
|------|------|
| 页面切换 | `opacity: 0→1, transition: .18s` |
| 列表按下 | `background: var(--N50), transition: .15s` |
| 按钮按下 | `filter: brightness(.95); transform: scale(.97);` |
| Sheet 弹出 | `translateY(100%)→0, cubic-bezier(.32,.72,0,1), .28s` |
| 遮罩渐变 | `background: transparent→rgba(0,0,0,.45), .25s` |
| 进度条 | `transition: width .5s` |
| Tab 切换 | `transition: all .2s` |
| 加载旋转 | `animation: spin .7s linear infinite` |
| 角色色切换 | `transition: background .3s` |

---

## 十二、设计规则

1. **色彩即语义** — 蓝=品牌/主操作，绿=成功，橙=警告，红=危险，紫=选宿/政务
2. **禁止渐变** — Banner、按钮、卡片背景均为实色，禁止 `linear-gradient`
3. **4px 基准网格** — 所有间距为 4 的倍数
4. **触控最小 44px** — 按钮/可点击元素高度 ≥ 44px
5. **字重四档** — 仅用 400/500/600/700
6. **品牌色通过变量** — 所有组件引用 `--brand`，角色切换只改变量值
7. **阴影三层** — lo（卡片）/ md（浮层）/ hi（浮动卡片）
8. **弹窗底部弹出** — 使用 BottomSheet 模式，带拖拽手柄
9. **状态可见** — 每个状态有完整的文字/背景/边框三件套
10. **空状态必现** — 无数据时显示空状态引导，不展示空白页

---

## 附录 A：完整页面清单（双端）

### 学生端（23 页）

| 序号 | 页面 | 核心组件 |
|------|------|----------|
| 1 | 绑定学号（3步） | Banner + 表单 + 自动匹配卡片 + 结果 |
| 2 | 首页 | Banner + FloatCard + Steps + 四列功能网格 + 消息列表 |
| 3 | 我的账单 | 金额汇总 + FloatCard + BillItem + 支付方式 + PayBtn |
| 4 | 确认缴费 | 金额展示 + InfoRow + 提示条 + 双按钮 |
| 5 | 支付结果 | ResultWrap + InfoRow + 双按钮 |
| 6 | 资料提交 | 上传网格 + 健康申报表单 + 审核状态 |
| 7 | 审核状态 | 结果卡片 + Checklist 审核进度 |
| 8 | 宿舍选择 | 倒计时 + 楼栋筛选 + 床位网格 + 底部确认栏 |
| 9 | 确认选宿 | InfoRow + 提示条 + 双按钮 |
| 10 | 选宿成功 | ResultWrap + InfoRow + 双按钮 |
| 11 | 我的宿舍 | 成功卡片 + 室友列表 + 换房按钮 |
| 12 | 申请换房 | 当前宿舍卡片 + 表单 + 提示条 |
| 13 | 换房已提交 | ResultWrap(wa) + InfoRow |
| 14 | 补差订单 | 提示条 + 紧急卡片 + PayBtn |
| 15 | 助学金申请 | 类型列表(3种) + 流程提示 |
| 16 | 填写申请 | 表单 + 上传网格 |
| 17 | 申请已提交 | ResultWrap + InfoRow + Timeline 审批进度 |
| 18 | 退费申请 | Tab切换 + 订单卡片 |
| 19 | 我的票据 | 动态票据列表 + 空状态 + 预览弹窗 |
| 20 | 预缴余额 | Banner + FloatCard + 充值记录 |
| 21 | 报到清单 | 进度 Banner + FloatCard + Checklist(6步) |
| 22 | 消息通知 | Card 列表（4条，颜色标记） |
| 23 | 个人中心 | Banner + StatsRow + 功能列表 + 联系信息 |

### 教职工端（14+ 页，按角色）

| 角色 | 页面 | 核心组件 |
|------|------|----------|
| 通用 | 绑定工号（3步） | BindFlow + 自动匹配 |
| 班主任 | 首页 | Banner + FloatCard + 待办列表 + 快捷宫格 |
| 班主任 | 缴费管理 | 统计行 + 逾期列表 + 一键催缴 |
| 班主任 | 学生账单详情 | InfoRow + 催缴按钮 |
| 班主任 | 资料审核 | Tabs + 材料缩略图 + 审核清单 |
| 班主任 | 资料审核结果 | ResultWrap + InfoRow |
| 班主任 | 助学金审核 | Tabs + 申请列表 + 表单 |
| 班主任 | 宿舍查看（只读） | 统计 + 宿舍列表 |
| 班主任 | 报到统计 | FloatCard + 步骤统计 + 未报到列表 |
| 班主任 | 消息中心 | Card 列表 |
| 财务 | 首页 | Banner + 今日实收 + 待办列表 |
| 财务 | 线下收款确认 | Tabs + 收款列表 + 确认 Sheet |
| 财务 | 退费审批 | Tabs + 审批列表 + 审核 Sheet |
| 财务 | 宿舍补差退款 | 提示条 + 退款列表 |
| 财务 | 票据补打 | 申请列表 + 处理 Sheet |
| 财务 | 催缴任务 | 任务列表 + 新建 Sheet |
| 财务 | 消息中心 | Card 列表 |
| 政务 | 首页 | Banner + 全校进度 + 待办列表 |
| 政务 | 换房审批 | Tabs + 申请列表 + 详情 + Timeline |
| 政务 | 换房结果 | ResultWrap + InfoRow |
| 政务 | 助学金审批 | Tabs + Timeline 审批链 + 表单 |
| 政务 | 助学金终审 | 完整 Timeline + 金额 + 发放方式 |
| 政务 | 报到统计看板 | FloatCard + 学院进度条 + 关键环节 |
| 政务 | 消息中心 | Card 列表 |

## 附录 B：弹窗清单（双端）

| 弹窗 | 端 | 类型 | 关键元素 |
|------|-----|------|----------|
| 确认支付 | 学生 | BottomSheet | 金额 + 支付方式 + 倒计时 |
| 退费提交成功 | 学生 | BottomSheet | ✅ + 提示 + 双按钮 |
| 确认选宿 | 学生 | BottomSheet | 房间信息 + 警告 + 双按钮 |
| 申请换房 | 学生 | BottomSheet | textarea + 双按钮 |
| 票据预览 | 学生 | 居中弹窗 | 电子票据 + 二维码 + 校验码 |
| 一键催缴确认 | 班主任 | BottomSheet | 限流警告 + 学生列表 |
| 发送催缴通知 | 班主任 | BottomSheet | 对象 + 金额 + 发送按钮 |
| 退回资料 | 班主任 | BottomSheet | 原因单选 + 补充说明 + 确认 |
| 拒绝助学金 | 班主任 | BottomSheet | 警告 + 拒绝原因 + 确认 |
| 确认收款 | 财务 | BottomSheet | 学生信息 + 金额 + 方式 |
| 退费审核 | 财务 | BottomSheet | 退费信息 + 备注 + 双按钮 |
| 补差退款 | 财务 | BottomSheet | 原/新宿舍 + 差额 + 确认 |
| 补打处理 | 财务 | BottomSheet | 票据信息 + 确认按钮 |
| 新建催缴 | 财务 | BottomSheet | 对象/项目下拉框 + 警告 |
| 拒绝换房 | 政务 | BottomSheet | 原因单选 + 补充说明 |
| 驳回申请 | 政务 | BottomSheet | 警告 + 驳回原因 + 确认 |

---

> **版本历史**：
> - v1.0 (2026-05-22)：基于学生端 v3.1 提炼
> - v2.0 (2026-05-22)：与教职工端统一 Design Tokens，增加绑定流程/报到清单
> - **v3.0 (2026-05-22)**：合并学生端 v2.0 + 教职工端 v1.0，统一所有差异项，补充角色主题系统，禁止渐变，统一按钮/圆角/间距。
