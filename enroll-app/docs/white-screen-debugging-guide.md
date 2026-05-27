# 动态页面白屏问题分析指南

## 概述

本文档描述了动态页面（dynamic-page）白屏问题的常见原因和调试流程。

## 快速启用调试器

在 H5 环境下，通过以下方式启用白屏调试器：

1. **URL 参数方式**（临时启用）：
   ```
   /pages/dynamic/seniorConfig/index?id=20055630&debug=true
   ```

2. **localStorage 方式**（持久启用）：
   ```javascript
   // 在浏览器控制台执行
   localStorage.setItem('whiteScreenDebug', 'true')
   // 刷新页面生效
   ```

3. **禁用调试**：
   ```javascript
   localStorage.removeItem('whiteScreenDebug')
   ```

## 白屏分析流程

### 1. 检查调试器输出

启用调试器后，页面会覆盖显示完整的调试日志，包含以下信息：

- 组件初始化状态
- API 请求详情
- 配置数据解析过程
- config 和 skeletonLoading 状态变化
- 白屏检测警告

### 2. 常见白屏原因分类

#### A. 页面生命周期问题 (onHide/onShow)

**症状**：
- 页面正常加载后，跳转到其他页面再返回时白屏
- 调试器显示 "API 地址为空"
- 但实际上 API 地址是正常的

**原因**：
- `seniorConfig` 页面在 `onHide` 时会清空 `api` 属性
- `dynamic-page` 监听到 API 变为空后，会清空 config
- 页面返回时 `onShow` 恢复 API，但 config 已经被清空

**解决**：
代码已修复：
- `dynamic-page` 在 API 被清空时不再立即清空 config
- 保留现有配置，等待 `onShow` 恢复 API
- 只有在真正没有配置时才报错

**调试日志**：
```
[1] API prop 变化
  oldAPI: "https://static.smallsaas.cn/form?id=5555599"
  newAPI: ""

[2] API 被清空，但保留当前配置
  hadConfig: true
  action: "等待 onShow 恢复 API"
```

#### B. 列表数据为空（正常情况）

**症状**：
- API 返回成功，但列表数据为空
- 页面显示 "暂无数据" 提示
- **这不是错误，是正常情况**

**示例**：
```json
// API 返回
{
  "code": 200,
  "data": {
    "records": [],  // 空数组
    "total": 0
  }
}
```

**处理逻辑**：
- 找到了数组字段 `records`
- 数组为空（length === 0）
- 显示空状态提示："暂无更多数据"
- 调试器显示成功日志（而非错误）

**调试日志**：
```
[1] dynamic-list: 数据加载成功（空数据）
  count: 0
  field: "records"
  message: "暂无数据"
  method: "extract"
```

**空状态显示**：
- 支持自定义空状态图片和文案
- 配置路径：`config.nodata.url`、`config.nodata.subject`
- 默认显示：内置图片 + "暂无更多数据"

#### C. API 请求失败

**症状**：
- 日志显示 "配置请求失败"
- code 不是 200
- 可能显示错误信息

**原因**：
- API 地址错误
- 认证 token 失效
- 网络问题
- 服务器错误

**解决方案**：
1. 检查 API URL 是否正确
2. 检查 token 是否有效
3. 查看服务器日志

#### D. 配置数据结构问题

**症状**：
- API 返回成功 (code: 200)
- 但 config.modules 为空或不存在

**常见情况**：

**情况 1: modules 数组为空**
```json
{
  "code": 200,
  "data": {
    "modules": [],  // 空数组
    "moduleData": {...}
  }
}
```
- **原因**: 页面配置没有定义任何模块
- **解决**: 检查后台配置，添加至少一个模块

**情况 2: modules 字段不存在**
```json
{
  "code": 200,
  "data": {
    "title": "页面标题",
    "moduleData": {...}
    // 缺少 modules 字段
  }
}
```
- **原因**: 后台配置数据不完整
- **解决**: 确保返回数据包含 modules 数组

#### E. 数据源配置问题 (autolist 白屏)

**症状**：
- config.modules 有数据
- 但列表不显示任何内容
- 列表一直显示加载中或空状态

**原因分析**：

**案例: id=20055630 户型列表页面**

API 返回配置：
```json
{
  "modules": [
    {
      "type": "autolist",
      "key": "e59992z8-bb88-a788-9922-1623488775885"
    }
  ],
  "moduleData": {
    "e59992z8-bb88-a788-9922-1623488775885": {
      "loadApi": "/api/u/house/operations/userHouseTypeManageEndpoint",
      "response": {
        "list": ""  // ⚠️ 问题点：list 字段为空字符串
      },
      "request": {
        "ps": "pageSize",
        "pn": "pageNum"
      }
    }
  }
}
```

**问题链条**：

1. **dynamic-page 组件**:
   - 解析配置成功
   - 因为有 loadApi，所以没有设置 list 数据
   - 调用 `getValidListData()` 返回空对象 `{}`

2. **dynamic-list 组件**:
   - 收到的 config 中没有 list 属性
   - 检测到有 loadApi，触发数据加载
   - 调用 `/api/u/house/operations/userHouseTypeManageEndpoint`

3. **API 返回数据**:
   - 假设返回: `{code: 200, data: {records: [...]}}`
   - 但配置中 `response.list` 是空字符串 `""`

4. **字段提取逻辑**:
   ```javascript
   const listField = _.get(props.config, 'response.list', 'list')
   // listField = ""  (空字符串)
   _.get(responseData, listField, [])
   // _.get(data, "", []) → 返回 []
   ```
   - 空字符串作为路径无法提取数据
   - 最终 list 为空数组

**H5 自动检测与提示** (仅 H5 环境):

当 `response.list` 配置错误时，dynamic-list 会在页面中央显示 HTML 警告框：

```
┌─────────────────────────────────────────────────────┐
│ ⚠️ dynamic-list 数据加载失败              [关闭]    │
├─────────────────────────────────────────────────────┤
│ 配置问题:                                             │
│ response.list 配置为: ""                            │
│ 未配置 response.list，系统尝试直接使用 API 返回值    │
│ 的 data 字段，但未能提取到有效的数组数据              │
├─────────────────────────────────────────────────────┤
│ 📌 数据提取说明:                                      │
│ • 未配置 response.list 时，系统会直接使用 API 返回    │
│   值的 data 字段                                      │
│ • 如果 data 本身是数组，直接使用；如果是对象，按优     │
│   先级查找: list > records > data > items > ...     │
│ • 当前未能找到有效的数组数据                          │
├─────────────────────────────────────────────────────┤
│ 💡 建议修改:                                          │
│ 尝试将 response.list 配置为以下之一:                   │
│ [records] [data.list]                               │
│ 或保持为空，让系统自动选择数组字段（当前未找到）        │
├─────────────────────────────────────────────────────┤
│ 📋 API 返回的 data 字段结构:                          │
│ {                                                    │
│   "records": [...],                                  │
│   "total": 10                                        │
│ }                                                    │
├─────────────────────────────────────────────────────┤
│ 解决方案: 确保 API 返回的 data 字段中包含数组数据，    │
│          或配置明确的 response.list 路径              │
└─────────────────────────────────────────────────────┘
```

提示框会：
- 显示当前配置的 `response.list` 值
- 说明未配置时的自动提取行为
- 智能扫描 API 返回数据，找出可能的数组字段路径
- 显示 API 返回的数据结构预览
- 提供明确的修改建议

**response.list 为空时的默认行为**:

当 `response.list` 为空字符串 `""` 或未配置时：

1. **自动使用 data 字段**: 系统直接使用 API 返回值的 `data` 字段

2. **智能数组查找**:
   - 如果 `data` 本身是数组 → 直接使用
   - 如果 `data` 是对象 → 按优先级查找常见数组字段：
     - `list`
     - `records`
     - `data`
     - `items`
     - 第一个遇到的数组字段

3. **失败处理**:
   - 如果找到数组 → 正常显示列表
   - 如果未找到 → H5 显示警告框，非 H5 静默失败

**示例场景**:

```javascript
// API 返回: { code: 200, data: { records: [...], total: 10 } }

// 场景 1: response.list 未配置（推荐）
// ✓ 系统自动查找，找到 records，成功显示列表

// 场景 2: response.list: ""
// ✓ 同场景 1，空字符串等同于未配置

// 场景 3: response.list: "records"
// ✓ 明确配置，直接使用 records

// 场景 4: response.list: "list"
// ✗ 配置错误，找不到 list 字段，H5 显示警告
```

**解决方案**：

1. **保持未配置** (推荐，当 API 返回标准格式时):
   ```json
   {
     "response": {
       // 不配置 list，让系统自动查找
       "total": "total"
     }
   }
   ```

2. **明确配置字段路径** (推荐，当 API 有非标准字段时):
   ```json
   {
     "response": {
       "list": "records",  // 明确指定字段名
       "total": "total"
     }
   }
   ```

3. **修复 API 返回结构** (备选):
   确保返回数据包含常见的数组字段（list/records/items）

4. **智能字段提取** (已实现):
   代码会自动尝试以下降级策略：
   - 直接路径: `listField`
   - 去掉 `data.` 前缀
   - 在 `data.data` 中查找
   - 多层递归检查

#### F. 列表项组件未注册

**症状**：
- 列表数据加载成功
- 但每个列表项显示错误或回退组件
- 控制台警告组件未注册

**原因**：
- `config.itemModule.name` 指定的组件未在 cardRegistry.js 中注册

**解决**：
1. 检查配置中的 itemModule.name
2. 在 cardRegistry.js 中注册对应组件

#### G. 组件渲染错误

**症状**：
- 页面有内容但显示异常
- 某些组件无法渲染

**原因**：
- 组件内部逻辑错误
- 数据格式不匹配
- 缺少必需的 props

**解决**：
1. 查看浏览器控制台错误
2. 使用调试器检查传入的数据格式

### 3. 调试检查清单

按顺序检查以下内容：

- [ ] 调试器已启用
- [ ] API 请求成功 (status 200)
- [ ] 返回数据包含 code: 200
- [ ] 返回数据包含 data 字段
- [ ] data.modules 是非空数组
- [ ] 至少有一个模块配置正确
- [ ] 如果是 autolist：
  - [ ] loadApi 配置正确
  - [ ] response.list 配置正确（不能是空字符串）
  - [ ] API 返回数据结构匹配配置
  - [ ] itemModule.name 组件已注册
- [ ] 如果是 autoform：
  - [ ] 表单配置正确
  - [ ] 字段组件已注册

### 4. 使用调试器分析具体问题

#### 示例 1: API 请求失败

```
[1] 组件初始化 (+0ms)
  props.API: "https://static.smallsaas.cn/form?id=20055630"

[2] 开始获取页面配置 (+50ms)
  API: "https://static.smallsaas.cn/form?id=20055630"

[3] 配置请求完成 (+200ms)
  statusCode: 200
  code: 401
  message: "未授权"
```

**诊断**: 认证失败，需要检查 token

#### 示例 2: modules 为空

```
[1] 组件初始化 (+0ms)

[2] 开始获取页面配置 (+50ms)

[3] 配置请求完成 (+200ms)
  statusCode: 200
  code: 200

[4] 解析后的配置数据 (+250ms)
  hasModules: true
  moduleCount: 0
  moduleTypes: []

[5] config 变化 (+260ms)
  isNull: false
  hasModules: true
  moduleCount: 0

⚠️ 白屏检测: config 存在但没有 modules
```

**诊断**: modules 数组为空，需要检查后台配置

#### 示例 3: list 字段配置错误

```
[4] 解析后的配置数据 (+250ms)
  moduleTypes: ["autolist"]

[... dynamic-list 组件日志 ...]
  loadApi: "/api/..."
  listField: ""

[...] 数据请求完成
  API 返回: {code: 200, data: {records: [...]}}

⚠️ 提取 list 数据失败
  listField: ""
  提取结果: []
```

**诊断**: response.list 配置为空字符串，需要配置正确的字段路径

## 调试器 API

### 日志级别

```javascript
whiteScreenDebugger.info('信息标题', {data})
whiteScreenDebugger.warn('警告标题', {data})
whiteScreenDebugger.error('错误标题', {data})
whiteScreenDebugger.success('成功标题', {data})
```

### 导出日志

```javascript
const logs = whiteScreenDebugger.export()
console.log(logs)
// 返回:
// {
//   startTime: "2025-12-30T...",
//   endTime: "2025-12-30T...",
//   duration: 5000,
//   logs: [...]
// }
```

### 显示诊断报告

```javascript
whiteScreenDebugger.showDiagnosis({
  '问题': 'API 请求失败',
  '状态码': 401,
  '建议': '检查 token 是否有效'
})
```

## 最佳实践

1. **开发环境**: 始终启用调试器
2. **生产环境**: 通过 URL 参数临时启用，不要在生产代码中硬编码
3. **配置验证**: 在后台添加配置验证，确保必要字段不为空
4. **错误处理**: 添加友好的错误提示，而不是白屏
5. **日志记录**: 保留关键操作的日志，便于事后分析

## 附录：完整的页面数据流

```
seniorConfig (onLoad)
  ↓
fetchPageConfigAndAdjustParams
  ↓
请求: https://static.smallsaas.cn/form?id=xxx
  ↓
存入缓存: page_xxx
  ↓
设置 isPageReady = true
  ↓
dynamic-page (onMounted)
  ↓
从缓存读取: page_xxx
  ↓
loadPage
  ↓
检查 dataSource.api
  ├─ 有 API → fetchPageData → 获取业务数据
  └─ 无 API → 直接设置 config
  ↓
config.value = resData
skeletonLoading.value = false
  ↓
模板渲染
  ↓
遍历 config.modules
  ↓
根据 type 渲染对应组件
  ├─ autolist → dynamic-list → 请求数据 → 渲染列表项
  ├─ autoform → dynamic-form → 渲染表单
  └─ 其他组件...
```

## 常见配置错误对照表

| 错误配置 | 正确配置 | 说明 |
|---------|---------|------|
| `"response": {"list": ""}` | `"response": {"list": "records"}` | list 不能为空字符串 |
| `"modules": []` | `"modules": [{...}]` | 至少需要一个模块 |
| `"loadApi": ""` | `"loadApi": "/api/xxx"` | loadApi 需要完整路径 |
| `"itemModule": {}` | `"itemModule": {"name": "xxx"}` | 需要指定组件名称 |
