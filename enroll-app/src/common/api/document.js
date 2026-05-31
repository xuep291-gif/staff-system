import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

function normalizeMaterialReview(item) {
  if (!item) return item

  const student = item.student || {}

  const formatTime = (raw) => {
    if (!raw) return '暂无'
    const str = String(raw)
    const m = str.match(/(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/)
    if (m) return `${m[1]}-${m[2]} ${m[3]}:${m[4]}`
    return '暂无'
  }

  const materialLabelMap = {
    id_card: '身份证',
    admission_notice: '录取通知书',
    household_register: '户口本',
    photo: '证件照'
  }
  const rawMaterials = item.materialTags || item.materials || []
  const materialList = rawMaterials.map(m => {
    if (typeof m === 'string') return materialLabelMap[m] || m
    return m.label || m.fileName || m.name || '未知材料'
  })
  const defaultMaterials = ['身份证', '录取通知书', '户口本', '证件照']
  const materialTags = materialList.length > 0 ? materialList : defaultMaterials

  const statusMap = {
    pending: { label: '待审核', color: 'wa' },
    first_pass: { label: '已通过', color: 'ok' },
    department_review: { label: '已通过', color: 'ok' },
    final_pass: { label: '已通过', color: 'ok' },
    rejected: { label: '已退回', color: 'er' }
  }
  const status = item.status || 'pending'
  const sm = statusMap[status] || statusMap.pending

  const name = item.name || item.studentName || student.name || '暂无'
  const studentNo = item.studentNo || student.studentNo || item.id || item.sid || '暂无'
  const college = item.college || student.college || '暂无'
  const className = item.className || student.className || '暂无'
  const submittedAt = formatTime(item.submittedAt || item.time || item.applyTime)

  return {
    ...item,
    id: studentNo,
    name,
    studentNo,
    collegeName: college,
    college,
    className,
    submittedAt,
    time: submittedAt,
    materialTags,
    tags: materialTags,
    materials: item.materials || rawMaterials,
    status,
    statusLabel: sm.label,
    badgeColor: sm.color,
    avatar: name.charAt(0),
    logs: item.auditLogs || item.logs || [],
    auditLogs: item.auditLogs || item.logs || [],
    uid: item.uid || item.documentReviewId || item.id
  }
}

function normalizeReview(item) {
  return normalizeMaterialReview(item)
}

function normalizeReviewList(res) {
  const data = res?.data
  if (!data) return res
  const rawList = data.list || data.items || []
  const normalized = rawList.map(normalizeMaterialReview)
  data.list = normalized
  data.items = normalized
  return res
}

function normalizeReviewDetail(res) {
  let data = res?.data
  if (!data) return res
  // Handle double-nested response: { data: { data: { actual } } }
  if (data.data && !data.name && !data.studentNo && !data.documentReviewId && !data.student) {
    data = data.data
  }
  res.data = normalizeMaterialReview(data)
  return res
}

export const documentApi = {
  getReviewList(params) {
    return request('GET', `${BASE}/api/v1/documents/reviews`, params).then(normalizeReviewList)
  },
  getReviewDetail(id) {
    return request('GET', `${BASE}/api/v1/documents/reviews/${id}`).then(normalizeReviewDetail)
  },
  approveReview(id, params) {
    return request('POST', `${BASE}/api/v1/documents/reviews/${id}/approve`, params)
  },
  rejectReview(id, params) {
    return request('POST', `${BASE}/api/v1/documents/reviews/${id}/reject`, params)
  },
  getMaterials(bizType, bizId, params) {
    return request('GET', `${BASE}/api/v1/materials/${bizType}/${bizId}`, params)
  }
}
