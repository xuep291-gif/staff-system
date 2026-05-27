import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const checkinApi = {
  getStatistics(params) {
    return request('GET', `${BASE}/api/v1/checkin/statistics`, params)
  },
  getStudentList(params) {
    return request('GET', `${BASE}/api/v1/checkin/students`, params)
  },
  confirm(studentId, params) {
    return request('POST', `${BASE}/api/v1/checkin/students/${studentId}/confirm`, params)
  },
  cancel(studentId, params) {
    return request('POST', `${BASE}/api/v1/checkin/students/${studentId}/cancel`, params)
  },
  delay(studentId, params) {
    return request('POST', `${BASE}/api/v1/checkin/students/${studentId}/delay`, params)
  },
  block(studentId, params) {
    return request('POST', `${BASE}/api/v1/checkin/students/${studentId}/block`, params)
  }
}
