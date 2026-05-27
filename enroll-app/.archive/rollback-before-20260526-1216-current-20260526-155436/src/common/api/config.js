import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const configApi = {
  // 获取收费主体列表
  getFeeSubjects(params) {
    return request('GET', `${BASE}/api/v1/config/fee-subjects`, params)
  },
  // 创建收费主体
  createFeeSubject(params) {
    return request('POST', `${BASE}/api/v1/config/fee-subject`, params)
  },
  // 更新收费主体
  updateFeeSubject(id, params) {
    return request('PUT', `${BASE}/api/v1/config/fee-subject/${id}`, params)
  },
  // 获取收费项目列表
  getFeeItems(params) {
    return request('GET', `${BASE}/api/v1/config/fee-items`, params)
  },
  // 创建收费项目
  createFeeItem(params) {
    return request('POST', `${BASE}/api/v1/config/fee-item`, params)
  },
  // 更新收费项目
  updateFeeItem(id, params) {
    return request('PUT', `${BASE}/api/v1/config/fee-item/${id}`, params)
  },
  // 获取收费标准（按专业/个人）
  getFeeStandards(params) {
    return request('GET', `${BASE}/api/v1/config/fee-standards`, params)
  },
  // 设置收费标准
  setFeeStandard(params) {
    return request('POST', `${BASE}/api/v1/config/fee-standard`, params)
  },
  // 批量设置收费标准
  batchSetFeeStandards(params) {
    return request('POST', `${BASE}/api/v1/config/fee-standards/batch`, params)
  }
}
