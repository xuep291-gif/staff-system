import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const messageApi = {
  // 获取消息列表
  getMessageList(params) {
    return request('GET', `${BASE}/api/v1/messages`, params)
  },
  // 获取未读消息数
  getUnreadCount(params = {}) {
    return request('GET', `${BASE}/api/v1/messages/unread-count`, params)
  },
  // 标记已读
  markRead(id) {
    return request('PUT', `${BASE}/api/v1/messages/${id}/read`)
  },
  // 全部标记已读
  markAllRead(params = {}) {
    return request('PUT', `${BASE}/api/v1/messages/read-all`, params)
  },
  deleteMessage(id) {
    return request('DELETE', `${BASE}/api/v1/messages/${id}`)
  },
  clearMessages(params) {
    return request('DELETE', `${BASE}/api/v1/messages`, params)
  },
  // 获取通知模板列表（管理端）
  getTemplateList(params) {
    return request('GET', `${BASE}/api/v1/messages/templates`, params)
  },
  // 创建通知模板
  createTemplate(params) {
    return request('POST', `${BASE}/api/v1/messages/templates`, params)
  },
  // 发送通知
  sendNotification(params) {
    return request('POST', `${BASE}/api/v1/messages/send`, params)
  },
  // 获取发送记录
  getSendRecords(params) {
    return request('GET', `${BASE}/api/v1/messages/send-records`, params)
  }
}
