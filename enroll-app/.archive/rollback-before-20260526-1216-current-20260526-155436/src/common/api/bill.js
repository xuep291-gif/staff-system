import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const billApi = {
  // 获取账单列表
  getBillList(params) {
    return request('GET', `${BASE}/api/v1/bill/list`, params)
  },
  // 获取账单详情
  getBillDetail(id) {
    return request('GET', `${BASE}/api/v1/bill/${id}`)
  },
  // 创建账单
  createBill(params) {
    return request('POST', `${BASE}/api/v1/bill`, params)
  },
  // 批量生成账单
  batchCreateBills(params) {
    return request('POST', `${BASE}/api/v1/bill/batch`, params)
  },
  // 手动触发生成账单
  triggerBillGeneration(params) {
    return request('POST', `${BASE}/api/v1/bill/generate`, params)
  },
  // 修改账单
  updateBill(id, params) {
    return request('PUT', `${BASE}/api/v1/bill/${id}`, params)
  },
  // 作废账单
  cancelBill(id) {
    return request('POST', `${BASE}/api/v1/bill/${id}/cancel`)
  },
  // 减免账单
  exemptBill(id, params) {
    return request('POST', `${BASE}/api/v1/bill/${id}/exempt`, params)
  }
}
