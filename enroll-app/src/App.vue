<script>
import _ from 'lodash'
import { cleanExpiredPageCache } from '@/utils/tools.js'
import { getRoleFromStorage, applyTheme } from '@/utils/role.js'

export default {
  onLaunch: function (e) {
    console.log('App Launch', e)

    // 异步清理过期的页面缓存（不阻塞启动）
    cleanExpiredPageCache().then(result => {
      console.log('[App] 过期缓存清理结果', result)
    }).catch(err => {
      console.error('[App] 过期缓存清理失败', err)
    })

    // 清除缓存
    this.$cacheMap.remove('imgList')
    this.$cacheMap.remove('list')
    this.$cacheMap.remove('tabIndex')
    this.$cacheMap.remove('tabList')
    this.$cacheMap.remove('fetchMsgList')
    this.$cacheMap.remove('noticeList')
  },
  mounted() {
    // DOM 就绪后应用主题
    const role = getRoleFromStorage()
    if (role) applyTheme(role)
  },
  onShow: function () {
  },
  onHide: function () {
    const userInfoCache = this.$cache("userInfo")
    if (_.get(userInfoCache, 'requestUserInfo')) {
      this.$cache("userInfo", {})
    }
  },
}
</script>

<style lang="scss">
page {
  background-color: var(--N50);
  height: 100%;
  // 确保页面宽度不超出屏幕
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

// 确保 uni-app 导航栏不超出屏幕宽度（所有平台）
.uni-page-head {
  width: 100% !important;
  max-width: 100vw !important;
  box-sizing: border-box !important;
}

.uni-page-wrapper {
  width: 100% !important;
  max-width: 100vw !important;
  box-sizing: border-box !important;
  background: transparent !important;
}

.uni-page-body {
  width: 100% !important;
  max-width: 100vw !important;
  box-sizing: border-box !important;
  background: transparent !important;
}

// ═══════════════════════════════════════
// Design Token System
// ═══════════════════════════════════════
@import "@/styles/tokens/index.scss";

/*每个页面公共css */
@import "@/styles/globalStyle/globalStyle.scss";
@import "@/static/rssGlobalStyle/rssGlobalStyle.scss";
</style>
