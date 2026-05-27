import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const reminderApi = {
  // 发送催缴通知（单条）
  sendReminder(params) {
    return request('POST', `${BASE}/api/v1/reminders/send`, params)
  },
  // 批量催缴
  batchSendReminder(params) {
    return request('POST', `${BASE}/api/v1/reminders/batch`, params)
  },
  // 获取催缴任务列表
  getUrgeTaskList(params) {
    return request('GET', `${BASE}/api/v1/reminders/tasks`, params)
  },
  // 创建催缴任务
  createUrgeTask(params) {
    return request('POST', `${BASE}/api/v1/reminders/tasks`, params)
  },
  // 获取催缴记录
  getReminderRecords(params) {
    return request('GET', `${BASE}/api/v1/reminders/records`, params)
  },
  // 获取逾期学生列表
  getOverdueStudents(params) {
    return request('GET', `${BASE}/api/v1/payments/students`, { ...params, status: 'overdue' })
  }
}
