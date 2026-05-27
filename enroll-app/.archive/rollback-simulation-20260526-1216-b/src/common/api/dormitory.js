import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

const DORM_COLORS = { pending: 'wa', approved: 'ok', rejected: 'er' }

function formatDorm(value) {
  if (!value) return '-'
  if (typeof value === 'string') return value
  return [value.building || value.buildingName, value.room || value.roomNo, value.bed || value.bedNo].filter(Boolean).join(' ')
}

function normalizeDormStudent(item) {
  return {
    ...item,
    sid: item.sid || item.studentNo,
    name: item.name || item.studentName || '未知学生',
    building: item.building || item.buildingName || '未分配',
    room: item.room || item.roomNo || '-',
    bed: item.bed || item.bedNo || '-',
    dorm: item.dorm || item.dormText || '',
    assigned: item.status === 'assigned'
  }
}

function normalizeDormApplication(item) {
  const student = item.student || {}
  return {
    ...item,
    uid: item.uid || item.applicationId,
    applicationId: item.applicationId || item.uid,
    id: item.id || item.studentNo || student.studentNo,
    sid: item.sid || item.studentNo || student.studentNo,
    name: item.name || item.studentName || student.studentName || '未知学生',
    phone: item.phone || student.phone || '-',
    className: item.className || student.className || '2026级1班',
    avatar: item.avatar || (item.studentName || student.studentName || '?').charAt(0),
    oldDorm: formatDorm(item.oldDorm || item.currentDorm),
    targetDorm: formatDorm(item.targetDorm),
    currentDorm: formatDorm(item.currentDorm),
    statusLabel: item.statusLabel || ({ pending: '待审核', approved: '已通过', rejected: '已驳回' }[item.status] || item.status),
    badgeColor: item.badgeColor || DORM_COLORS[item.status] || 'wa',
    logs: item.logs || item.auditLogs || []
  }
}

function normalizeList(mapper) {
  return res => {
    const data = res?.data?.data
    const rows = data?.list || data?.items
    if (data && Array.isArray(rows)) data.list = rows.map(mapper)
    return res
  }
}

function normalizeDetail(mapper) {
  return res => {
    if (res?.data?.data) res.data.data = mapper(res.data.data)
    return res
  }
}

export const dormitoryApi = {
  // 获取宿舍列表
  getDormitoryList(params) {
    return request('GET', `${BASE}/api/v1/dormitories/students`, params).then(normalizeList(normalizeDormStudent))
  },
  // 获取选宿统计
  getDormitoryStats() {
    return request('GET', `${BASE}/api/v1/dormitory/stats`)
  },
  // 获取学生选宿信息
  getStudentDormSelection(studentId) {
    return request('GET', `${BASE}/api/v1/dormitories/students/${studentId}`).then(normalizeDetail(item => normalizeDormStudent({
      ...item,
      ...(item.student || {}),
      ...(item.currentDorm || {})
    })))
  },
  // 分配宿舍
  assignDormitory(params) {
    return request('POST', `${BASE}/api/v1/dormitory/assign`, params)
  },
  // 宿舍楼栋列表
  getBuildingList() {
    return request('GET', `${BASE}/api/v1/dormitories/buildings`)
  },
  // 宿舍房间列表
  getRoomList(buildingId) {
    return request('GET', `${BASE}/api/v1/dormitories/buildings/${buildingId}/rooms`)
  },
  getRoomChangeApplications(params) {
    return request('GET', `${BASE}/api/v1/dormitory/room-change-applications`, params).then(normalizeList(normalizeDormApplication))
  },
  getRoomChangeDetail(id) {
    return request('GET', `${BASE}/api/v1/dormitory/room-change-applications/${id}`).then(normalizeDetail(normalizeDormApplication))
  },
  approveRoomChange(id, params) {
    return request('POST', `${BASE}/api/v1/dormitory/room-change-applications/${id}/approve`, params)
  },
  rejectRoomChange(id, params) {
    return request('POST', `${BASE}/api/v1/dormitory/room-change-applications/${id}/reject`, params)
  },
  getWithdrawApplications(params) {
    return request('GET', `${BASE}/api/v1/dormitory/withdraw-applications`, params).then(normalizeList(normalizeDormApplication))
  },
  getWithdrawDetail(id) {
    return request('GET', `${BASE}/api/v1/dormitory/withdraw-applications/${id}`).then(normalizeDetail(normalizeDormApplication))
  },
  approveWithdraw(id, params) {
    return request('POST', `${BASE}/api/v1/dormitory/withdraw-applications/${id}/approve`, params)
  },
  rejectWithdraw(id, params) {
    return request('POST', `${BASE}/api/v1/dormitory/withdraw-applications/${id}/reject`, params)
  }
}
