import { request, upLoad } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const fileApi = {
  upload(filePath, params = {}, name = 'file') {
    return upLoad(`${BASE}/api/v1/files/upload`, filePath, params, name)
  },
  preview(fileId, params) {
    return request('GET', `${BASE}/api/v1/files/${fileId}/preview`, params)
  },
  download(fileId, params) {
    return request('GET', `${BASE}/api/v1/files/${fileId}/download`, params)
  },
  packageMaterials(params) {
    return request('POST', `${BASE}/api/v1/files/package`, params)
  },
  getMaterials(bizType, bizId, params) {
    return request('GET', `${BASE}/api/v1/materials/${bizType}/${bizId}`, params)
  }
}
