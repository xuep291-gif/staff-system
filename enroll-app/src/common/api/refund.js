import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

const REFUND_COLORS = { pending: 'wa', approved: 'wa', processing: 'wa', refunded: 'ok', failed: 'er', rejected: 'er' }

function normalizeRefund(item) {
  return {
    ...item,
    uid: item.uid || item.refundId,
    name: item.name || item.studentName,
    sid: item.sid || item.studentNo,
    type: item.type || item.feeType,
    statusLabel: item.statusLabel || item.statusText || item.status,
    badgeColor: item.badgeColor || REFUND_COLORS[item.status] || 'wa'
  }
}

function normalizeRefundList(res) {
  const data = res?.data?.data
  if (!data || data.list || !Array.isArray(data.items)) return res
  data.list = data.items.map(normalizeRefund)
  return res
}

function normalizeRefundDetail(res) {
  if (res?.data?.data) res.data.data = normalizeRefund(res.data.data)
  return res
}

export const refundApi = {
  // 获取退费列表
  getRefundList(params) {
    return request('GET', `${BASE}/api/v1/refunds`, params).then(normalizeRefundList)
  },
  // 获取退费详情
  getRefundDetail(id) {
    return request('GET', `${BASE}/api/v1/refunds/${id}`).then(normalizeRefundDetail)
  },
  // 退费审核
  approveRefund(id, params) {
    return request('POST', `${BASE}/api/v1/refunds/${id}/approve`, params)
  },
  // 退费拒绝
  rejectRefund(id, params) {
    return request('POST', `${BASE}/api/v1/refunds/${id}/reject`, params)
  },
  // 执行退费
  executeRefund(id) {
    return request('POST', `${BASE}/api/v1/refunds/${id}/execute`)
  },
  // 退费失败重试
  retryRefund(id) {
    return request('POST', `${BASE}/api/v1/refunds/${id}/retry`)
  },
  // 获取补差退款列表
  getDiffRefundList(params) {
    return request('GET', `${BASE}/api/v1/refunds/diff`, params)
  },
  // 确认补差退款
  confirmDiffRefund(id, params) {
    return request('POST', `${BASE}/api/v1/refunds/diff/${id}/confirm`, params)
  },
  // 退费记录查询
  getRefundRecords(params) {
    return request('GET', `${BASE}/api/v1/finance/processed-records`, params)
  }
}
