import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

const REVIEW_COLORS = {
  pending: 'wa',
  first_pass: 'ok',
  review_pass: 'ok',
  final_pass: 'ok',
  payment_pending: 'wa',
  paid: 'ok',
  completed: 'ok',
  rejected: 'er'
}

function normalizeReviewItem(item, type) {
  const student = item.student || {}
  const uid = type === 'loan' ? item.loanId : item.scholarshipId
  return {
    ...item,
    uid: item.uid || uid,
    id: item.id || student.studentId || item.studentId,
    sid: item.sid || student.studentNo || item.studentNo,
    name: item.name || student.name || item.studentName,
    avatar: item.avatar || (student.name || item.studentName || '').charAt(0),
    type: item.type || item.loanTypeLabel,
    date: item.date || (item.submittedAt || '').slice(0, 10),
    className: item.className || student.className,
    badgeColor: item.badgeColor || REVIEW_COLORS[item.status] || 'wa'
  }
}

function normalizeReviewList(type) {
  return res => {
    const data = res?.data
    if (!data) return res
    const rawList = data.list || data.items || []
    const normalized = rawList.map(item => normalizeReviewItem(item, type))
    data.list = normalized
    data.items = normalized
    return res
  }
}

function normalizeReviewDetail(type) {
  return res => {
    let data = res?.data
    if (!data) return res
    if (data.data && !data.name && !data.studentNo && !data.scholarshipId && !data.loanId && !data.student) {
      data = data.data
    }
    res.data = normalizeReviewItem(data, type)
    return res
  }
}

export const scholarshipApi = {
  // 获取助学金申请列表
  getScholarshipList(params) {
    return request('GET', `${BASE}/api/v1/scholarships`, params).then(normalizeReviewList('scholarship'))
  },
  // 获取助学金详情
  getScholarshipDetail(id) {
    return request('GET', `${BASE}/api/v1/scholarships/${id}`).then(normalizeReviewDetail('scholarship'))
  },
  // 审批通过
  approveScholarship(id, params) {
    return request('POST', `${BASE}/api/v1/scholarships/${id}/approve`, params)
  },
  // 审批拒绝
  rejectScholarship(id, params) {
    return request('POST', `${BASE}/api/v1/scholarships/${id}/reject`, params)
  },
  // 确认发放
  disburseScholarship(id, params) {
    return request('POST', `${BASE}/api/v1/scholarships/${id}/disburse`, params)
  },
  // 获取助学贷款列表
  getLoanList(params) {
    return request('GET', `${BASE}/api/v1/loans`, params).then(normalizeReviewList('loan'))
  },
  // 获取助学贷款详情
  getLoanDetail(id) {
    return request('GET', `${BASE}/api/v1/loans/${id}`).then(normalizeReviewDetail('loan'))
  },
  // 贷款审批
  approveLoan(id, params) {
    return request('POST', `${BASE}/api/v1/loans/${id}/approve`, params)
  },
  // 贷款拒绝
  rejectLoan(id, params) {
    return request('POST', `${BASE}/api/v1/loans/${id}/reject`, params)
  },
  disburseLoan(id, params) {
    return request('POST', `${BASE}/api/v1/loans/${id}/disburse`, params)
  }
}
