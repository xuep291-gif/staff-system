# H5与小程序兼容性修正任务清单

## 一、任务总览

基于《H5与小程序环境兼容性分析报告》，本任务清单列出了所有需要修复和优化的事项，按优先级组织。

**统计信息**：
- 总任务数：14
- 高优先级：3
- 中优先级：8
- 低优先级：3

---

## 二、高优先级任务

### 任务1：修复Base64编码兼容性问题

| 属性 | 值 |
|------|-----|
| 任务ID | HIGH-001 |
| 优先级 | 高 |
| 严重程度 | 高危 |
| 状态 | 待处理 |

**问题描述**：`common/api.js`第406行使用`btoa()`进行Base64编码，该函数在微信小程序环境中不可用。

**涉及文件**：`/Users/ehuhaim/workspace/saas/house-app-v3/test-project/common/api.js`

**具体位置**：第348-417行 `getBanner` 函数

**问题代码**：
```javascript
const groupName = btoa(groupNameRaw)
```

**修复方案**：
```javascript
// 添加平台条件编译
// #ifdef H5
const groupName = btoa(groupNameRaw)
// #endif
// #ifndef H5
const groupName = uni.base64Encode(groupNameRaw)
// #endif
```

**验收标准**：
- [ ] H5环境编译通过，轮播图显示正常
- [ ] 小程序环境编译通过，轮播图显示正常
- [ ] 两个环境的轮播图数据一致

**检查项**：
- [ ] 是否使用了正确的条件编译指令
- [ ] 是否处理了编码异常情况
- [ ] 是否添加了适当的日志输出

---

### 任务2：修复客服按钮组件兼容性

| 属性 | 值 |
|------|-----|
| 任务ID | HIGH-002 |
| 优先级 | 高 |
| 严重程度 | 高危 |
| 状态 | 待处理 |

**问题描述**：`ContactCustomerBtn.vue`组件使用微信小程序特有的`open-type="contact"`属性，在H5环境中会显示但无法使用。

**涉及文件**：
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/components/ContactCustomerBtn.vue`

**问题代码**：
```vue
<button open-type="contact" class="serviceButton" @click="handleContact">
  <image :src="consultingServiceIcon" class="serviceIcon"></image>
  <text>点击联系客服</text>
</button>
```

**修复方案**：
```vue
<!-- #ifdef MP-WEIXIN -->
<button open-type="contact" class="serviceButton" @click="handleContact">
  <image :src="consultingServiceIcon" class="serviceIcon"></image>
  <text>点击联系客服</text>
</button>
<!-- #endif -->

<!-- #ifndef MP-WEIXIN -->
<view class="serviceButton-placeholder">
  <image :src="consultingServiceIcon" class="serviceIcon"></image>
  <text>客服功能</text>
</view>
<!-- #endif -->
```

**验收标准**：
- [ ] H5环境不显示客服按钮或显示禁用状态
- [ ] 小程序环境正常显示并可点击使用客服功能
- [ ] 页面布局不受影响

**检查项**：
- [ ] 按钮样式是否需要调整
- [ ] 禁用状态的视觉提示是否清晰
- [ ] 点击事件是否正确处理

---

### 任务3：修复退出登录组件兼容性

| 属性 | 值 |
|------|-----|
| 任务ID | HIGH-003 |
| 优先级 | 高 |
| 严重程度 | 高危 |
| 状态 | 待处理 |

**问题描述**：`pages/my/index.vue`使用`<navigator open-type="exit" target="miniProgram">`组件，该组件仅在微信小程序中有效。

**涉及文件**：`/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/my/index.vue`

**具体位置**：第103-110行

**问题代码**：
```vue
<!-- #ifdef MP-WEIXIN -->
<navigator class="login-btn" open-type="exit" target="miniProgram" hover-class="navigator-hover"
  @click="handleExit()">确认</navigator>
<!-- #endif -->
<!-- #ifndef MP-WEIXIN -->
<view class="login-btn" @click="handleExit()">确认</view>
<!-- #endif -->
```

**当前状态**：条件编译已存在，但需验证完整性

**验收标准**：
- [ ] H5环境点击确认按钮正常退出登录
- [ ] 小程序环境点击确认按钮正常退出登录
- [ ] 退出后页面状态正确更新

**检查项**：
- [ ] 缓存清除逻辑是否完整
- [ ] 页面跳转逻辑是否正确
- [ ] 用户状态是否正确更新

---

## 三、中优先级任务

### 任务4：创建统一平台检测工具模块

| 属性 | 值 |
|------|-----|
| 任务ID | MED-004 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：项目中分散使用条件编译指令，缺乏统一的平台检测工具。

**新建文件**：`/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/utils/platform.js`

**实现内容**：
```javascript
// 平台检测工具

export function isH5() {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

export function isMPWeixin() {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

export function isApp() {
  // #ifdef APP-PLUS
  return true
  // #endif
  // #ifndef APP-PLUS
  return false
  // #endif
}

export function getPlatform() {
  // #ifdef H5
  return 'H5'
  // #endif
  // #ifdef MP-WEIXIN
  return 'MP-WEIXIN'
  // #endif
  // #ifdef APP-PLUS
  return 'APP'
  // #endif
  return 'UNKNOWN'
}

export function getUrlParams() {
  // #ifdef H5
  return new URLSearchParams(window.location.search)
  // #endif
  // #ifndef H5
  const options = uni.getLaunchOptionsSync()
  return options.query || {}
  // #endif
}

export function reloadPage() {
  // #ifdef MP-WEIXIN
  uni.reLaunch({ url: '/pages/login/index' })
  // #endif
  // #ifndef MP-WEIXIN
  location.reload()
  // #endif
}
```

**验收标准**：
- [ ] 文件创建成功
- [ ] 所有导出函数语法正确
- [ ] 可在其他模块中正常导入使用

---

### 任务5：优化登录模块URL参数解析

| 属性 | 值 |
|------|-----|
| 任务ID | MED-005 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：登录模块中分散使用浏览器API获取URL参数。

**涉及文件**：
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/login/index.vue`
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/home/index.vue`

**优化方案**：使用任务4创建的`getUrlParams()`工具函数替代分散的浏览器API调用。

**验收标准**：
- [ ] 登录页参数获取逻辑统一
- [ ] 首页forceLogin参数处理逻辑统一
- [ ] H5和小程序环境行为一致

---

### 任务6：优化页面重载逻辑

| 属性 | 值 |
|------|-----|
| 任务ID | MED-006 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：`pages/my/index.vue`使用`location.reload()`进行页面刷新，该方法在微信小程序中不可用。

**涉及文件**：`/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/my/index.vue`

**具体位置**：第285-304行 `handleExit` 方法

**问题代码**：
```javascript
// #ifndef MP-WEIXIN
uni.showToast({
  title: '已退出登录',
  icon: 'success'
})
setTimeout(() => {
  location.reload()
}, 1500)
// #endif
```

**修复方案**：
```javascript
handleExit() {
  // 清除缓存
  uni.clearStorageSync()
  this.userInfo = {}
  
  // #ifdef MP-WEIXIN
  uni.reLaunch({
    url: '/pages/login/index'
  })
  // #endif
  
  // #ifndef MP-WEIXIN
  uni.showToast({
    title: '已退出登录',
    icon: 'success'
  })
  setTimeout(() => {
    location.reload()
  }, 1500)
  // #endif
}
```

**验收标准**：
- [ ] H5环境退出登录后页面刷新
- [ ] 小程序环境退出登录后跳转到登录页
- [ ] 用户状态正确清除

---

### 任务7：优化状态栏高度获取逻辑

| 属性 | 值 |
|------|-----|
| 任务ID | MED-007 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：`src/main.js`同步获取`statusBarHeight`，在某些边缘设备上可能计算不准确。

**涉及文件**：`/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/main.js`

**具体位置**：第63行

**当前代码**：
```javascript
app.config.globalProperties.$statusBarHeight = uni.getSystemInfoSync().statusBarHeight + 47
```

**优化方向**：
1. 添加安全区域检测
2. 考虑使用异步获取方式
3. 添加设备类型判断

**验收标准**：
- [ ] 不同设备上状态栏高度计算正确
- [ ] 刘海屏设备显示正常
- [ ] 页面布局不受影响

---

### 任务8：审核动画效果渲染一致性

| 属性 | 值 |
|------|-----|
| 任务ID | MED-008 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：项目中多处使用CSS动画，需验证在两个环境的表现一致性。

**涉及文件**：
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/home/index.vue`
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/sub/aiService/index.vue`

**检查项**：
1. 首页进度条动画（`growFromLeft`、`shimmer`）
2. AI服务页面加载动画（`loading`）
3. 按钮点击动画效果
4. 弹窗动画效果

**验收标准**：
- [ ] 所有动画在H5环境执行流畅
- [ ] 所有动画在小程序环境执行流畅
- [ ] 动画效果在两个环境保持一致

---

### 任务9：审核动态组件渲染一致性

| 属性 | 值 |
|------|-----|
| 任务ID | MED-009 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：动态列表组件（`dynamic-list`）在复杂数据场景下可能存在渲染差异。

**涉及文件**：
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/sub/aiService/index.vue`
- `/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/pages/dynamic/components/dynamic-list/`

**检查项**：
1. 列表渲染完整性
2. 表单交互一致性
3. 数据加载状态显示
4. 列表滚动流畅度
5. 分页加载功能

**验收标准**：
- [ ] 动态列表在H5环境显示正确
- [ ] 动态列表在小程序环境显示正确
- [ ] 复杂数据场景无渲染异常

---

### 任务10：执行完整回归测试

| 属性 | 值 |
|------|-----|
| 任务ID | MED-010 |
| 优先级 | 中 |
| 严重程度 | 中危 |
| 状态 | 待处理 |

**任务描述**：修复完成后执行完整的回归测试。

**测试范围**：
1. H5环境完整功能测试
2. 微信小程序环境完整功能测试
3. 边界场景测试
4. 性能测试

**测试用例**：
| 用例编号 | 用例名称 | 测试环境 | 预期结果 |
|----------|----------|----------|----------|
| TC001 | 用户登录 | H5 | 登录成功，跳转首页 |
| TC002 | 用户登录 | 小程序 | 登录成功，跳转首页 |
| TC003 | 查看轮播图 | H5 | 正常显示 |
| TC004 | 查看轮播图 | 小程序 | 正常显示 |
| TC005 | 退出登录 | H5 | 退出成功，页面刷新 |
| TC006 | 退出登录 | 小程序 | 退出成功，跳转登录页 |
| TC007 | 查看便民服务 | H5/小程序 | 正常显示列表 |
| TC008 | AI问答交互 | H5/小程序 | 正常对话 |
| TC009 | 个人中心 | H5/小程序 | 信息显示正确 |
| TC010 | 房屋信息 | H5/小程序 | 数据正确显示 |

**验收标准**：
- [ ] 所有测试用例通过
- [ ] 无新增问题
- [ ] 修复的问题不再复现

---

## 四、低优先级任务

### 任务11：规范化条件编译指令使用

| 属性 | 值 |
|------|-----|
| 任务ID | LOW-011 |
| 优先级 | 低 |
| 严重程度 | 低危 |
| 状态 | 待处理 |

**任务描述**：建立项目条件编译规范文档，统一注释格式。

**行动项**：
1. 创建`docs/conditional-compilation-guide.md`规范文档
2. 审核所有条件编译代码的一致性
3. 统一注释格式

**规范内容示例**：
```javascript
// #ifdef H5
// H5环境特有代码
// #endif

// #ifndef H5
// 非H5环境代码
// #endif

// 推荐注释格式
// [平台] 功能说明
```

---

### 任务12：完善工具函数边界处理

| 属性 | 值 |
|------|-----|
| 任务ID | LOW-012 |
| 优先级 | 低 |
| 严重程度 | 低危 |
| 状态 | 待处理 |

**任务描述**：优化`utils/tools.js`中工具函数的边界情况处理。

**涉及函数**：
- `$cache` - 缓存管理函数
- `getUserProfile` - 用户信息获取
- `handleImgUrl` - 图片URL处理

**优化方向**：
1. 添加参数校验
2. 完善异常处理
3. 添加类型检查

---

### 任务13：规范全局样式变量命名

| 属性 | 值 |
|------|-----|
| 任务ID | LOW-013 |
| 优先级 | 低 |
| 严重程度 | 低危 |
| 状态 | 待处理 |

**任务描述**：统一`globalStyle.scss`中的变量命名规范。

**涉及文件**：`/Users/ehuhaim/workspace/saas/house-app-v3/test-project/src/static/globalStyle/globalStyle.scss`

**优化项**：
1. 统一变量命名风格（驼峰/下划线）
2. 添加必要的注释说明
3. 建立变量使用规范
4. 整理重复定义变量

---

### 任务14：建立兼容性监控机制

| 属性 | 值 |
|------|-----|
| 任务ID | LOW-014 |
| 优先级 | 低 |
| 严重程度 | 低危 |
| 状态 | 待处理 |

**任务描述**：建立长期的跨平台兼容性监控机制。

**行动项**：
1. 编写自动化兼容性测试用例
2. 建立环境检测日志
3. 制定新功能开发兼容性规范
4. 定期进行兼容性检查

---

## 五、任务跟踪表

| 任务ID | 任务名称 | 优先级 | 状态 | 负责人 | 开始日期 | 完成日期 | 备注 |
|--------|----------|--------|------|--------|----------|----------|------|
| HIGH-001 | 修复Base64编码兼容性问题 | 高 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | common/api.js - 添加条件编译和base64Encode函数 |
| HIGH-002 | 修复客服按钮组件兼容性 | 高 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | ContactCustomerBtn.vue - 条件编译控制显示 |
| HIGH-003 | 修复退出登录组件兼容性 | 高 | 已验证 | AI Assistant | 2025-12-26 | 2025-12-26 | pages/my/index.vue - 已有正确实现 |
| MED-004 | 创建统一平台检测工具模块 | 中 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | utils/platform.js - 15个跨平台工具函数 |
| MED-005 | 优化登录模块URL参数解析 | 中 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | login/index.vue - 改进条件编译结构 |
| MED-006 | 优化页面重载逻辑 | 中 | 已验证 | AI Assistant | 2025-12-26 | 2025-12-26 | 已有正确实现 |
| MED-007 | 优化状态栏高度获取逻辑 | 中 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | src/main.js - 考虑刘海屏和安全区域 |
| MED-008 | 审核动画效果渲染一致性 | 中 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | 动画使用标准CSS3，兼容性良好 |
| MED-009 | 审核动态组件渲染一致性 | 中 | 已完成 | AI Assistant | 2025-12-26 | 2025-12-26 | dynamic-list组件已有完善的条件编译 |
| MED-010 | 执行完整回归测试 | 中 | 待测试 | - | - | - | 测试验证 - 见compatibility-test-checklist.md |
| LOW-011 | 规范化条件编译指令使用 | 低 | 待处理 | - | - | - | 代码规范 |
| LOW-012 | 完善工具函数边界处理 | 低 | 待处理 | - | - | - | utils/tools.js |
| LOW-013 | 规范全局样式变量命名 | 低 | 待处理 | - | - | - | globalStyle.scss |
| LOW-014 | 建立兼容性监控机制 | 低 | 待处理 | - | - | - | 长期机制 |

---

## 六、执行建议

### 6.1 执行顺序

1. **第一阶段**（优先级P0）：处理高优先级任务（1-3项）
2. **第二阶段**（优先级P1）：处理中优先级核心任务（4-7项）
3. **第三阶段**（优先级P2）：处理中优先级验证任务（8-10项）
4. **第四阶段**（优先级P3）：处理低优先级优化任务（11-14项）

### 6.2 每阶段验收标准

**第一阶段验收**：
- 编译通过（两个环境）
- 核心功能正常运行
- 高危问题全部解决

**第二阶段验收**：
- 平台检测工具可正常使用
- URL参数解析逻辑统一
- 页面重载逻辑正确

**第三阶段验收**：
- 动画效果验证通过
- 动态组件渲染验证通过
- 回归测试全部通过

**第四阶段验收**：
- 代码规范文档完成
- 工具函数优化完成
- 监控机制建立

### 6.3 风险控制

1. **每日构建验证**：每天编译两个环境的版本
2. **Code Review**：修复代码需经过Review
3. **测试记录**：记录测试用例和结果
4. **问题跟踪**：发现新问题及时记录

---

## 七、附录

### 7.1 相关文档链接

- 《H5与小程序环境兼容性分析报告》：`docs/compatibility-analysis-report.md`
- 条件编译规范（待创建）：`docs/conditional-compilation-guide.md`

### 7.2 技术参考

- [uni-app条件编译文档](https://uniapp.dcloud.io/platform?id=条件编译)
- [微信小程序API文档](https://developers.weixin.qq.com/miniprogram/dev/api/)
- [btoa兼容性说明](https://developer.mozilla.org/en-US/docs/Web/API/btoa)

---

**文档版本**：1.0
**生成日期**：2025年12月26日
**版本状态**：正式发布

