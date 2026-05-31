/**
 * businessApi — API-backed replacements for businessState data functions.
 * Each function calls the real backend API and returns data in the same shape
 * that pages expect from businessState.
 */
import { studentApi } from '@/common/api/student.js'
import { paymentApi } from '@/common/api/payment.js'
import { scholarshipApi } from '@/common/api/scholarship.js'
import { documentApi } from '@/common/api/document.js'
import { dormitoryApi } from '@/common/api/dormitory.js'
import { refundApi } from '@/common/api/refund.js'
import { checkinApi } from '@/common/api/checkin.js'
import { reminderApi } from '@/common/api/reminder.js'
import { messageApi } from '@/common/api/message.js'
import { uniformApi } from '@/common/api/uniform.js'
import { offlinePaymentApi } from '@/common/api/offlinePayment.js'
import { invoiceApi } from '@/common/api/invoice.js'
import { configApi } from '@/common/api/config.js'
import { billApi } from '@/common/api/bill.js'
import { onsiteStaffApi } from '@/common/api/onsiteStaff.js'
import { dashboardApi } from '@/common/api/dashboard.js'

// Cache for API results to avoid repeated calls
const cache = new Map()
function cached(key, fn, ttl = 30000) {
  const now = Date.now()
  const entry = cache.get(key)
  if (entry && now - entry.ts < ttl) return entry.val
  const val = fn()
  cache.set(key, { val, ts: now })
  return val
}
function clearCache(prefix) {
  for (const k of cache.keys()) { if (k.startsWith(prefix)) cache.delete(k) }
}

function unwrap(res) {
  if (res && res.code === 0) return res.data
  return null
}
function unwrapList(res) {
  const d = unwrap(res)
  if (!d) return []
  return d.items || d.list || []
}

// ─── Students ──────────────────────────────────────────────────────────
export function getStudents() {
  return cached('students', async () => {
    const res = await studentApi.searchStudents({ pageNum: 1, pageSize: 200 })
    const d = unwrap(res)
    const items = d?.items || []
    return items.map(s => ({
      id: s.studentId, student_no: s.studentNo, name: s.name,
      gender: s.gender, className: s.className, class_id: s.classId,
      phone: s.phone, parent_phone: s.parentPhone,
      dorm_text: s.dormText, checkin_status: s.checkinStatus,
      paymentStatus: s.paymentStatus,
    }))
  }, 30000)
}

export function getStudent(sid) {
  return cached('student_' + sid, async () => {
    const res = await studentApi.getStudentDetail(sid)
    const d = unwrap(res)
    if (!d) return null
    return { id: d.studentId, student_no: d.studentNo, name: d.name, gender: d.gender, className: d.className, phone: d.phone, dormitory: d.dormitory, paymentSummary: d.paymentSummary, documentSummary: d.documentSummary, aidSummary: d.aidSummary, loanSummary: d.loanSummary, checkin: d.checkin }
  }, 30000)
}

// ─── Dashboard / Class Summary ─────────────────────────────────────────
export function getClassSummary() {
  return cached('classSummary', async () => {
    const res = await dashboardApi.getTeacherDashboard()
    const d = unwrap(res)
    if (!d) return { totalStudents: 0, checkedIn: 0, unchecked: 0, checkinRate: 0 }
    return {
      totalStudents: d.classStats?.totalStudents || 0,
      checkedIn: d.classStats?.checkedIn || 0,
      unchecked: d.classStats?.unchecked || 0,
      checkinRate: d.classStats?.checkinRate || 0,
      teacher: d.teacher, todo: d.todo, quickEntries: d.quickEntries,
    }
  }, 15000)
}

// ─── Payments / Fee List ───────────────────────────────────────────────
export function getFeeList() {
  return cached('feeList', async () => {
    const res = await paymentApi.getStudentPayments({ pageNum: 1, pageSize: 200 })
    const items = unwrapList(res)
    return items.map(p => ({
      uid: p.studentId, studentId: p.studentId, studentNo: p.studentNo,
      studentName: p.name, className: p.className,
      receivableAmount: p.receivableAmount, paidAmount: p.paidAmount,
      unpaidAmount: p.unpaidAmount, paymentStatus: p.paymentStatus,
      status: p.paymentStatus, statusLabel: p.statusLabel,
      overdueDays: p.overdueDays, urgeCount: p.urgeCount, canUrge: p.canUrge,
    }))
  }, 15000)
}

export function getStudentFeeItems(sid) {
  return cached('feeItems_' + sid, async () => {
    const res = await paymentApi.getStudentBills(sid)
    const data = unwrap(res)
    return data?.bills || []
  }, 15000)
}

export function computePaymentStatus(items) {
  if (!items || items.length === 0) return 'unpaid'
  const allPaid = items.every(i => i.status === 'paid' || i.status === 'PAID')
  if (allPaid) return 'paid'
  const somePaid = items.some(i => i.status === 'paid' || i.status === 'PAID')
  return somePaid ? 'partial' : 'unpaid'
}

// ─── Review Lists (aids, loans, documents) ─────────────────────────────
export async function getReviewList(collection) {
  return cached('reviewList_' + collection, async () => {
    let items = []
    if (collection === 'aids' || collection === 'scholarships') {
      const res = await scholarshipApi.getScholarshipList({ pageNum: 1, pageSize: 200 })
      items = (unwrap(res)?.items || []).map(r => ({
        uid: r.scholarshipId, scholarshipId: r.scholarshipId, applicationNo: r.applicationNo,
        studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
        type: r.type, amount: r.amount, approvedAmount: r.approvedAmount,
        status: r.status, statusLabel: r.statusLabel, submittedAt: r.submittedAt,
        currentNode: r.currentNode, materials: r.materials,
      }))
    } else if (collection === 'loans') {
      const res = await scholarshipApi.getLoanList({ pageNum: 1, pageSize: 200 })
      items = (unwrap(res)?.items || []).map(r => ({
        uid: r.loanId, loanId: r.loanId, applicationNo: r.applicationNo,
        studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
        loanType: r.loanType, amount: r.amount, receiptNo: r.receiptNo,
        status: r.status, statusLabel: r.statusLabel, submittedAt: r.submittedAt,
        currentNode: r.currentNode,
      }))
    } else if (collection === 'documents') {
      const res = await documentApi.getReviewList({ pageNum: 1, pageSize: 200 })
      items = (unwrap(res)?.items || []).map(r => ({
        uid: r.documentReviewId, documentReviewId: r.documentReviewId,
        studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
        status: r.status, statusLabel: r.statusLabel, submittedAt: r.submittedAt,
        materialTags: r.materialTags, materials: r.materials,
      }))
    }
    return items
  }, 15000)
}

export async function getReviewItem(collection, uid) {
  try {
    let res
    if (collection === 'aids' || collection === 'scholarships') {
      res = await scholarshipApi.getScholarshipDetail(uid)
    } else if (collection === 'loans') {
      res = await scholarshipApi.getLoanDetail(uid)
    } else if (collection === 'documents') {
      res = await documentApi.getReviewDetail(uid)
    }
    const d = unwrap(res)
    if (d) { d.uid = uid; return d }
  } catch (e) { /* fallback */ }
  return null
}

export async function updateReview(collection, uid, status, log) {
  try {
    let res
    if (status === 'rejected') {
      if (collection === 'aids' || collection === 'scholarships') res = await scholarshipApi.rejectScholarship(uid, { rejectReason: log?.opinion || '驳回' })
      else if (collection === 'loans') res = await scholarshipApi.rejectLoan(uid, { rejectReason: log?.opinion || '驳回' })
      else if (collection === 'documents') res = await documentApi.rejectReview(uid, { rejectReason: log?.opinion || '驳回' })
    } else if (status === 'paid' || status === 'completed') {
      if (collection === 'aids' || collection === 'scholarships') res = await scholarshipApi.disburseScholarship(uid, { amount: log?.amount, payoutMethod: 'bank_transfer' })
      else if (collection === 'loans') res = await scholarshipApi.disburseLoan(uid, { amount: log?.amount, payoutMethod: 'bank_transfer' })
    } else {
      if (collection === 'aids' || collection === 'scholarships') res = await scholarshipApi.approveScholarship(uid, { opinion: log?.opinion })
      else if (collection === 'loans') res = await scholarshipApi.approveLoan(uid, { opinion: log?.opinion })
      else if (collection === 'documents') res = await documentApi.approveReview(uid, { opinion: log?.opinion })
    }
    clearCache('reviewList_' + collection)
    return res
  } catch (e) { /* fallback */ }
  return null
}

export async function markPayment(collection, uid, log) {
  try {
    let res
    if (collection === 'aids' || collection === 'scholarships') res = await scholarshipApi.disburseScholarship(uid, { amount: log?.amount, payoutMethod: 'bank_transfer' })
    else if (collection === 'loans') res = await scholarshipApi.disburseLoan(uid, { amount: log?.amount, payoutMethod: 'bank_transfer' })
    clearCache('reviewList_' + collection)
    return res
  } catch (e) { /* fallback */ }
  return null
}

// ─── Checkin ────────────────────────────────────────────────────────────
export async function updateStudentCheckin(sid, checkedIn) {
  try {
    if (checkedIn) await checkinApi.confirm(sid, { checkinMethod: 'manual' })
    else await checkinApi.cancel(sid, { reason: '取消报到' })
    clearCache('students')
  } catch (e) { /* fallback */ }
}

export async function updateStudentDelay(sid, deferred) {
  try {
    if (deferred) await checkinApi.delay(sid, { reason: '延期报到', expectedCheckinDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) })
  } catch (e) { /* fallback */ }
}

// ─── Messages ───────────────────────────────────────────────────────────
export async function getMessages(role) {
  return cached('messages_' + role, async () => {
    const res = await messageApi.getMessageList({ role, pageNum: 1, pageSize: 200 })
    return (unwrap(res)?.items || []).map(m => ({
      id: m.messageId, messageId: m.messageId, type: m.type, title: m.title,
      content: m.desc || m.content, read: m.read, createdAt: m.createdAt,
      bizType: m.bizType, bizId: m.bizId,
    }))
  }, 15000)
}

export async function getUnreadCount(role) {
  try {
    const res = await messageApi.getUnreadCount({ role })
    return unwrap(res)?.count || 0
  } catch (e) { return 0 }
}

export async function markMessageRead(role, id) {
  try { await messageApi.markRead(id); clearCache('messages_' + role) } catch (e) { /* fallback */ }
}
export async function markAllMessagesRead(role) {
  try { await messageApi.markAllRead({ role }); clearCache('messages_' + role) } catch (e) { /* fallback */ }
}
export async function deleteMessage(role, id) {
  try { await messageApi.deleteMessage(id); clearCache('messages_' + role) } catch (e) { /* fallback */ }
}
export async function clearAllMessages(role) {
  try { await messageApi.clearMessages({ role }); clearCache('messages_' + role) } catch (e) { /* fallback */ }
}

// ─── Refunds ────────────────────────────────────────────────────────────
export async function getRefundList() {
  return cached('refundList', async () => {
    const res = await refundApi.getRefundList({ pageNum: 1, pageSize: 200 })
    return (unwrap(res)?.items || []).map(r => ({
      uid: r.refundId, refundId: r.refundId, refundNo: r.refundNo,
      studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
      feeType: r.feeType, amount: r.amount, status: r.status, applyTime: r.applyTime,
      failureReason: r.failureReason, auditLogs: r.auditLogs,
    }))
  }, 15000)
}

export async function getRefundItem(uid) {
  try {
    const res = await refundApi.getRefundDetail(uid)
    return unwrap(res)
  } catch (e) { return null }
}

// ─── Dormitory ────────────────────────────────────────────────────────
export async function getDormReviewList(collection) {
  return cached('dormReview_' + collection, async () => {
    let items = []
    try {
      if (collection === 'roomChanges') {
        const res = await dormitoryApi.getRoomChangeApplications({ pageNum: 1, pageSize: 200 })
        items = (unwrap(res)?.items || []).map(r => ({
          uid: r.applicationId, applicationId: r.applicationId,
          studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
          oldDorm: r.oldDorm, targetDorm: r.targetDorm, reason: r.reason,
          status: r.status, applyTime: r.applyTime, auditLogs: r.auditLogs,
        }))
      } else if (collection === 'dormWithdraws') {
        const res = await dormitoryApi.getWithdrawApplications({ pageNum: 1, pageSize: 200 })
        items = (unwrap(res)?.items || []).map(r => ({
          uid: r.applicationId, applicationId: r.applicationId,
          studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
          reason: r.reason, status: r.status, applyTime: r.applyTime, auditLogs: r.auditLogs,
        }))
      } else if (collection === 'nonDorm') {
        const res = await dormitoryApi.getWithdrawApplications({ pageNum: 1, pageSize: 200 })
        items = (unwrap(res)?.items || []).map(r => ({
          uid: r.applicationId, applicationId: r.applicationId,
          studentNo: r.studentNo, studentName: r.studentName, name: r.studentName,
          reason: r.reason, status: r.status, applyTime: r.applyTime,
        }))
      }
    } catch (e) { /* fallback */ }
    return items
  }, 15000)
}

export async function getDormReviewItem(collection, uid) {
  try {
    let res
    if (collection === 'roomChanges') res = await dormitoryApi.getRoomChangeDetail(uid)
    else if (collection === 'dormWithdraws') res = await dormitoryApi.getWithdrawDetail(uid)
    else if (collection === 'nonDorm') res = await dormitoryApi.getWithdrawDetail(uid)
    const d = unwrap(res)
    if (d) d.uid = uid
    return d
  } catch (e) { return null }
}

// ─── Offline Payments ───────────────────────────────────────────────────
export async function getOfflineCollectionList() {
  return cached('offlineList', async () => {
    try {
      const res = await offlinePaymentApi.getList({ pageNum: 1, pageSize: 200 })
      return (unwrap(res)?.items || []).map(r => ({
        uid: r.offlinePaymentId, offlinePaymentId: r.offlinePaymentId,
        studentId: r.studentId, studentNo: r.studentNo, studentName: r.studentName,
        amount: r.amount, method: r.method, location: r.location,
        submittedAt: r.submittedAt, status: r.status,
      }))
    } catch (e) { return [] }
  }, 15000)
}

// ─── Uniform Sizes ──────────────────────────────────────────────────────
export async function getSizeList() {
  return cached('sizeList', async () => {
    try {
      const res = await uniformApi.getSizes({ pageNum: 1, pageSize: 200 })
      return (unwrap(res)?.list || unwrap(res)?.items || []).map(r => ({
        studentId: r.studentId, studentNo: r.studentNo, studentName: r.studentName,
        gender: r.gender, className: r.className, clothingSize: r.clothingSize,
        shoeSize: r.shoeSize, height: r.height, weight: r.weight,
        status: r.status, statusLabel: r.statusLabel, remark: r.remark,
      }))
    } catch (e) { return [] }
  }, 30000)
}

// ─── Receipts ───────────────────────────────────────────────────────────
export async function getReceiptList() {
  return cached('receiptList', async () => {
    try {
      const res = await invoiceApi.getInvoiceList({ pageNum: 1, pageSize: 200 })
      return (unwrap(res)?.items || []).map(r => ({
        uid: r.invoiceId, invoiceId: r.invoiceId, invoiceNo: r.invoiceNo,
        studentNo: r.studentNo, studentName: r.studentName,
        amount: r.amount, status: r.status, issuedAt: r.issuedAt,
        paymentMethod: r.paymentMethod,
      }))
    } catch (e) { return [] }
  }, 15000)
}

// ─── Payment Records ────────────────────────────────────────────────────
export async function getPaymentRecordList() {
  return cached('payRecords', async () => {
    try {
      const res = await paymentApi.getPaymentRecords({ pageNum: 1, pageSize: 200 })
      return (unwrap(res)?.items || []).map(r => ({
        uid: r.paymentNo, paymentNo: r.paymentNo, studentNo: r.studentNo,
        studentName: r.studentName, amount: r.amount, method: r.method,
        channel: r.channel, paidAt: r.paidAt, invoiceNo: r.invoiceNo,
      }))
    } catch (e) { return [] }
  }, 15000)
}

// ─── Difference Refunds ─────────────────────────────────────────────────
export async function getDifferenceRefundList() {
  return cached('diffRefundList', async () => {
    try {
      const res = await refundApi.getDiffRefundList({ pageNum: 1, pageSize: 200 })
      return (unwrap(res)?.items || []).map(r => ({
        uid: r.diffRefundId, diffRefundId: r.diffRefundId, diffOrderNo: r.diffOrderNo,
        studentNo: r.studentNo, studentName: r.studentName,
        oldDormFee: r.oldDormFee, newDormFee: r.newDormFee,
        diffAmount: r.diffAmount, status: r.status, deadline: r.deadline,
      }))
    } catch (e) { return [] }
  }, 15000)
}

// ─── Finance Home Summary ───────────────────────────────────────────────
export async function getFinanceSummary() {
  return cached('financeSummary', async () => {
    try {
      const res = await dashboardApi.getFinanceDashboard()
      return unwrap(res) || {}
    } catch (e) { return {} }
  }, 15000)
}

// ─── Government Home Summary ────────────────────────────────────────────
export async function getGovernmentSummary() {
  return cached('govSummary', async () => {
    try {
      const res = await dashboardApi.getGovernmentDashboard()
      return unwrap(res) || {}
    } catch (e) { return {} }
  }, 15000)
}

// ─── Urge ───────────────────────────────────────────────────────────────
export async function urgeStudents(sids) {
  try {
    await reminderApi.batchSendReminder({ studentIds: sids, channels: ['sms'] })
    clearCache('feeList')
  } catch (e) { /* fallback */ }
}

// ─── Helpers ────────────────────────────────────────────────────────────
export function getLastBusinessChange(collection) {
  // Return null to force pages to fetch fresh data
  return null
}
