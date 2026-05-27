import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

function normalizeReview(item) {
  return {
    ...item,
    uid: item.uid || item.documentReviewId,
    id: item.id || item.studentNo,
    sid: item.sid || item.studentNo,
    name: item.name || item.studentName,
    avatar: item.avatar || (item.studentName || '').charAt(0),
    time: item.time || item.submittedAt,
    tags: item.tags || item.materialTags || []
  }
}

function normalizeReviewList(res) {
  const data = res?.data?.data
  if (!data || data.list || !Array.isArray(data.items)) return res
  data.list = data.items.map(normalizeReview)
  return res
}

function normalizeReviewDetail(res) {
  const data = res?.data?.data
  if (!data || data.name) return res
  const student = data.student || {}
  res.data.data = normalizeReview({
    ...data,
    studentName: student.name,
    studentNo: student.studentNo,
    className: student.className,
    college: student.college
  })
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
