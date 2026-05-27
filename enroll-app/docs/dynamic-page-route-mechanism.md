# 动态页面路由机制详解

> 本文档详细说明了项目中 `dynamic-page`、`dynamic-list` 组件以及相关路由跳转的完整机制，用于问题排查和开发参考。

## 目录

1. [架构概览](#架构概览)
2. [核心组件](#核心组件)
3. [数据流程](#数据流程)
4. [路由跳转机制](#路由跳转机制)
5. [生命周期管理](#生命周期管理)
6. [常见问题与解决方案](#常见问题与解决方案)

---

## 架构概览

### 组件层次结构

```
seniorConfig/index.vue (页面入口)
    └── dynamic-page/index.vue (动态页面容器)
            ├── 动态模块渲染
            │   ├── autoform → dynamic-form
            │   ├── autolist → dynamic-list
            │   ├── autoTable → tab-list
            │   ├── banner → swiper-images
            │   ├── navlist → nav-list
            │   ├── autoselect → dynamicSelectionList
            │   └── ...其他模块
            └── 配置数据获取
                └── fetchConfigData()
```

### dynamic-list 组件结构

```
dynamic-list/index.vue
    ├── load-refresh (下拉刷新/上拉加载)
    ├── ms-tabs (标签筛选)
    ├── multi-filter (多条件筛选)
    ├── 列表渲染
    │   └── Card 组件 (通过 cardRegistry 动态加载)
    │       ├── pictureItem
    │       ├── appointmentItem
    │       ├── addressItem
    │       └── ... (40+ 种 Card 组件)
    └── newItemNavigation (新增按钮)
```

---

## 核心组件

### 1. seniorConfig/index.vue

**路径**: `src/pages/dynamic/seniorConfig/index.vue`

**职责**:
- 动态配置页面的入口组件
- 处理页面参数 (`id`, `buildingId` 等)
- 管理 API 地址和 `routeParams`
- 处理页面生命周期 (onLoad/onShow/onHide)

**关键状态**:

```javascript
data() {
    return {
        api: '',                    // 当前页面配置 API
        cacheApi: '',               // 缓存的 API
        routeParams: {},            // 传递给子组件的参数
        cacheRouteParams: {},       // 缓存的参数
        currentConfigId: '',        // 当前配置 ID
        isPageReady: false,         // 页面是否准备就绪

        // 页面类型列表
        editPageIdList: ['5556663', '5555763', ...],
        addPageIdList: ['5555761', ...],
        listPageRouteParams: [...],
        noEmptyingApiPage: [...],
        // ...
    }
}
```

**页面类型判断逻辑**:

```javascript
onLoad(e) {
    if (e.id) {
        this.currentConfigId = e.id
        this.api = `${this.$config.formHost}?id=${e.id}`

        // 编辑类型页面 - 保留 id 参数
        if (this.editPageIdList.includes(e.id)) {
            this.routeParams = e  // { id: "5555763", buildingId: "xxx" }
        }

        // 新增/列表类型页面 - 移除 id 参数
        else if (this.addPageIdList.includes(e.id) || ...) {
            const params = { ...e }
            delete params.id
            this.routeParams = params  // { buildingId: "xxx" }
        }
    }
}
```

### 2. dynamic-page/index.vue

**路径**: `src/pages/dynamic/components/dynamic-page/index.vue`

**职责**:
- 根据配置数据动态渲染各种模块
- 获取页面配置 (通过 API)
- 获取页面数据 (通过 dataSource.api)
- 管理 `routeParams` 变化并重新加载配置

**核心 Props**:

```javascript
props: {
    API: String,              // 页面配置 API
    requsetParam: Object,     // 请求参数
    routeParams: Object,      // 路由参数
    srvFormData: Object,      // 表单数据
    Details: Boolean,         // 详情模式
    otherSearch: Object,      // 额外搜索条件
    isInit: Boolean,          // 强制重新初始化
}
```

**核心方法**:

```javascript
// 获取页面配置
fetchConfigData() {
    uni.request({
        url: props.API,
        success: (res) => {
            // 1. 解析配置数据
            const resData = res.data.data

            // 2. 缓存配置 (根据 id)
            const id = formatId(props.API)
            instance.proxy.$cache(`page_${id}`, resData)

            // 3. 如果有 dataSource.api，获取页面数据
            if (dataSource.api) {
                fetchPageData(resData, pageUrl)
            } else {
                config.value = resData
            }
        }
    })
}

// 获取页面数据 (列表数据等)
fetchPageData(configData, pageUrl) {
    uni.request({
        url: pageUrl,
        success: (res) => {
            config.value = configData
            Object.assign(pageData, res.data.data)
        }
    })
}
```

**Watch 监听**:

```javascript
// 监听 API 变化
watch(() => props.API, (newAPI, oldAPI) => {
    if (newAPI && newAPI !== oldAPI) {
        // 重新加载配置
        config.value = null
        fetchConfigData()
    }
})

// 监听 routeParams.id 变化 (修复同页面不同参数跳转)
watch(() => props.routeParams, (newParams, oldParams) => {
    if (newParams?.id && oldParams?.id && newParams.id !== oldParams.id) {
        // 使用新的 id 构建 API 并请求
        const newApi = `${baseUrl}?id=${newParams.id}`
        fetchConfigDataWithApi(newApi)
    }
}, { deep: true })
```

### 3. dynamic-list/index.vue

**路径**: `src/pages/dynamic/components/dynamic-list/index.vue`

**职责**:
- 渲染列表数据
- 处理分页加载
- 处理列表项点击跳转
- 管理 Card 组件注册和错误处理

**核心 Props**:

```javascript
props: {
    config: Object,         // 列表配置 (包含 loadApi, itemModule, itemNavigation 等)
    routeParams: Object,    // 路由参数
    namespace: String,      // 命名空间 (用于缓存)
}
```

**配置结构**:

```javascript
{
    loadApi: '/api/xxx',           // 列表数据 API
    method: 'GET',                 // 请求方法
    request: {                     // 请求参数映射
        pageNum: 'pn',
        pageSize: 'ps'
    },
    response: {                    // 响应数据映射
        list: 'data.list',
        total: 'data.total'
    },
    itemModule: {                  // 列表项组件配置
        name: 'pictureItem',       // 组件名称
        props: {},                 // 组件 props
        container: {}              // 容器样式
    },
    binding: {},                   // 数据绑定配置
    itemNavigation: '',            // 单个跳转路由
    multiItemNavigation: [],       // 多个跳转路由 (弹出菜单)
    newItemModule: {},             // 新增按钮配置
}
```

**Card 组件动态加载**:

```javascript
// cardRegistry.js 管理所有 Card 组件
import { getAllCardComponents, getCardComponent } from './cardRegistry.js'

export default {
    components: {
        ...getAllCardComponents(),  // 批量注册
    }
}

// 模板中动态渲染
<component
    :is="getListItemKey()"
    v-if="isComponentRegistered(getListItemKey())"
    :item="{ ...item, ...getComponentBindData(item) }"
/>
```

**错误处理机制**:

```javascript
// 按索引追踪错误
const itemErrors = reactive({})

const hasItemError = (index) => {
    return !!itemErrors[index]
}

// 容错组件
<FallbackCard
    v-else
    :item="item"
    :componentName="getListItemKey()"
    :error="getItemError(index)"
/>
```

---

## 数据流程

### 页面初始化流程

```
1. 用户访问 /dynamic/seniorConfig/index?id=5555762
         ↓
2. seniorConfig onLoad(e)
   - currentConfigId = "5555762"
   - api = `${formHost}?id=5555762`
   - 根据 id 类型设置 routeParams
         ↓
3. dynamic-page onMounted()
   - 检查缓存: cache(`page_5555762`)
   - 有缓存 → loadPage(cachedData)
   - 无缓存 → fetchConfigData()
         ↓
4. fetchConfigData()
   - 请求: GET ${api}
   - 响应: { modules: [...], moduleData: {...} }
   - 缓存: cache(`page_5555762`, resData)
   - 设置: config.value = resData
         ↓
5. 如果有 dataSource.api
   - fetchPageData(config, pageUrl)
   - 请求列表数据
   - 更新 pageData
         ↓
6. 渲染页面
   - 遍历 config.modules
   - 根据 type 渲染对应组件
```

### 列表数据加载流程

```
1. dynamic-list onMounted()
   - 检查是否有 loadApi
         ↓
2. updateData()
   - 解析 request 配置
   - 初始化 listSearch
   - 调用 fetchList({ refresh: true })
         ↓
3. fetchList()
   - formatLoadApi(api) - 处理 API 参数
   - handleParams() - 合并 routeParams
   - uni.request({ url, data: listSearch })
         ↓
4. 响应处理
   - 提取列表: _.get(data, response.list)
   - 提取总数: _.get(data, response.total)
   - 更新: list.value = extractedList
         ↓
5. 渲染列表项
   - 遍历 list
   - getComponentBindData(item) - 数据绑定
   - 动态渲染 Card 组件
```

---

## 路由跳转机制

### 单跳转 (itemNavigation)

**配置示例**:
```javascript
{
    itemNavigation: 'seniorConfig/index?id=5555763&buildingId=<buildingId>'
}
```

**跳转流程**:

```
1. 用户点击列表项
         ↓
2. dynamic-list checkNavType(item)
   - 检测: _.get(config, 'itemNavigation')
   - 调用: handleJumpRoute(item)
         ↓
3. handleJumpRoute(item)
   - 解析: route = "seniorConfig/index"
   - 解析: query = { id: "5555763", buildingId: "" }
         ↓
4. 替换参数
   - query[id] 有值，保持不变
   - query[buildingId] 为空，使用 item[buildingId]
   - 结果: { id: "5555763", buildingId: "117" }
         ↓
5. 构建 URL
   - url = `/pages/dynamic/seniorConfig/index?id=5555763&buildingId=117`
         ↓
6. uni.navigateTo({ url })
```

**代码实现** (`dynamic-list/index.vue:672-691`):

```javascript
const handleJumpRoute = (item) => {
    let routeUrl = ''
    const itemNavigation = props.config.itemNavigation
    const route = itemNavigation.split('?')[0]
    const query = itemNavigation.split('?')[1] ? qs.parse(itemNavigation.split('?')[1]) : {}

    routeUrl += (`/pages${route.charAt(0) !== '/' ? '/' : ''}` + route)

    if (Object.keys(query).length > 0) {
        for (const i in query) {
            if (query[i] === '') {
                query[i] = item[i] || ''
            }
        }
        routeUrl += '?query=' + encodeURIComponent(JSON.stringify(query))
    }

    uni.navigateTo({ url: routeUrl })
}
```

### 多跳转 (multiItemNavigation)

**配置示例**:
```javascript
{
    multiItemNavigation: [
        'seniorConfig/index?id=5555763&buildingId=<buildingId>',
        'seniorConfig/index?id=5555764',
        'delete /api/xxx/<id>'
    ]
}
```

**跳转流程**:

```
1. 用户点击列表项
         ↓
2. dynamic-list checkNavType(item)
   - 检测: _.get(config, 'multiItemNavigation')
   - 调用: onShowPopup(item)
         ↓
3. onShowPopup(data)
   - 合并数据: { ...data, ...props.routeParams }
   - 设置: popupConfig.options
   - 打开弹窗: dynamicListPopupRef.open('bottom')
         ↓
4. dynamic-list-popup 渲染菜单
   - 遍历 config.options
   - 每个 btnItem 配置:
     {
         label: '编辑',
         navigation: multiItemNavigation[0],
         data: mergedData
     }
         ↓
5. 用户点击菜单项
         ↓
6. btnItem goToPage()
   - 检查是否有 HTTP 方法前缀 (post/put/delete)
   - 没有 → 调用 formatQueryUrl()
         ↓
7. formatQueryUrl(navigation, data)
   - 解析 navigation
   - 替换动态参数 (<buildingId> → data.buildingId)
   - 构建最终 URL
         ↓
8. uni.navigateTo({ url: pathString })
```

**formatQueryUrl 详细逻辑** (`compxTools.js:6-77`):

```javascript
export function formatQueryUrl (navigation, data) {
    // 输入:
    // navigation = "/dynamic/seniorConfig/index?id=5555763&buildingId=id"
    // data = { id: "xxx", buildingId: "117", ... }

    const route = itemNavigation.split('?')[0]  // "/dynamic/seniorConfig/index"
    const query = qs.parse(itemNavigation.split('?')[1])
    // query = { id: "5555763", buildingId: "id" }

    // 检查是否有 & 参数 (多个参数)
    if (navigation.indexOf('&') != -1) {
        const navString = navigation.split('&')[0]
        // navString = "/dynamic/seniorConfig/index?id=5555763"

        // 获取 & 之后的部分
        const remainingParams = navigation.substring(navigation.indexOf('&') + 1)
        // remainingParams = "buildingId=id"

        nList = remainingParams.split('&')
        // nList = ["buildingId=id"]

        // 处理每个参数
        nList.forEach(item => {
            const [paramKey, paramValueSource] = item.split('=')
            // paramKey = "buildingId"
            // paramValueSource = "id"

            // 从 data 中取值
            const value = data[paramValueSource] || paramValueSource
            // value = data["id"] = "117"

            nUrlParams += `&${paramKey}=${value}`
            // nUrlParams = "&buildingId=117"
        })

        return `/pages${navString}${nUrlParams}`
        // "/pages/dynamic/seniorConfig/index?id=5555763&buildingId=117"
    }
}
```

---

## 生命周期管理

### uni-app 页面跳转时的生命周期

**关键**: 当从 `seniorConfig/index?id=A` 跳转到 `seniorConfig/index?id=B` 时：

```
uni-app 判断: 同一个页面路径，不同参数
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 页面 A 的生命周期                                            │
│   - onLoad: 不触发 ❌ (页面实例被复用)                       │
│   - onHide: 触发 ✅                                         │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│ 页面 B 的生命周期 (同一个实例，新参数)                       │
│   - onLoad: 不触发 ❌                                       │
│   - onShow: 触发 ✅                                        │
└─────────────────────────────────────────────────────────────┘
```

### seniorConfig 生命周期处理

```javascript
onShow() {
    // 1. 获取当前页面的实际参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentOptions = currentPage?.options || {}
    // currentOptions = { id: "5555763", buildingId: "117" }

    // 2. 检查 id 是否变化 (同页面不同参数跳转)
    if (currentOptions.id && currentOptions.id !== this.currentConfigId) {
        // id 变化了，重新加载页面配置
        this.currentConfigId = currentOptions.id
        this.api = `${this.$config.formHost}?id=${currentOptions.id}`

        // 根据新的 id 类型设置 routeParams
        if (this.editPageIdList.includes(currentOptions.id)) {
            this.routeParams = currentOptions  // 编辑页面保留 id
        } else {
            const params = { ...currentOptions }
            delete params.id
            this.routeParams = params  // 其他页面移除 id
        }
    }
}

onHide() {
    // 检查是否正在跳转到同一个页面
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]

    if (prevPage && prevPage.route && prevPage.route.includes('seniorConfig')) {
        // 同页面跳转，保留 API (重要!)
        return
    }

    // 其他情况，根据页面类型决定是否清空
    if (this.noEmptyingApiPage.includes(this.currentConfigId)) {
        return  // 不清空
    }

    this.api = ''
    this.routeParams = {}
}
```

### dynamic-page 的响应机制

```javascript
// 方式 1: 监听 API 变化
watch(() => props.API, (newAPI, oldAPI) => {
    if (newAPI && newAPI !== oldAPI) {
        config.value = null
        fetchConfigData()
    }
})

// 方式 2: 监听 routeParams.id 变化
watch(() => props.routeParams, (newParams, oldParams) => {
    if (newParams?.id && oldParams?.id && newParams.id !== oldParams.id) {
        // 使用新的 id 构建 API
        const baseUrl = props.API.split('?id=')[0]
        const newApi = `${baseUrl}?id=${newParams.id}`
        fetchConfigDataWithApi(newApi)
    }
}, { deep: true })
```

---

## 常见问题与解决方案

### 问题 1: 同页面不同参数跳转白屏

**症状**:
- 从 `seniorConfig/index?id=5555762` 跳转到 `seniorConfig/index?id=5555763`
- 页面白屏，配置未加载

**原因**:
1. `onLoad` 不触发，`onShow` 触发但未处理参数变化
2. `onHide` 清空了 API，导致 `onShow` 恢复了错误的 API

**解决方案**:

```javascript
// seniorConfig/index.vue
onShow() {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentOptions = currentPage?.options || {}

    // 检测 id 变化
    if (currentOptions.id && currentOptions.id !== this.currentConfigId) {
        this.currentConfigId = currentOptions.id
        this.api = `${this.$config.formHost}?id=${currentOptions.id}`
        // 重新设置 routeParams...
    }
}

onHide() {
    const pages = getCurrentPages()
    const prevPage = pages[pages.length - 2]

    // 同页面跳转，保留 API
    if (prevPage && prevPage.route && prevPage.route.includes('seniorConfig')) {
        return
    }
    // ...
}
```

### 问题 2: 路由参数重复 (id=5555763,5555763)

**症状**:
```
URL: /pages/dynamic/seniorConfig/index?id=5555763&id=5555763&buildingId=117
```

**原因**:
`formatQueryUrl` 函数在处理 `&` 参数时，错误地将已有的参数再次添加。

**解决方案**:

```javascript
// compxTools.js - formatQueryUrl
if (navigation.indexOf('&') != -1) {
    // 只获取 & 之后的部分
    const navString = navigation.split('&')[0]
    const remainingParams = navigation.substring(navigation.indexOf('&') + 1)
    const nList = remainingParams.split('&')

    // 只处理 & 之后的参数，不重复添加已有的
    nList.forEach(item => {
        const [key, valueSource] = item.split('=')
        const value = data[valueSource] || valueSource
        nUrlParams += `&${key}=${value}`
    })

    return `/pages${navString}${nUrlParams}`
}
```

### 问题 3: Card 组件未注册导致渲染失败

**症状**:
- 列表项不显示
- Console 警告: `Unknown custom element`

**原因**:
- Card 组件未在 `cardRegistry.js` 中注册

**解决方案**:

```javascript
// src/pages/dynamic/components/dynamic-list/cardRegistry.js
import PictureItem from './listItem/my/pictureItem.vue'

export function getAllCardComponents() {
    return {
        PictureItem,
        // ... 其他组件
    }
}

export function getCardComponent(name) {
    const components = getAllCardComponents()
    return components[name]
}
```

### 问题 4: 列表数据不刷新

**症状**:
- 返回页面后列表数据未刷新
- 需要手动下拉才能看到新数据

**原因**:
- 页面在 `onHide` 时清空了 API
- `onShow` 时使用了缓存的数据

**解决方案**:

```javascript
// 在需要刷新的页面 id 添加到 noEmptyingApiPage
noEmptyingApiPage: [
    '5555763',
    // ... 其他需要保留状态的页面
]

// 或者在 onShow 时强制刷新
onShow() {
    if (this.shouldRefresh) {
        this.$refs.dynamicPage?.refresh?.()
    }
}
```

### 问题 5: routeParams 未正确传递

**症状**:
- 列表 API 请求缺少参数
- `buildingId` 等参数未传递

**原因**:
- `seniorConfig` 的 `routeParams` 设置不正确
- 页面类型判断错误

**解决方案**:

```javascript
// 检查页面类型列表配置
onLoad(e) {
    // 确认页面 id 在哪个列表中
    if (this.editPageIdList.includes(e.id)) {
        // 编辑页面：保留所有参数包括 id
        this.routeParams = e
    } else if (this.addPageIdList.includes(e.id)) {
        // 新增页面：移除 id
        const params = { ...e }
        delete params.id
        this.routeParams = params
    }
}

// 检查 dynamic-list 的参数合并
fetchList() {
    const params = {
        ...listSearch,
        ...props.routeParams  // 确保这里合并了
    }
    uni.request({ url, data: params })
}
```

---

## 调试技巧

### 1. 添加调试日志

在关键位置添加 console.log：

```javascript
// seniorConfig/index.vue
onLoad(e) {
    console.log('[seniorConfig] onLoad - params:', e)
    console.log('[seniorConfig] onLoad - currentConfigId:', this.currentConfigId)
}

onShow() {
    console.log('[seniorConfig] onShow - currentConfigId:', this.currentConfigId)
    console.log('[seniorConfig] onShow - api:', this.api)
}

// dynamic-page/index.vue
watch(() => props.API, (newAPI, oldAPI) => {
    console.log('[DynamicPage] API changed:', oldAPI, '→', newAPI)
})

watch(() => props.routeParams, (newParams, oldParams) => {
    console.log('[DynamicPage] routeParams changed:', oldParams, '→', newParams)
}, { deep: true })

// dynamic-list/index.vue
fetchList() {
    console.log('[DynamicList] fetchList - API:', requestUrl)
    console.log('[DynamicList] fetchList - params:', handleParams())
}
```

### 2. 检查缓存

```javascript
// 查看页面配置缓存
const config = this.$cache(`page_5555762`)
console.log('Cached config:', config)

// 查看缓存列表
const cacheList = this.$cache('pageCacheList')
console.log('Cache list:', cacheList)
```

### 3. 追踪路由跳转

```javascript
// btnItem.vue
goToPage() {
    console.log('[btnItem] navigation:', this.item.navigation)
    console.log('[btnItem] data:', this.item.data)
    const pathString = formatQueryUrl(...)
    console.log('[btnItem] final URL:', pathString)
}

// compxTools.js
export function formatQueryUrl(navigation, data) {
    console.log('[formatQueryUrl] input:', { navigation, data })
    // ...
    console.log('[formatQueryUrl] output:', result)
    return result
}
```

---

## 配置参考

### seniorConfig 页面类型列表

```javascript
// 编辑类型页面 - 保留 id 参数
editPageIdList: [
    '5556663',   // 修改小区
    '5555763',   // 修改楼栋
    '1235664',   // 修改社区
    '1637113',   // 修改地址
    '20055712',  // 修改 VR 分类
    // ...
]

// 新增类型页面 - 移除 id 参数
addPageIdList: [
    '5555761',   // 创建小区
    '1222762',   // 创建海报
    '20055711',  // VR 图片
    // ...
]

// 列表类型页面 - 移除 id 参数
listPageRouteParams: [
    '1000006651',
    '1000006652',
    '55522332211',
    // ...
]

// 不清空 API 的页面 (保持状态)
noEmptyingApiPage: [
    '5556663',   // 上传图片时不清空
    '5555763',
    '1222762',
    // ...
]
```

### dynamic-list 配置示例

```javascript
{
    // 列表数据 API
    loadApi: '/api/u/house/building/list',

    // 请求方法
    method: 'GET',

    // 请求参数映射
    request: {
        default: { status: 1 },
        pageNum: 'pn',      //pn -> pageNum
        pageSize: 'ps',     //ps -> pageSize
        communityId: 'communityId'
    },

    // 响应数据映射
    response: {
        list: 'data.list',      // 列表数据路径
        total: 'data.total'     // 总数路径
    },

    // 分页配置
    pagination: true,

    // 列表项组件
    itemModule: {
        name: 'pictureItem',     // 组件名称
        props: {
            showStatus: true
        },
        container: {
            padding: '10px',
            background: '#fff'
        }
    },

    // 数据绑定
    binding: {
        title: 'name',
        subtitle: 'address',
        imageUrl: 'picture',
        '_': {                   // 格式化配置
            label: '{name}-{code}'
        }
    },

    // 单跳转
    itemNavigation: 'seniorConfig/index?id=5555763&buildingId=<id>',

    // 多跳转 (弹出菜单)
    multiItemNavigation: [
        'seniorConfig/index?id=5555763&buildingId=<id>',    // 编辑
        'seniorConfig/index?id=5555764&buildingId=<id>',    // 房间
        'delete /api/building/<id>'                          // 删除
    ],

    // 多筛选配置
    multiFilter: [
        {
            field: 'status',
            label: '状态',
            options: [
                { label: '全部', value: '' },
                { label: '正常', value: 1 },
                { label: '禁用', value: 0 }
            ]
        }
    ],

    // 标签配置
    tabConfig: {
        field: 'type',
        show: true,
        list: [
            { name: '全部', value: '' },
            { name: '住宅', value: '1' },
            { name: '商业', value: '2' }
        ]
    },

    // 新增按钮
    newItemModule: 'createBtn',
    newItemNavigation: 'seniorConfig/index?id=5555761',

    // 空数据配置
    nodata: {
        url: '/static/empty.png',
        subject: '暂无数据',
        note: '点击新增按钮添加数据'
    }
}
```

---

## 文件索引

### 核心文件

| 文件 | 路径 | 说明 |
|------|------|------|
| seniorConfig 页面入口 | `src/pages/dynamic/seniorConfig/index.vue` | 动态配置页面入口 |
| dynamic-page | `src/pages/dynamic/components/dynamic-page/index.vue` | 动态页面容器 |
| dynamic-list | `src/pages/dynamic/components/dynamic-list/index.vue` | 动态列表组件 |
| cardRegistry | `src/pages/dynamic/components/dynamic-list/cardRegistry.js` | Card 组件注册表 |
| compxTools | `src/pages/dynamic/components/utils/compxTools.js` | 路由和参数处理工具 |
| btnItem | `src/pages/dynamic/components/dynamic-list-popup/popupItem/btnItem.vue` | 菜单按钮项 |

### Card 组件目录

| 目录 | 路径 | 说明 |
|------|------|------|
| my 目录 | `src/pages/dynamic/components/dynamic-list/listItem/my/` | 自定义 Card 组件 (40+ 个) |
| 其他 Card | `src/pages/dynamic/components/dynamic-list/listItem/` | 通用 Card 组件 |

### 相关组件

| 组件 | 路径 | 说明 |
|------|------|------|
| dynamic-form | `src/pages/dynamic/components/dynamic-form/index.vue` | 动态表单 |
| dynamicSelectionList | `src/pages/dynamic/components/dynamic-selection-list/index.vue` | 动态选择列表 |
| nav-list | `src/pages/dynamic/components/nav-list/index.vue` | 导航列表 |
| multi-filter | `src/pages/dynamic/components/multiFilter/index.vue` | 多条件筛选 |
| load-refresh | `src/pages/dynamic/components/load-refresh/load-refresh.vue` | 下拉刷新/上拉加载 |

---

## 更新日志

### 2024-12-26
- 添加 `onShow` 参数变化检测，修复同页面跳转白屏问题
- 优化 `onHide` 逻辑，同页面跳转时保留 API
- 修复 `formatQueryUrl` 参数重复问题
- 添加 `dynamic-page` 的 `routeParams` 监听
- 添加详细的调试日志

### 2024-12-XX
- 初始版本
- 完善组件错误处理机制
- 添加 FallbackCard 容错组件
