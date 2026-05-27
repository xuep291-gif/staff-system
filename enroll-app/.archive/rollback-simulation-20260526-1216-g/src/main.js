import { createSSRApp } from 'vue'
import App from './App.vue'
import { globalConfig } from '@/config.js'
import { api } from '@/common/api.js'
import store from '@/store/common.js'
import { globalConfigManager } from '@/store/globalConfig.js'
import { buildingColorLump, tagColor } from '@/common/globalVariable.js'
import { cache, cacheMap, reload, login, getUserProfile, orderStatus, upload } from '@/utils/tools.js'
import { getStatusBarHeight, getSafeArea } from '@/utils/platform.js'
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import uniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue'
import uniLoadMore from '@dcloudio/uni-ui/lib/uni-load-more/uni-load-more.vue'
import uniTable from '@dcloudio/uni-ui/lib/uni-table/uni-table.vue'
import uniTr from '@dcloudio/uni-ui/lib/uni-tr/uni-tr.vue'
import uniTh from '@dcloudio/uni-ui/lib/uni-th/uni-th.vue'
import uniTd from '@dcloudio/uni-ui/lib/uni-td/uni-td.vue'
import uniSearchBar from '@dcloudio/uni-ui/lib/uni-search-bar/uni-search-bar.vue'
import uniEasyinput from '@dcloudio/uni-ui/lib/uni-easyinput/uni-easyinput.vue'
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 使用 Vuex store
  if (store) {
    app.use(store)
  }

  // 注册全局组件
  app.component('uni-popup', uniPopup)
  app.component('uni-transition', uniTransition)
  app.component('uni-load-more', uniLoadMore)
  app.component('uni-table', uniTable)
  app.component('uni-tr', uniTr)
  app.component('uni-th', uniTh)
  app.component('uni-td', uniTd)
  app.component('uni-search-bar', uniSearchBar)
  app.component('uni-easyinput', uniEasyinput)
  app.component('uni-icons', uniIcons)

  // Vue 3: 使用 app.config.globalProperties 替代 Vue.prototype
  app.config.globalProperties.$config = globalConfig
  app.config.globalProperties.$api = api
  app.config.globalProperties.$globalConfig = globalConfigManager

  // 楼栋颜色
  app.config.globalProperties.$buildingColorLump = buildingColorLump
  // tag颜色
  app.config.globalProperties.$tagColor = tagColor

  // 永久缓存
  app.config.globalProperties.$cache = cache
  app.config.globalProperties.$cacheMap = cacheMap
  app.config.globalProperties.$reload = reload
  app.config.globalProperties.$upload = upload

  //微信登录
  app.config.globalProperties.$wxlogin = login
  //获取微信用户信息
  app.config.globalProperties.$userProfile = getUserProfile

  //订单状态
  app.config.globalProperties.$orderStatusMap = orderStatus

  // 获取标题栏高度（优化版本，考虑安全区域）
  try {
    const systemInfo = uni.getSystemInfoSync()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const safeArea = systemInfo.safeArea || { top: 0, bottom: 0 }
    const screenHeight = systemInfo.screenHeight || 0

    // 判断是否为刘海屏设备（有安全区域且底部有间距）
    const isNotchScreen = safeArea.bottom < screenHeight
    // 计算导航栏高度：标准高度 + 安全区域补偿
    const navBarHeight = isNotchScreen ? 44 : 40

    // 总高度 = 状态栏高度 + 导航栏高度
    app.config.globalProperties.$statusBarHeight = statusBarHeight + navBarHeight

    console.log('[main.js] 屏幕信息:', {
      statusBarHeight,
      safeArea,
      screenHeight,
      isNotchScreen,
      navBarHeight,
      totalHeight: statusBarHeight + navBarHeight
    })
  } catch (e) {
    console.error('[main.js] 获取系统信息失败，使用默认值', e)
    // 出错时使用默认值
    app.config.globalProperties.$statusBarHeight = 88 // 常见的默认值
  }

  return {
    app
  }
}
