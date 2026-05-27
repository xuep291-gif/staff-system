import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const onsiteStaffApi = {
  // 查询学生缴费状态
  verifyPayment(params) {
    return request('GET', `${BASE}/api/staff/checkin/payment/verify`, params)
  },

  // 记录核验日志
  logVerify(params) {
    return request('POST', `${BASE}/api/staff/checkin/payment/verify-log`, params)
  },

  // 现场收款登记
  registerOfflinePayment(params) {
    return request('POST', `${BASE}/api/staff/checkin/offline-payment`, params)
  },

  // 最近核验记录
  getVerifyLogs(params) {
    return request('GET', `${BASE}/api/staff/checkin/payment/verify-logs`, params)
  }
}
