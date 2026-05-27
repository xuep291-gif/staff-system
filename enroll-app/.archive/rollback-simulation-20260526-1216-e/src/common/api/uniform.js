import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const uniformApi = {
  getSizes(params) {
    return request('GET', `${BASE}/api/v1/uniform/sizes`, params)
  },
  getSizeDetail(studentId) {
    return request('GET', `${BASE}/api/v1/uniform/sizes/${studentId}`)
  },
  getStatistics(params) {
    return request('GET', `${BASE}/api/v1/uniform/sizes/statistics`, params)
  },
  getSupplyRecords(params) {
    return request('GET', `${BASE}/api/v1/supplies/distribution-records`, params)
  }
}
