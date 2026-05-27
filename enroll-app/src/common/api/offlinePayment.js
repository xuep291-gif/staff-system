import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const offlinePaymentApi = {
  // 搜索学生账单（按学号或姓名）
  searchStudent(keyword) {
    return request('GET', `${BASE}/api/v1/finance/offline-payment/search-student`, { keyword })
  },

  // 查询学生账单（按学号）
  getStudentBill(studentNo) {
    return request('GET', `${BASE}/api/v1/finance/offline-payment/student-bill`, { studentNo })
  },

  // 提交现场收款登记
  registerPayment(params) {
    return request('POST', `${BASE}/api/v1/finance/offline-payment/register`, params)
  },

  // 查询线下收款记录列表
  getList(params) {
    return request('GET', `${BASE}/api/v1/finance/offline-payment/list`, params)
  },

  // 确认线下收款
  confirmPayment(id, params) {
    return request('POST', `${BASE}/api/v1/finance/offline-payment/confirm`, { id, ...params })
  },

  // 作废收款单据
  voidPayment(id, params) {
    return request('POST', `${BASE}/api/v1/finance/offline-payment/void`, { id, ...params })
  }
}
