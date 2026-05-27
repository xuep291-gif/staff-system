import { request } from '@/common/request.js'
import { globalConfig } from '@/config.js'

const BASE = globalConfig.endpoint

const PAYMENT_COLORS = { overdue: 'er', unpaid: 'wa', partial: 'in', paid: 'ok', green_channel: 'pu', channel: 'pu' }

function normalizePaymentList(res) {
  const data = res?.data?.data
  const rows = data?.list || data?.items
  if (!data || !Array.isArray(rows)) return res
  data.list = rows.map(item => {
    const payStatus = item.paymentStatus === 'green_channel' ? 'channel' : item.paymentStatus
    return {
      ...item,
      payStatus: item.payStatus || payStatus,
      studentNo: item.studentNo || item.sid,
      name: item.name || item.studentName || '未知学生',
      amount: Number(item.unpaidAmount || item.receivableAmount || 0).toLocaleString(),
      daysLabel: payStatus === 'overdue' ? '逾期未缴费' : item.statusLabel,
      statusLabel: item.statusLabel || ({ unpaid: '未缴', overdue: '逾期', partial: '部分未缴', paid: '已缴', channel: '绿通' }[payStatus] || '未缴'),
      statusColor: PAYMENT_COLORS[payStatus] || 'wa',
      avatarBg: `var(--${PAYMENT_COLORS[payStatus] || 'wa'}-bg)`
    }
  })
  return res
}

function normalizeOfflineList(res) {
  const data = res?.data?.data
  const rows = data?.list || data?.items
  if (!data || !Array.isArray(rows)) return res
  data.list = rows.map(item => ({
    ...item,
    id: item.id || item.offlinePaymentId,
    name: item.name || item.studentName,
    avatar: item.avatar || (item.studentName || '').charAt(0),
    time: item.time || (item.submittedAt || '').replace('T', ' ').slice(0, 16)
  }))
  return res
}

export const paymentApi = {
  // 获取班级缴费统计
  getClassStats(params) {
    return request('GET', `${BASE}/api/v1/payments/class-stats`, params)
  },
  // 获取学生缴费列表
  getStudentPayments(params) {
    return request('GET', `${BASE}/api/v1/payments/students`, params).then(normalizePaymentList)
  },
  // 获取学生缴费详情
  getStudentPaymentDetail(studentId) {
    return request('GET', `${BASE}/api/v1/payments/students/${studentId}`)
  },
  // 获取学生账单明细
  getStudentBills(studentId) {
    return request('GET', `${BASE}/api/v1/payments/students/${studentId}/bills`)
  },
  // 获取学生缴费记录
  getStudentPayRecords(studentId) {
    return request('GET', `${BASE}/api/v1/payments/students/${studentId}/records`)
  },
  // 线下收款确认
  confirmOfflinePayment(params) {
    return request('POST', `${BASE}/api/v1/payments/offline/${params.offlinePaymentId || params.id}/confirm`, params)
  },
  // 获取待确认线下收款列表
  getPendingOfflinePayments(params) {
    return request('GET', `${BASE}/api/v1/payments/offline/pending`, params).then(normalizeOfflineList)
  },
  // 收款记录查询
  getPaymentRecords(params) {
    return request('GET', `${BASE}/api/v1/reports/payment/transactions`, params)
  },
  // 现场核验 - 通过学号查询缴费状态
  verifyByStudentNo(studentNo) {
    return request('GET', `${BASE}/api/v1/payments/students/${studentNo}`)
  }
}
