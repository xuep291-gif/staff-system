import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const reportApi = {
  // 收费进度报表
  getProgressReport(params) {
    return request('GET', `${BASE}/api/v1/reports/payment/progress`, params)
  },
  // 收费流水报表
  getTransactionReport(params) {
    return request('GET', `${BASE}/api/v1/reports/payment/transactions`, params)
  },
  // 支付方式统计
  getMethodReport(params) {
    return request('GET', `${BASE}/api/v1/reports/payment/methods`, params)
  },
  // 收费趋势分析
  getTrendReport(params) {
    return request('GET', `${BASE}/api/v1/reports/payment/trend`, params)
  },
  // 欠费统计
  getArrearsReport(params) {
    return request('GET', `${BASE}/api/v1/reports/payment/arrears`, params)
  },
  // 退费统计
  getRefundReport(params) {
    return request('GET', `${BASE}/api/v1/reports/refunds`, params)
  },
  // 补差退款统计
  getDiffRefundReport(params) {
    return request('GET', `${BASE}/api/v1/reports/diff-refunds`, params)
  },
  // 迎新大数据大屏
  getDashboardData() {
    return request('GET', `${BASE}/api/v1/reports/dashboard`)
  }
}
