import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const dashboardApi = {
  getTeacherDashboard(params) {
    return request('GET', `${BASE}/api/v1/dashboard/teacher`, params)
  },
  getFinanceDashboard(params) {
    return request('GET', `${BASE}/api/v1/dashboard/finance`, params)
  },
  getGovernmentDashboard(params) {
    return request('GET', `${BASE}/api/v1/dashboard/government`, params)
  },
  getSummary(params) {
    return request('GET', `${BASE}/api/v1/statistics/summary`, params)
  }
}
