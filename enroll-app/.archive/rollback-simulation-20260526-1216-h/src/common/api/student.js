import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

export const studentApi = {
  // 搜索学生
  searchStudents(params) {
    return request('GET', `${BASE}/api/v1/students/search`, params)
  },
  // 获取学生详情
  getStudentDetail(id) {
    return request('GET', `${BASE}/api/v1/students/${id}`)
  },
  // 获取班级学生列表
  getClassStudents(classId, params) {
    return request('GET', `${BASE}/api/v1/classes/${classId}/students`, params)
  },
  // 现场登记 - 创建学生缴费记录
  createOnsitePayment(params) {
    return request('POST', `${BASE}/api/v1/student/onsite/payment`, params)
  },
  // 获取学生住宿信息
  getStudentDormitory(studentId) {
    return request('GET', `${BASE}/api/v1/dormitories/students/${studentId}`)
  }
}
