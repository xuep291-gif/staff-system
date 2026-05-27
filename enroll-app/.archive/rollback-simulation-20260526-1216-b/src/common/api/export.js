import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const exportApi = {
  createTask(params) {
    return request('POST', `${BASE}/api/v1/export/tasks`, params)
  },
  getTask(taskId) {
    return request('GET', `${BASE}/api/v1/export/tasks/${taskId}`)
  },
  download(taskId) {
    return request('GET', `${BASE}/api/v1/export/tasks/${taskId}/download`)
  }
}
