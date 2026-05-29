<template>
  <view class="page">
    <!-- 品牌头部区域 §27 bind-hero -->
    <view class="login-hero">
      <view class="login-logo">🏫</view>
      <text class="login-hero-title">迎新收费管理系统</text>
      <text class="login-hero-sub">教职工端 · 教师/财务/政务</text>
    </view>

    <!-- 表单区域 §27 bind-body -->
    <view class="login-body">
      <!-- 登录方式切换 §9 Tabs -->
      <view class="login-tabs">
        <view
          class="login-tab"
          :class="{ 'login-tab-on': loginType === 'pwd' }"
          @click="switchTab('pwd')"
        >
          <text class="login-tab-text">密码登录</text>
        </view>
        <view
          class="login-tab"
          :class="{ 'login-tab-on': loginType === 'sms' }"
          @click="switchTab('sms')"
        >
          <text class="login-tab-text">验证码登录</text>
        </view>
      </view>

      <!-- 密码登录表单 -->
      <view v-if="loginType === 'pwd'" class="login-form">
        <view class="form-item">
          <text class="form-label">工号 / 手机号</text>
          <input
            class="form-input"
            v-model="form.account"
            placeholder="请输入工号或手机号"
          />
        </view>
        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            class="form-input"
            v-model="form.password"
            password
            placeholder="请输入密码"
          />
        </view>
        <text class="pwd-hint">演示账号统一密码为 123456</text>
        <view class="form-btn" @click="onPwdLogin">
          <text>登 录</text>
        </view>
      </view>

      <!-- 短信验证码登录表单 -->
      <view v-if="loginType === 'sms'" class="login-form">
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            v-model="form.phone"
            placeholder="请输入手机号"
          />
        </view>
        <view class="form-item">
          <text class="form-label">验证码</text>
          <view class="sms-row">
            <input
              class="form-input sms-input"
              v-model="form.code"
              placeholder="请输入验证码"
            />
            <view class="sms-btn" :class="{ 'sms-btn-disabled': codeSending }" @click="onSendCode">
              <text>{{ codeText }}</text>
            </view>
          </view>
        </view>
        <text class="pwd-hint">演示环境验证码固定为 123456</text>
        <view class="form-btn" @click="onSmsLogin">
          <text>登 录</text>
        </view>
      </view>

      <view class="demo-card">
        <view class="demo-head">
          <text class="demo-title">演示账号</text>
          <text class="demo-sub">登录后自动进入对应端</text>
        </view>
        <view class="demo-list">
          <view v-for="item in demoAccounts" :key="item.role" class="demo-row">
            <view class="demo-role">
              <text class="demo-name">{{ item.role }}</text>
              <text class="demo-phone">{{ item.phone }}</text>
            </view>
            <view class="demo-account">
              <text class="demo-main">工号 {{ item.account }}</text>
              <text class="demo-pass">密码 {{ item.password }}</text>
            </view>
          </view>
        </view>
        <text class="demo-code">验证码登录：使用以上任一手机号，验证码 123456</text>
      </view>

    </view>

    <!-- 强制登录对话框 -->
    <!-- #ifdef H5 -->
    <view v-if="showDialog" class="ovl on">
      <view class="dialog">
        <text class="dialog-title">清再登录缓存</text>
        <text class="dialog-msg">检测到清再登录请求，将清除所有缓存并重新登录</text>
        <view class="dialog-btns">
          <view class="dialog-btn dialog-btn-cancel" @click="cancelForceLogin">取消</view>
          <view class="dialog-btn dialog-btn-confirm" @click="confirmForceLogin">确认</view>
        </view>
      </view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script>
import _ from 'lodash'
import { globalConfig, debugConfig } from '@/config.js'
import commonStore from '@/store/common.js'
import { isMPWeixin } from '@/utils/platform.js'
import { resolveRole, resolveAllRoles, getRoleHomePage, applyTheme } from '@/utils/role.js'
import { authApi } from '@/common/api/auth.js'

export default {
  name: 'loginPage',
  data() {
    return {
      loading: false,
      apiUrl: globalConfig.endpoint + '/api/oauth/wxapp/login',
      showDialog: false,
      isWechat: isMPWeixin(),
      loginType: 'pwd',
      form: {
        account: '',
        password: '',
        phone: '',
        code: ''
      },
      codeText: '获取验证码',
      codeSending: false,
      codeTimer: null,
      demoAccounts: [
        { role: '教师端', account: '1001', password: '123456', phone: '13800138000' },
        { role: '财务端', account: '2001', password: '123456', phone: '13800138001' },
        { role: '政务端(学工处)', account: '3001', password: '123456', phone: '13800138002' },
        { role: '政务端(学院)', account: '3002', password: '123456', phone: '13800138003' },
        { role: '迎新工作人员', account: '2003', password: '123456', phone: '13800138004' }
      ]
    }
  },
  onLoad(options) {
    let forceLogin = false
    // #ifdef H5
    const urlParams = new URLSearchParams(window.location.search)
    forceLogin = urlParams.get('forceLogin') === 'true'
    // #endif
    // #ifndef H5
    uni.hideHomeButton()
    forceLogin = options && options.force === 'true'
    // #endif

    if (forceLogin) {
      // #ifdef H5
      this.showForceLoginDialog()
      return
      // #endif
      // #ifndef H5
      this.clearAllCache()
      return
      // #endif
    }

    // H5调试模式：清除缓存
    // #ifdef H5
    if (debugConfig.simulateNewUser) {
      const cacheKeys = ['userInfo', 'profile', 'auth', 'loginData', 'communityData']
      cacheKeys.forEach(key => {
        try { uni.removeStorageSync(key) } catch (e) {}
      })
      try { commonStore.commit('cleanState') } catch (e) {}
      uni.clearStorageSync()
      try {
        if (typeof localStorage !== 'undefined') localStorage.clear()
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
      } catch (e) {}
    }
    // #endif

    this.checkLogin()
  },
  onUnload() {
    if (this.codeTimer) {
      clearInterval(this.codeTimer)
      this.codeTimer = null
    }
  },
  methods: {
    clearAllCache() {
      try {
        uni.clearStorageSync()
        if (typeof localStorage !== 'undefined') localStorage.clear()
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
        uni.showToast({ title: '缓存已清除，请重新登录', icon: 'success', duration: 2000 })
      } catch (e) {}
    },

    showForceLoginDialog() { this.showDialog = true },

    cancelForceLogin() {
      this.showDialog = false
      // #ifdef H5
      window.location.replace('/#/pages/teacher/home/index')
      // #endif
      // #ifndef H5
      uni.reLaunch({ url: '/pages/teacher/home/index' })
      // #endif
    },

    confirmForceLogin() {
      this.showDialog = false
      try {
        uni.clearStorageSync()
        if (typeof localStorage !== 'undefined') localStorage.clear()
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear()
      } catch (e) {}
      this.autoLogin()
    },

    checkLogin() {
      const userInfoCache = this.$cache('userInfo')
      if (userInfoCache && userInfoCache.userId) {
        // #ifdef H5
        if (debugConfig.simulateNewUser) {
          userInfoCache.orgId = null
          userInfoCache.hasOrgId = false
          userInfoCache.orgName = null
          userInfoCache.communityId = null
          userInfoCache.communityName = null
          this.$cache('userInfo', userInfoCache)
          commonStore.commit('cleanState')
          uni.setStorageSync('communityData', { communityId: null, orgId: null })
        }
        // #endif
        this.goToHome(userInfoCache)
      } else {
        // #ifdef H5
        if (debugConfig.simulateNewUser) return
        // #endif
        this.autoLogin()
      }
    },

    autoLogin() {
      const cached = this.$cache('userInfo')
      if (cached && cached.userId) {
        this.goToHome(cached)
        return
      }
      // #ifndef H5
      uni.showLoading({ title: '登录中...', mask: true })
      uni.login({
        success: (res) => { this.login(_.get(res, 'code')) },
        fail: () => {
          uni.hideLoading()
          uni.showToast({ title: '登录失败', icon: 'none' })
        }
      })
      // #endif
    },

    // 切换登录方式
    switchTab(type) {
      if (this.loginType === type) return
      this.loginType = type
    },

    // 密码登录
    async onPwdLogin() {
      const loginRes = await authApi.passwordLogin({ account: this.form.account, password: this.form.password, clientType: 'h5', appId: globalConfig.appId })
      if (loginRes?.data?.code === 0) {
        const data = loginRes.data.data
        this.saveUserInfo({ ...data.user, accessToken: data.accessToken })
        return
      }
      if (!this.form.account) {
        return uni.showToast({ title: '请输入工号或手机号', icon: 'none' })
      }
      if (!this.form.password) {
        return uni.showToast({ title: '请输入密码', icon: 'none' })
      }
      if (this.form.password !== '123456') {
        return uni.showToast({ title: '演示账号密码为 123456', icon: 'none' })
      }
      const localUser = this.resolveLocalLogin(this.form.account)
      if (localUser) {
        this.saveUserInfo(localUser)
        return
      }
      uni.showToast({ title: '账号未绑定教职工角色', icon: 'none' })
    },

    // 短信登录
    async onSmsLogin() {
      const loginRes = await authApi.smsLogin({ phone: this.form.phone, code: this.form.code, smsToken: this.smsToken, clientType: 'h5', appId: globalConfig.appId })
      if (loginRes?.data?.code === 0) {
        const data = loginRes.data.data
        this.saveUserInfo({ ...data.user, accessToken: data.accessToken })
        return
      }
      if (!this.form.phone) {
        return uni.showToast({ title: '请输入手机号', icon: 'none' })
      }
      if (!this.form.code) {
        return uni.showToast({ title: '请输入验证码', icon: 'none' })
      }
      if (this.form.code !== '123456') {
        return uni.showToast({ title: '演示验证码为 123456', icon: 'none' })
      }
      const localUser = this.resolveLocalLogin(this.form.phone)
      if (localUser) {
        this.saveUserInfo(localUser)
        return
      }
      uni.showToast({ title: '手机号未绑定教师或财务职工角色', icon: 'none' })
    },

    // 发送验证码
    async onSendCode() {
      if (this.codeSending) return
      if (!this.form.phone) {
        return uni.showToast({ title: '请先输入手机号', icon: 'none' })
      }
      if (!this.resolveLocalLogin(this.form.phone)) {
        return uni.showToast({ title: '请输入演示账号绑定手机号', icon: 'none' })
      }
      const smsRes = await authApi.sendSmsCode({ phone: this.form.phone, scene: 'login' })
      if (smsRes?.data?.code !== 0) return uni.showToast({ title: smsRes?.data?.message || '验证码发送失败', icon: 'none' })
      this.smsToken = smsRes.data.data.smsToken
      this.codeSending = true
      let s = 60
      this.codeText = s + 's后重发'
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      this.codeTimer = setInterval(() => {
        s--
        if (s <= 0) {
          clearInterval(this.codeTimer)
          this.codeTimer = null
          this.codeText = '获取验证码'
          this.codeSending = false
        } else {
          this.codeText = s + 's后重发'
        }
      }, 1000)
    },

    resolveLocalLogin(account) {
      const normalized = String(account || '').trim().toLowerCase()
      const users = {
        1001: { role: 'teacher', type: 2, name: '刘晓华', userId: 'staff_teacher_001', phone: '13800138000', subRole: 'head_teacher', permissions: ['teacher:overview','teacher:fee-list','teacher:student-detail','teacher:urge','teacher:aid-list','teacher:loan-list','teacher:doc-review','teacher:dorm-view','teacher:checkin'], dataScope: { type: 'class', classId: 'class-2026-1' } },
        teacher: { role: 'teacher', type: 2, name: '刘晓华', userId: 'staff_teacher_001', phone: '13800138000', subRole: 'head_teacher', permissions: ['teacher:overview','teacher:fee-list','teacher:student-detail','teacher:urge','teacher:aid-list','teacher:loan-list','teacher:doc-review','teacher:dorm-view','teacher:checkin'], dataScope: { type: 'class', classId: 'class-2026-1' } },
        t2026001: { role: 'teacher', type: 2, name: '刘晓华', userId: 'staff_teacher_001', phone: '13800138000', subRole: 'head_teacher', permissions: ['teacher:overview','teacher:fee-list','teacher:student-detail','teacher:urge','teacher:aid-list','teacher:loan-list','teacher:doc-review','teacher:dorm-view','teacher:checkin'], dataScope: { type: 'class', classId: 'class-2026-1' } },
        '13800138000': { role: 'teacher', type: 2, name: '刘晓华', userId: 'staff_teacher_001', phone: '13800138000', subRole: 'head_teacher', permissions: ['teacher:overview','teacher:fee-list','teacher:student-detail','teacher:urge','teacher:aid-list','teacher:loan-list','teacher:doc-review','teacher:dorm-view','teacher:checkin'], dataScope: { type: 'class', classId: 'class-2026-1' } },
        2001: { role: 'finance', type: 3, name: '陈美玲', userId: 'staff_finance_001', phone: '13800138001', subRole: 'fee_collector', permissions: ['finance:overview','finance:collect','finance:refund','finance:diff','finance:receipt','finance:urge','finance:payout'], dataScope: { type: 'all' } },
        finance: { role: 'finance', type: 3, name: '陈美玲', userId: 'staff_finance_001', phone: '13800138001', subRole: 'fee_collector', permissions: ['finance:overview','finance:collect','finance:refund','finance:diff','finance:receipt','finance:urge','finance:payout'], dataScope: { type: 'all' } },
        f2026001: { role: 'finance', type: 3, name: '陈美玲', userId: 'staff_finance_001', phone: '13800138001', subRole: 'fee_collector', permissions: ['finance:overview','finance:collect','finance:refund','finance:diff','finance:receipt','finance:urge','finance:payout'], dataScope: { type: 'all' } },
        '13800138001': { role: 'finance', type: 3, name: '陈美玲', userId: 'staff_finance_001', phone: '13800138001', subRole: 'fee_collector', permissions: ['finance:overview','finance:collect','finance:refund','finance:diff','finance:receipt','finance:urge','finance:payout'], dataScope: { type: 'all' } },
        2002: { role: 'finance', type: 3, name: '王建国', userId: 'staff_finance_002', phone: '13800138005', subRole: 'fee_approver', permissions: ['finance:overview','finance:aid-review','finance:loan-review','finance:stats'], dataScope: { type: 'all' } },
        '13800138005': { role: 'finance', type: 3, name: '王建国', userId: 'staff_finance_002', phone: '13800138005', subRole: 'fee_approver', permissions: ['finance:overview','finance:aid-review','finance:loan-review','finance:stats'], dataScope: { type: 'all' } },
        2003: { role: 'finance', type: 3, name: '赵迎新', userId: 'staff_checkin_001', phone: '13800138004', subRole: 'checkin_staff', permissions: ['finance:verify','finance:onsite','finance:checkin-stats'], dataScope: { type: 'all' } },
        '13800138004': { role: 'finance', type: 3, name: '赵迎新', userId: 'staff_checkin_001', phone: '13800138004', subRole: 'checkin_staff', permissions: ['finance:verify','finance:onsite','finance:checkin-stats'], dataScope: { type: 'all' } },
        3001: { role: 'government', type: 5, name: '周婷婷', userId: 'staff_gov_001', phone: '13800138002', subRole: 'student_affairs', permissions: ['gov:overview','gov:aid-final','gov:loan-final','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-global'], dataScope: { type: 'all' } },
        government: { role: 'government', type: 5, name: '周婷婷', userId: 'staff_gov_001', phone: '13800138002', subRole: 'student_affairs', permissions: ['gov:overview','gov:aid-final','gov:loan-final','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-global'], dataScope: { type: 'all' } },
        a2026001: { role: 'government', type: 5, name: '周婷婷', userId: 'staff_gov_001', phone: '13800138002', subRole: 'student_affairs', permissions: ['gov:overview','gov:aid-final','gov:loan-final','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-global'], dataScope: { type: 'all' } },
        '13800138002': { role: 'government', type: 5, name: '周婷婷', userId: 'staff_gov_001', phone: '13800138002', subRole: 'student_affairs', permissions: ['gov:overview','gov:aid-final','gov:loan-final','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-global'], dataScope: { type: 'all' } },
        3002: { role: 'government', type: 5, name: '李明远', userId: 'staff_gov_002', phone: '13800138003', subRole: 'college_dean', permissions: ['gov:overview','gov:aid-review','gov:loan-review','gov:dorm-view','gov:stats-college'], dataScope: { type: 'college', collegeId: 'college-cs' } },
        '13800138003': { role: 'government', type: 5, name: '李明远', userId: 'staff_gov_002', phone: '13800138003', subRole: 'college_dean', permissions: ['gov:overview','gov:aid-review','gov:loan-review','gov:dorm-view','gov:stats-college'], dataScope: { type: 'college', collegeId: 'college-cs' } }
      }
      const matched = users[normalized]
      if (!matched) return null
      return {
        userId: matched.userId,
        name: matched.name,
        nickName: matched.name,
        type: matched.type,
        typeList: [matched.type],
        hasType: true,
        accessToken: `staff_token_${matched.role}_${Date.now()}`,
        phone: matched.phone,
        requestUserInfo: false,
        verified: true,
        subRole: matched.subRole || '',
        permissions: matched.permissions || [],
        dataScope: matched.dataScope || { type: 'all' }
      }
    },

    // 微信获取用户信息
    onGetUserInfo(e) {
      if (e.detail.errMsg === 'getUserInfo:ok') {
        uni.showLoading({ title: '登录中...', mask: true })
        uni.login({
          success: (res) => { this.login(_.get(res, 'code')) },
          fail: () => {
            uni.hideLoading()
            uni.showToast({ title: '登录失败', icon: 'none' })
          }
        })
      }
    },

    login(auth) {
      const inviteData = uni.getStorageSync('inviteData') || {}
      let data = {
        auth: auth,
        type: 16,
        app: 1,
        ...(_.get(inviteData, 'inviteCode') && !_.get(inviteData, 'isInvited')) || inviteData.isChangeCommunity
          ? _.pick(inviteData, ['inviteCode', 'communityId', 'orgId'])
          : {},
        ...inviteData.isChangeCommunity ? { isChangeCommunity: true } : {}
      }

      let requestUrl = '/api/oauth/wxapp/login'
      if ((_.get(inviteData, 'inviteCode') && !_.get(inviteData, 'isInvited')) || inviteData.isChangeCommunity) {
        requestUrl = '/api/u/login'
      }

      uni.request({
        url: `${globalConfig.endpoint}${requestUrl}`,
        header: { 'content-type': 'application/json' },
        data: data,
        method: 'POST',
        success: (res) => {
          if (_.get(res, 'data.code') === 200) {
            this.saveUserInfo(_.cloneDeep(_.get(res, 'data.data')) || {})
          } else {
            uni.hideLoading()
            this.loading = false
            uni.showToast({ title: _.get(res, 'data.message') || '登录失败，请重试', icon: 'none', duration: 3000 })
          }
        },
        fail: () => {
          uni.hideLoading()
          this.loading = false
          uni.showToast({ title: '网络错误，请检查网络连接', icon: 'none', duration: 3000 })
        }
      })
    },

    saveUserInfo(userInfo) {
      // #ifdef H5
      if (debugConfig.simulateNewUser) {
        userInfo = _.cloneDeep(userInfo)
        userInfo.orgId = null
        userInfo.hasOrgId = false
        userInfo.orgName = null
        userInfo.communityId = null
        userInfo.communityName = null
      }
      // #endif

      const query = {
        nickName: userInfo.name || userInfo.nickName,
        avatar: userInfo.avatar,
        userId: userInfo.userId,
        type: userInfo.type,
        typeList: userInfo.userTypeList || userInfo.typeList,
        hasType: userInfo.hasType,
        orgId: userInfo.orgId,
        hasOrgId: userInfo.hasOrgId,
        orgName: userInfo.tenantName || userInfo.orgName,
        communityId: userInfo.communityId,
        communityName: userInfo.communityName,
        communityCode: userInfo.communityCode,
        phone: userInfo.phone,
        isSupplier: userInfo.isSupplier,
        inviteCode: userInfo.inviteCode,
        invitorId: userInfo.invitorId,
        realName: userInfo.realName,
        email: userInfo.email,
        openId: userInfo.openId,
        requestUserInfo: userInfo.requestUserInfo || false,
        verified: userInfo.verified,
        subRole: userInfo.subRole || '',
        permissions: userInfo.permissions || [],
        dataScope: userInfo.dataScope || { type: 'all' }
      }

      uni.setStorageSync(globalConfig.tokenStorageKey, userInfo.accessToken)
      this.$cache('userInfo', query, 3600 * 24 * 2)
      uni.setStorageSync('staff_sub_role', query.subRole || '')
      uni.setStorageSync('staff_data_scope', JSON.stringify(query.dataScope || { type: 'all' }))
      try { localStorage.setItem('staff_sub_role', query.subRole || '') } catch (e) { /* ignore */ }
      uni.setStorageSync('currentRole', resolveRole(query))
      uni.setStorageSync('allRoles', resolveAllRoles(query))
      uni.setStorageSync('communityData', _.pick(query, ['communityId', 'orgId']))

      const role = resolveRole(query)
      applyTheme(role)
      commonStore.commit('setUserInfo', query)
      commonStore.commit('updateState', {
        communityData: _.pick(query, ['communityId', 'orgId'])
      })

      uni.hideLoading()
      this.loading = false
      this.goToHome(query)
    },

    goToHome(userInfo) {
      const role = resolveRole(userInfo)
      let path = getRoleHomePage(role)

      if (role === 'student') {
        if (!userInfo.orgId) {
          path = '/pages/sub/choicePage/communityType'
        } else if (!userInfo.communityId) {
          path = '/pages/sub/choicePage/communityChildrenType'
        }
      }

      const redirectPage = uni.getStorageSync('loginRedirectPage')
      if (redirectPage) {
        path = redirectPage
        uni.removeStorageSync('loginRedirectPage')
      }

      // #ifdef H5
      try {
        const hash = '/#/' + path.replace(/^\//, '')
        window.location.replace(hash)
      } catch (e) {
        console.error('[跳转失败]', e)
        this.loading = false
        uni.showToast({ title: '跳转失败，请重试', icon: 'none' })
      }
      // #endif

      // #ifndef H5
      uni.reLaunch({
        url: path,
        fail: (err) => {
          console.error('[跳转失败]', err)
          this.loading = false
          uni.showToast({ title: '跳转失败，请重试', icon: 'none' })
        }
      })
      // #endif
    }
  }
}
</script>

<style lang="scss" scoped>
/* ── §27 bind-wrap 布局 ── */
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--N50);
}

/* ── §27 bind-hero 品牌头部 ── */
.login-hero {
  background: var(--brand);
  padding: 64rpx 48rpx 104rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}
.login-hero > * + * { margin-top: 12rpx; }

.login-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  background: rgba(255,255,255,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 56rpx;
  margin-bottom: 16rpx;
}

.login-hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #fff;
}

.login-hero-sub {
  font-size: 24rpx;
  color: rgba(255,255,255,.7);
  margin-top: 8rpx;
}

/* ── §27 bind-body 表单区域 ── */
.login-body {
  flex: 1;
  background: var(--N50);
  border-radius: 40rpx 40rpx 0 0;
  margin-top: -40rpx;
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* ── §9 登录方式切换 ── */
.login-tabs {
  display: flex;
  background: var(--N50);
  border: 1px solid var(--N200);
  border-radius: var(--r-10);
  padding: 6rpx;
  margin-bottom: 32rpx;
}
.login-tab {
  flex: 1;
  height: 64rpx;
  text-align: center;
  font-size: var(--fs-14);
  color: var(--N500);
  font-weight: 500;
  border-radius: var(--r-8);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .18s, color .18s, box-shadow .18s;
}
.login-tab:active {
  background: var(--white);
}
.login-tab-on {
  color: var(--brand);
  background: var(--white);
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,.10);
}
.login-tab-text { line-height: 1; }

/* ── §17 表单 ── */
.login-form {
  display: flex;
  flex-direction: column;
}
.login-form > * + * { margin-top: 24rpx; }

.form-item {
  display: flex;
  flex-direction: column;
}
.form-item > * + * { margin-top: 8rpx; }

.form-label {
  font-size: var(--fs-13);
  font-weight: 600;
  color: var(--N700);
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  border: 1.5px solid var(--N200);
  border-radius: var(--r-12);
  font-size: var(--fs-14);
  color: var(--N900);
  background: var(--white);
  box-sizing: border-box;
}

.pwd-hint {
  font-size: var(--fs-11);
  color: var(--N400);
  margin-top: -8rpx;
  padding-left: 4rpx;
}

/* 短信验证码行 */
.sms-row {
  display: flex;
}
.sms-row > * + * { margin-left: 16rpx; }
.sms-input { flex: 1; }
.sms-btn {
  height: 88rpx;
  padding: 0 24rpx;
  border-radius: var(--r-12);
  background: var(--brand-t);
  color: var(--brand);
  font-size: var(--fs-13);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
}
.sms-btn:active { opacity: 0.8; }
.sms-btn-disabled {
  color: var(--N400);
  background: var(--N50);
  border: 1px solid var(--N200);
}

.demo-card {
  margin-top: 32rpx;
  background: var(--white);
  border-radius: var(--r-14);
  border: 1px solid rgba(0,0,0,.07);
  box-shadow: var(--card-shadow);
  overflow: hidden;
}
.demo-head {
  padding: 24rpx 28rpx;
  border-bottom: 1px solid var(--N50);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.demo-title {
  font-size: var(--fs-15);
  font-weight: 600;
  color: var(--N900);
}
.demo-sub {
  font-size: var(--fs-11);
  color: var(--N500);
}
.demo-list { padding: 0 28rpx; }
.demo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--N50);
}
.demo-row:last-child { border-bottom: none; }
.demo-role,
.demo-account {
  display: flex;
  flex-direction: column;
}
.demo-account { align-items: flex-end; }
.demo-name,
.demo-main {
  font-size: var(--fs-13);
  color: var(--N900);
  font-weight: 600;
}
.demo-phone,
.demo-pass {
  margin-top: 4rpx;
  font-size: var(--fs-11);
  color: var(--N500);
}
.demo-code {
  display: block;
  padding: 20rpx 28rpx 24rpx;
  background: var(--brand-t);
  color: var(--brand);
  font-size: var(--fs-12);
  line-height: 1.5;
}

/* ── §18 主按钮 ── */
.form-btn {
  width: 100%;
  height: 96rpx;
  background: var(--brand);
  color: #fff;
  border-radius: var(--r-12);
  font-size: var(--fs-15);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
}
.form-btn:active { background: var(--brand-d); }

/* ── 强制登录对话框 §26 BottomSheet ── */
.ovl {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0,0,0,.45);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  background: var(--white);
  border-radius: var(--r-14);
  padding: 48rpx 40rpx;
  margin: 0 80rpx;
  width: 100%;
  max-width: 600rpx;
}
.dialog > * + * { margin-top: 24rpx; }

.dialog-title {
  font-size: var(--fs-16);
  font-weight: 700;
  color: var(--N900);
  display: block;
  text-align: center;
}
.dialog-msg {
  font-size: var(--fs-13);
  color: var(--N500);
  display: block;
  text-align: center;
  line-height: 1.6;
}
.dialog-btns {
  display: flex;
  margin-top: 32rpx;
}
.dialog-btns > * + * { margin-left: 24rpx; }

.dialog-btn {
  flex: 1;
  height: 88rpx;
  border-radius: var(--r-12);
  font-size: var(--fs-14);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog-btn-cancel {
  background: var(--N50);
  color: var(--N500);
}
.dialog-btn-cancel:active { background: var(--N200); }
.dialog-btn-confirm {
  background: var(--brand);
  color: #fff;
}
.dialog-btn-confirm:active { background: var(--brand-d); }
</style>
