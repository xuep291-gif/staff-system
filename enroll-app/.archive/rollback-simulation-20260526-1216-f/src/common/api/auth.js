import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const authApi = {
  passwordLogin(params) {
    return request('POST', `${BASE}/api/v1/auth/login/password`, params)
  },
  sendSmsCode(params) {
    return request('POST', `${BASE}/api/v1/auth/sms-code`, params)
  },
  smsLogin(params) {
    return request('POST', `${BASE}/api/v1/auth/login/sms`, params)
  },
  wechatMiniappLogin(params) {
    return request('POST', `${BASE}/api/v1/auth/login/wechat-miniapp`, params)
  },
  refreshToken(params) {
    return request('POST', `${BASE}/api/v1/auth/refresh`, params)
  },
  getCurrentUser() {
    return request('GET', `${BASE}/api/v1/auth/me`)
  },
  switchRole(params) {
    return request('POST', `${BASE}/api/v1/auth/switch-role`, params)
  },
  logout(params = {}) {
    return request('POST', `${BASE}/api/v1/auth/logout`, params)
  },
  bindPhone(params) {
    return request('POST', `${BASE}/api/v1/account/phone/bind`, params)
  },
  changePhone(params) {
    return request('PUT', `${BASE}/api/v1/account/phone`, params)
  },
  changePassword(params) {
    return request('PUT', `${BASE}/api/v1/account/password`, params)
  }
}
