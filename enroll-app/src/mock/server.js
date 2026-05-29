const STORAGE_KEY = 'enroll_mock_api_state_v1'

const now = () => Date.now()
const iso = () => new Date().toISOString()
const reqId = () => `req_${now()}_${Math.random().toString(16).slice(2, 8)}`

const ok = (data = {}) => ({
  code: 0,
  message: 'success',
  data,
  timestamp: now(),
  requestId: reqId()
})

const fail = (message, code = 40001) => ({
  code,
  message,
  data: null,
  timestamp: now(),
  requestId: reqId()
})

const clone = value => JSON.parse(JSON.stringify(value))

const students = [
  ['stu-001', '2026010001', '王明辉', '男', '计算机学院', '软件工程', '2026级1班', '13800138011', '3号楼 305室 2床'],
  ['stu-002', '2026010002', '李雪梅', '女', '计算机学院', '软件工程', '2026级1班', '13800138012', '6号楼 214室 1床'],
  ['stu-003', '2026010008', '张宇轩', '男', '计算机学院', '网络工程', '2026级1班', '13800138013', '3号楼 308室 4床'],
  ['stu-004', '2026010015', '陈晓琳', '女', '计算机学院', '信息安全', '2026级1班', '13800138014', '6号楼 218室 3床'],
  ['stu-005', '2026010022', '刘佳慧', '女', '计算机学院', '软件工程', '2026级1班', '13800138015', '6号楼 220室 2床'],
  ['stu-006', '2026010030', '赵明', '男', '计算机学院', '网络工程', '2026级1班', '13800138016', '3号楼 312室 5床'],
  ['stu-007', '2026010035', '孙丽', '女', '计算机学院', '信息安全', '2026级1班', '13800138017', '6号楼 222室 4床'],
  ['stu-008', '2026010039', '孙文浩', '男', '计算机学院', '软件工程', '2026级1班', '13800138018', '3号楼 316室 1床'],
  ['stu-009', '2026010042', '周小龙', '男', '计算机学院', '网络工程', '2026级1班', '13800138019', '3号楼 318室 2床'],
  ['stu-010', '2026010048', '吴静雪', '女', '计算机学院', '软件工程', '2026级1班', '13800138020', '校外住宿']
].map(([studentId, studentNo, name, gender, college, major, className, phone, dormText]) => ({
  studentId,
  studentNo,
  id: studentNo,
  sid: studentNo,
  name,
  gender,
  college,
  major,
  classId: 'class-2026-1',
  className,
  phone,
  parentPhone: phone.replace('138', '139'),
  idNoMasked: '430************018',
  address: '湖南省长沙市岳麓区校园路 88 号',
  dormText,
  dorm: dormText,
  roleScope: 'teacher'
}))

function studentOf(studentNo) {
  return students.find(s => s.studentNo === studentNo) || students[0]
}

const materialFiles = bizId => [
  { fileId: `file-${bizId}-01`, fileName: '身份证正反面.pdf', fileType: 'id_card', mimeType: 'application/pdf', size: 248000 },
  { fileId: `file-${bizId}-02`, fileName: '录取通知书.jpg', fileType: 'admission_notice', mimeType: 'image/jpeg', size: 520000 },
  { fileId: `file-${bizId}-03`, fileName: '申请材料包.pdf', fileType: 'application_package', mimeType: 'application/pdf', size: 860000 }
].map(file => ({
  ...file,
  previewable: true,
  downloadable: true,
  url: `/api/v1/files/${file.fileId}/download`,
  previewUrl: `/api/v1/files/${file.fileId}/preview`,
  uploadedAt: '2026-05-18T09:30:00+08:00'
}))

function seedState() {
  const paymentStatuses = ['overdue', 'overdue', 'unpaid', 'partial', 'paid', 'paid', 'green_channel', 'unpaid', 'partial', 'paid']
  const documents = ['pending', 'pending', 'first_pass', 'department_review', 'final_pass', 'rejected'].map((status, idx) => {
    const s = students[idx]
    return {
      documentReviewId: `doc-${idx + 1}`,
      uid: `doc-${idx + 1}`,
      studentId: s.studentId,
      studentNo: s.studentNo,
      sid: s.studentNo,
      id: s.studentNo,
      studentName: s.name,
      name: s.name,
      className: s.className,
      college: s.college,
      major: s.major,
      status,
      submittedAt: `2026-05-${15 + idx} 09:20`,
      materialTags: ['身份证', '录取通知书', '户口本', '证件照'],
      materials: materialFiles(`doc-${idx + 1}`),
      rejectReason: status === 'rejected' ? '身份证照片模糊，请重新上传' : '',
      auditLogs: [{ node: '学生提交', result: '已提交', time: `2026-05-${15 + idx} 09:20` }]
    }
  })

  const reviewStatuses = ['pending', 'first_pass', 'review_pass', 'final_pass', 'payment_pending', 'completed', 'rejected']
  const scholarships = reviewStatuses.map((status, idx) => {
    const s = students[(idx + 2) % students.length]
    return {
      scholarshipId: `aid-${idx + 1}`,
      uid: `aid-${idx + 1}`,
      applicationNo: `AID2026052${idx}`,
      studentId: s.studentId,
      studentNo: s.studentNo,
      sid: s.studentNo,
      studentName: s.name,
      name: s.name,
      type: idx % 2 ? '国家助学金' : '特殊困难助学金',
      amount: 3000 + idx * 300,
      approvedAmount: status === 'pending' ? null : 3000 + idx * 300,
      status,
      submittedAt: `2026-05-${12 + idx} 10:00`,
      currentNode: currentNode(status, 'scholarship'),
      materials: materialFiles(`aid-${idx + 1}`),
      auditLogs: [{ node: '学生申请', result: '已提交', time: `2026-05-${12 + idx} 10:00` }],
      payout: {}
    }
  })

  const loans = reviewStatuses.map((status, idx) => {
    const s = students[(idx + 1) % students.length]
    return {
      loanId: `loan-${idx + 1}`,
      uid: `loan-${idx + 1}`,
      applicationNo: `LOAN2026052${idx}`,
      studentId: s.studentId,
      studentNo: s.studentNo,
      sid: s.studentNo,
      studentName: s.name,
      name: s.name,
      loanType: idx % 2 ? 'campus' : 'origin_place',
      type: idx % 2 ? '校园地助学贷款' : '生源地助学贷款',
      amount: 6000 + idx * 500,
      approvedAmount: status === 'pending' ? null : 6000 + idx * 500,
      receiptNo: `RCP${idx}2026`,
      receiptVerified: status !== 'pending',
      status,
      submittedAt: `2026-05-${13 + idx} 11:00`,
      currentNode: currentNode(status, 'loan'),
      materials: materialFiles(`loan-${idx + 1}`),
      auditLogs: [{ node: '学生申请', result: '已提交', time: `2026-05-${13 + idx} 11:00` }],
      payout: {}
    }
  })

  return {
    users: {
      '1001': { userId: 'staff_teacher_001', name: '刘晓华', workNo: 'T2026001', phone: '13800138000', roles: ['teacher'], type: 2, typeList: [2], departmentName: '计算机学院' },
      '13800138000': { userId: 'staff_teacher_001', name: '刘晓华', workNo: 'T2026001', phone: '13800138000', roles: ['teacher'], type: 2, typeList: [2], departmentName: '计算机学院' },
      '2001': { userId: 'staff_finance_001', name: '陈美玲', workNo: 'F2026001', phone: '13800138001', roles: ['finance'], type: 3, typeList: [3], departmentName: '财务处' },
      '13800138001': { userId: 'staff_finance_001', name: '陈美玲', workNo: 'F2026001', phone: '13800138001', roles: ['finance'], type: 3, typeList: [3], departmentName: '财务处' },
      '3001': { userId: 'staff_gov_001', name: '李明远', workNo: 'G2026001', phone: '13800138002', roles: ['government'], type: 5, typeList: [5], departmentName: '学工处' },
      '13800138002': { userId: 'staff_gov_001', name: '李明远', workNo: 'G2026001', phone: '13800138002', roles: ['government'], type: 5, typeList: [5], departmentName: '学工处' },
      '3002': { userId: 'staff_college_001', name: '张教授', workNo: 'C2026001', phone: '13800138003', roles: ['government'], type: 5, typeList: [5], departmentName: '计算机学院' },
      '13800138003': { userId: 'staff_college_001', name: '张教授', workNo: 'C2026001', phone: '13800138003', roles: ['government'], type: 5, typeList: [5], departmentName: '计算机学院' }
    },
    currentUserId: 'staff_teacher_001',
    tokens: {},
    students,
    payments: students.map((s, idx) => {
      const status = paymentStatuses[idx]
      const receivableAmount = status === 'green_channel' ? 0 : 5800
      const paidAmount = status === 'paid' ? receivableAmount : status === 'partial' ? 2900 : 0
      return {
        paymentId: `pay-${idx + 1}`,
        studentId: s.studentId,
        studentNo: s.studentNo,
        studentName: s.name,
        name: s.name,
        classId: s.classId,
        className: s.className,
        receivableAmount,
        paidAmount,
        unpaidAmount: Math.max(receivableAmount - paidAmount, 0),
        amount: receivableAmount.toLocaleString(),
        paymentStatus: status,
        payStatus: status === 'green_channel' ? 'channel' : status,
        dueDate: '2026-05-20',
        overdueDays: status === 'overdue' ? 5 + idx : 0,
        urgeCount: status === 'paid' || status === 'green_channel' ? 0 : idx % 3,
        lastUrgeAt: idx % 3 ? '2026-05-21 09:00' : '',
        canUrge: !['paid', 'green_channel'].includes(status)
      }
    }),
    offlinePayments: [
      { offlinePaymentId: 'off-1', studentNo: '2026010001', amount: 5800, method: '现金缴纳', location: '收款台1', submittedAt: '2026-05-16 09:12', status: 'pending' },
      { offlinePaymentId: 'off-2', studentNo: '2026010002', amount: 7000, method: '银行转账', location: '自助', submittedAt: '2026-05-16 09:35', status: 'pending' },
      { offlinePaymentId: 'off-3', studentNo: '2026010008', amount: 5800, method: '现金缴纳', location: '收款台2', submittedAt: '2026-05-16 10:05', status: 'pending' },
      { offlinePaymentId: 'off-4', studentNo: '2026010030', amount: 5800, method: '现金', collectionType: '现金', location: '收款台1', submittedAt: '2026-05-16 08:50', status: 'confirmed', confirmTime: '2026-05-16 09:00' }
    ],
    refunds: ['pending', 'approved', 'refunded', 'rejected', 'failed'].map((status, idx) => {
      const s = students[idx]
      return {
        refundId: `rf-${idx + 1}`,
        uid: `rf-${idx + 1}`,
        refundNo: `RF2026052${idx}`,
        studentId: s.studentId,
        studentNo: s.studentNo,
        sid: s.studentNo,
        studentName: s.name,
        name: s.name,
        feeType: idx % 2 ? '教材费' : '住宿费',
        type: idx % 2 ? '教材费' : '住宿费',
        reason: idx % 2 ? '重复缴费' : '退宿申请',
        amount: 300 + idx * 200,
        refundableAmount: 1000,
        status,
        applyTime: `2026-05-${18 + idx} 10:10`,
        failureReason: status === 'failed' ? '银行账户异常，需财务重试' : '',
        auditLogs: []
      }
    }),
    documents,
    scholarships,
    loans,
    roomChanges: dormApps('room_change'),
    dormWithdraws: dormApps('dorm_withdraw'),
    nonDorms: dormApps('non_dorm'),
    checkins: students.map((s, idx) => ({
      checkinId: `chk-${idx + 1}`,
      studentId: s.studentId,
      studentNo: s.studentNo,
      studentName: s.name,
      name: s.name,
      classId: s.classId,
      className: s.className,
      paymentStatus: paymentStatuses[idx],
      documentStatus: documents[idx % documents.length].status,
      dormText: s.dormText,
      checkinStatus: ['pending', 'checked_in', 'delayed', 'blocked'][idx % 4],
      checkedInAt: idx % 4 === 1 ? `2026-05-${18 + idx} 09:00` : '',
      lastStatus: ['待报到', '已报到', '延期', '阻塞'][idx % 4],
      remark: ''
    })),
    uniforms: students.map((s, idx) => ({
      studentId: s.studentId,
      studentNo: s.studentNo,
      studentName: s.name,
      name: s.name,
      gender: s.gender,
      className: s.className,
      clothingSize: ['S', 'M', 'L', 'XL', 'XXL', ''][idx % 6],
      shoeSize: [36, 37, 38, 42, 43, ''][idx % 6],
      height: 160 + idx,
      weight: 48 + idx,
      remark: idx === 4 ? '建议试穿' : '',
      status: idx === 5 ? 'empty' : idx === 4 ? 'abnormal' : 'filled'
    })),
    messages: {
      teacher: [
        msg('t-1', 'teacher', '催缴提醒', '班级仍有学生学费逾期，请跟进催缴', false, 'payment', 'pay-1'),
        msg('t-2', 'teacher', '资料审核', '孙文浩重新提交了资料，请尽快审核', false, 'document', 'doc-1'),
        msg('t-3', 'teacher', '助贷审核', '助学贷款申请已进入下一节点', true, 'loan', 'loan-1')
      ],
      finance: [
        msg('f-1', 'finance', '收款确认', '今日新增 3 笔线下收款待确认', false, 'offline_payment', 'off-1'),
        msg('f-2', 'finance', '退费审核', '2 条退费申请等待处理', true, 'refund', 'rf-1')
      ],
      government: [
        msg('g-1', 'government', '终审提醒', '助学金复审有记录待处理', false, 'scholarship', 'aid-2'),
        msg('g-2', 'government', '换宿审批', '校外住宿材料已进入政务复审', true, 'non_dorm', 'nd-1')
      ]
    },
    reminderTasks: [],
    reminderRecords: [],
    exportTasks: [],
    events: []
  }
}

function msg(messageId, role, type, content, read, bizType, bizId) {
  return { messageId, id: messageId, role, type, title: type, icon: '●', color: 'var(--brand)', content, read, status: read ? 'read' : 'unread', bizType, bizId, url: '', createdAt: '2026-05-24 09:00', readAt: read ? '2026-05-24 09:30' : '' }
}

function dormApps(type) {
  return ['pending', 'approved', 'rejected'].map((status, idx) => {
    const s = students[(idx + 2) % students.length]
    return {
      applicationId: `${type}-${idx + 1}`,
      uid: `${type}-${idx + 1}`,
      studentId: s.studentId,
      studentNo: s.studentNo,
      sid: s.studentNo,
      studentName: s.name,
      name: s.name,
      oldDorm: { text: s.dormText },
      targetDorm: { text: idx === 0 ? '3号楼 310室 1床' : s.dormText },
      currentDorm: s.dormText,
      outsideAddress: '学府花园 3 栋',
      reason: '学生提交申请，需审批',
      status,
      applyTime: `2026-05-${18 + idx} 08:30`,
      auditLogs: []
    }
  })
}

function currentNode(status, bizType) {
  if (status === 'pending') return '教师初审'
  if (status === 'first_pass') return '政务复审'
  if (status === 'review_pass') return '教师终审'
  if (status === 'final_pass' || status === 'payment_pending') return '财务打款'
  if (status === 'completed' || status === 'paid') return '已完成'
  if (status === 'rejected') return '已驳回'
  return bizType
}

function readState() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  const seeded = seedState()
  saveState(seeded)
  return seeded
}

function saveState(state) {
  try { uni.setStorageSync(STORAGE_KEY, JSON.stringify(state)) } catch (e) {}
}

function parseUrl(url) {
  const marker = '/api/v1'
  const idx = url.indexOf(marker)
  const full = idx >= 0 ? url.slice(idx + marker.length) : url
  const [path, queryString = ''] = full.split('?')
  const query = {}
  queryString.split('&').filter(Boolean).forEach(part => {
    const [k, v = ''] = part.split('=')
    query[decodeURIComponent(k)] = decodeURIComponent(v)
  })
  return { path: path || '/', query }
}

function paramsOf(query, body) {
  return { ...(query || {}), ...(body || {}) }
}

function roleOf(params, state) {
  if (params.role) return params.role
  const user = Object.values(state.users).find(u => u.userId === state.currentUserId)
  return user?.roles?.[0] || 'teacher'
}

function normalizeListParams(params = {}) {
  const page = Number(params.page || params.pageNum || 1)
  const pageSize = Number(params.pageSize || 10)
  return { ...params, page, pageSize }
}

function filterList(list, params = {}, fields = []) {
  const p = normalizeListParams(params)
  let result = [...list]
  const kw = String(p.keyword || '').trim().toLowerCase()
  if (kw) {
    result = result.filter(item => fields.some(field => String(item[field] || '').toLowerCase().includes(kw)))
  }
  if (p.status && p.status !== 'all') {
    result = result.filter(item => [item.status, item.paymentStatus, item.checkinStatus].includes(p.status))
  }
  if (p.studentId) result = result.filter(item => item.studentId === p.studentId || item.studentNo === p.studentId || item.sid === p.studentId)
  if (p.classId) result = result.filter(item => item.classId === p.classId)
  const start = p.startTime || p.startDate
  const end = p.endTime || p.endDate
  if (start) result = result.filter(item => String(item.submittedAt || item.applyTime || item.createdAt || item.paidAt || '') >= start)
  if (end) result = result.filter(item => String(item.submittedAt || item.applyTime || item.createdAt || item.paidAt || '') <= end)
  const total = result.length
  const totalPages = Math.max(1, Math.ceil(total / p.pageSize))
  const listPage = result.slice((p.page - 1) * p.pageSize, p.page * p.pageSize)
  return { list: listPage, items: listPage, page: p.page, pageNum: p.page, pageSize: p.pageSize, total, totalPages, pages: totalPages, hasNext: p.page < totalPages }
}

function withStudentRows(rows) {
  return rows.map(row => {
    const s = studentOf(row.studentNo || row.sid)
    return { ...s, ...row, studentName: row.studentName || s.name, name: row.name || row.studentName || s.name, sid: row.sid || s.studentNo, id: row.id || s.studentNo, avatar: (row.name || row.studentName || s.name || '?').charAt(0) }
  })
}

function statusCounts(list, statusField = 'status') {
  return list.reduce((acc, item) => {
    const key = item[statusField] || item.status
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

function reviewTabStatuses(role) {
  return {
    todo: ['pending'],
    processing: ['first_pass', 'review_pass', 'final_pass', 'payment_pending'],
    done: ['rejected', 'paid', 'completed']
  }
}

function applyTab(list, params, role) {
  if (!params.tab) return list
  const map = reviewTabStatuses(role)
  const statuses = map[params.tab] || map.todo
  return list.filter(item => statuses.includes(item.status))
}

function mutationResult(state, bizType, bizId, oldStatus, newStatus, log) {
  const event = { eventId: `evt-${state.events.length + 1}`, bizType, bizId, oldStatus, newStatus, operatorId: state.currentUserId, occurredAt: iso(), remark: log?.remark || '', requestId: reqId() }
  state.events.unshift(event)
  return { bizType, bizId, oldStatus, newStatus, updatedAt: event.occurredAt, auditLog: log, statistics: getSummaryData(state, bizType, {}), nextAction: {} }
}

function approveReview(state, collection, id, params, status) {
  const item = state[collection].find(i => [i.uid, i.scholarshipId, i.loanId, i.documentReviewId].includes(id))
  if (!item) return fail('记录不存在', 40400)
  const oldStatus = item.status
  item.status = status || nextReviewStatus(collection, oldStatus)
  item.approvedAmount = params.approvedAmount || params.amount || item.approvedAmount || item.amount
  const log = { node: currentNode(oldStatus, collection), result: '通过', remark: params.opinion || params.remark || '', time: iso() }
  item.auditLogs = item.auditLogs || []
  item.auditLogs.unshift(log)
  return ok(mutationResult(state, collection, id, oldStatus, item.status, log))
}

function rejectReview(state, collection, id, params) {
  const item = state[collection].find(i => [i.uid, i.scholarshipId, i.loanId, i.documentReviewId].includes(id))
  if (!item) return fail('记录不存在', 40400)
  const oldStatus = item.status
  item.status = 'rejected'
  const log = { node: currentNode(oldStatus, collection), result: '驳回', remark: params.rejectReason || params.remark || '不予通过', time: iso() }
  item.rejectReason = log.remark
  item.auditLogs = item.auditLogs || []
  item.auditLogs.unshift(log)
  return ok(mutationResult(state, collection, id, oldStatus, item.status, log))
}

function nextReviewStatus(collection, oldStatus) {
  if (collection === 'documents') return 'first_pass'
  if (oldStatus === 'pending') return 'first_pass'
  if (oldStatus === 'first_pass') return 'review_pass'
  if (oldStatus === 'review_pass') return 'payment_pending'
  if (oldStatus === 'final_pass') return 'payment_pending'
  return 'payment_pending'
}

function disburse(state, collection, id, params) {
  const item = state[collection].find(i => [i.uid, i.scholarshipId, i.loanId].includes(id))
  if (!item) return fail('记录不存在', 40400)
  const oldStatus = item.status
  item.status = collection === 'loans' ? 'paid' : 'completed'
  item.payout = { payoutRecordId: `po-${id}`, amount: params.amount || item.approvedAmount || item.amount, payoutMethod: params.payoutMethod || 'bank_transfer', paidAt: iso(), operatorName: 'Mock 财务' }
  const log = { node: '财务打款', result: '已完成', remark: params.remark || '', time: iso() }
  item.auditLogs.unshift(log)
  return ok({ ...mutationResult(state, collection, id, oldStatus, item.status, log), payoutRecordId: item.payout.payoutRecordId, paidAt: item.payout.paidAt, messageSent: true })
}

function getSummaryData(state, bizType, params = {}) {
  if (bizType === 'document') return { total: state.documents.length, statusCounts: statusCounts(state.documents), tabCounts: docTabs(state.documents), updatedAt: iso() }
  if (bizType === 'scholarship') return reviewSummary(state.scholarships, params.role || 'teacher')
  if (bizType === 'loan') return reviewSummary(state.loans, params.role || 'teacher')
  if (bizType === 'payment') return { total: state.payments.length, statusCounts: statusCounts(state.payments, 'paymentStatus'), tabCounts: paymentTabs(state.payments), updatedAt: iso() }
  if (bizType === 'refund') return { total: state.refunds.length, statusCounts: statusCounts(state.refunds), tabCounts: refundTabs(state.refunds), updatedAt: iso() }
  if (bizType === 'checkin') return { total: state.checkins.length, statusCounts: statusCounts(state.checkins, 'checkinStatus'), tabCounts: checkinTabs(state.checkins), updatedAt: iso() }
  return { total: 0, statusCounts: {}, tabCounts: [], updatedAt: iso() }
}

function reviewSummary(list, role) {
  const map = reviewTabStatuses(role)
  return { total: list.length, statusCounts: statusCounts(list), tabCounts: Object.keys(map).map(key => ({ key, label: key === 'todo' ? '待审批' : key === 'processing' ? '审批中' : '已完结', count: list.filter(i => map[key].includes(i.status)).length })), updatedAt: iso() }
}
const docTabs = list => [{ key: 'pending', label: '待审核', count: list.filter(i => i.status === 'pending').length }, { key: 'passed', label: '已通过', count: list.filter(i => ['first_pass', 'department_review', 'final_pass'].includes(i.status)).length }, { key: 'rejected', label: '已退回', count: list.filter(i => i.status === 'rejected').length }]
const paymentTabs = list => ['unpaid', 'partial', 'paid', 'green_channel'].map(key => ({ key, label: key, count: list.filter(i => key === 'unpaid' ? ['unpaid', 'overdue'].includes(i.paymentStatus) : i.paymentStatus === key).length }))
const refundTabs = list => [
  { key: 'pending', label: '待审核', statuses: ['pending'] },
  { key: 'approved', label: '待财务确认打款', statuses: ['approved'] },
  { key: 'completed', label: '已完结', statuses: ['refunded', 'rejected'] }
].map(tab => ({ key: tab.key, label: tab.label, count: list.filter(i => tab.statuses.includes(i.status)).length }))
const checkinTabs = list => ['pending', 'checked_in', 'delayed', 'blocked'].map(key => ({ key, label: key, count: list.filter(i => i.checkinStatus === key).length }))

function handleAuth(path, method, params, state) {
  if (path === '/auth/sms-code' && method === 'POST') return ok({ smsToken: `sms_${now()}`, expireSeconds: 300, cooldownSeconds: 60 })
  if ((path === '/auth/login/password' || path === '/auth/login/sms' || path === '/auth/login/wechat-miniapp') && method === 'POST') {
    const account = params.account || params.phone
    const user = state.users[account] || (path === '/auth/login/wechat-miniapp' ? state.users['1001'] : null)
    if (!user) return fail('账号不存在或未绑定角色', 40100)
    if (params.password && params.password !== '123456') return fail('密码错误', 40100)
    if (params.code && params.code !== '123456') return fail('验证码错误', 40100)
    state.currentUserId = user.userId
    const accessToken = `mock_token_${user.roles[0]}_${now()}`
    state.tokens[accessToken] = user.userId
    const perm = getPermissionsData(state, { userId: user.userId })
    const subRole = perm.data?.subRole || ''
    const permissions = perm.data?.permissions || [`${user.roles[0]}:*`]
    const dataScope = perm.data?.dataScope || { type: 'all' }
    return ok({ accessToken, refreshToken: `mock_refresh_${now()}`, expiresIn: 7200, user: { ...user, hasType: true, orgId: 'org-001', orgName: '华东科技大学', accessToken, subRole, permissions, dataScope }, defaultRole: user.roles[0], homePage: `/pages/${user.roles[0]}/home/index`, permissions: [`${user.roles[0]}:*`] })
  }
  if (path === '/auth/refresh' && method === 'POST') {
    const user = Object.values(state.users).find(u => u.userId === state.currentUserId) || state.users['1001']
    const accessToken = `mock_token_${user.roles[0]}_${now()}`
    state.tokens[accessToken] = user.userId
    return ok({ accessToken, refreshToken: params.refreshToken || `mock_refresh_${now()}`, expiresIn: 7200 })
  }
  if (path === '/auth/me' && method === 'GET') {
    const user = Object.values(state.users).find(u => u.userId === state.currentUserId) || state.users['1001']
    return ok({ ...user, currentRole: user.roles[0], roleScopes: [{ classId: 'class-2026-1', departmentId: 'cs' }], permissions: [`${user.roles[0]}:*`], orgId: 'org-001', orgName: '华东科技大学' })
  }
  if (path === '/auth/switch-role' && method === 'POST') return ok({ accessToken: `mock_token_${params.role}_${now()}`, currentRole: params.role, homePage: `/pages/${params.role}/home/index`, permissions: [`${params.role}:*`] })
  if (path === '/auth/logout' && method === 'POST') return ok(true)
  if (path === '/account/password' && method === 'PUT') return ok(true)
  if ((path === '/account/phone' && method === 'PUT') || (path === '/account/phone/bind' && method === 'POST')) return ok({ phone: params.phone || params.newPhone, maskedPhone: maskPhone(params.phone || params.newPhone) })
  return null
}

function maskPhone(phone = '') {
  return String(phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function getPermissionsData(state, params) {
  const user = params.userId ? state.users[params.userId] : null
  if (!user) return fail('用户不存在', 40400)
  const permissionsMap = {
    '1001': { subRole: 'head_teacher', permissions: ['teacher:overview','teacher:fee-list','teacher:student-detail','teacher:urge','teacher:aid-list','teacher:loan-list','teacher:doc-review','teacher:dorm-view','teacher:checkin'], dataScope: { type: 'class', classId: 'class-2026-1' } },
    '2001': { subRole: 'fee_collector', permissions: ['finance:overview','finance:collect','finance:refund','finance:diff','finance:receipt','finance:urge','finance:payout'], dataScope: { type: 'all' } },
    '3001': { subRole: 'student_affairs', permissions: ['gov:overview','gov:aid-final','gov:loan-final','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-global'], dataScope: { type: 'all' } },
    '3002': { subRole: 'college_dean', permissions: ['gov:overview','gov:aid-review','gov:loan-review','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-college'], dataScope: { type: 'college', collegeId: 'cs' } },
    'C2026001': { subRole: 'college_dean', permissions: ['gov:overview','gov:aid-review','gov:loan-review','gov:dorm-review','gov:checkin-stats','gov:non-dorm','gov:stats-college'], dataScope: { type: 'college', collegeId: 'cs' } }
  }
  const perm = permissionsMap[params.userId || user.workNo] || { subRole: '', permissions: [], dataScope: { type: 'all' } }
  return ok({ userId: user.userId, name: user.name, role: user.roles[0], ...perm })
}

function getClearanceResult(paymentStatus, paidAmount, receivableAmount) {
  if (paymentStatus === 'paid') return { allowed: true, label: '允许放行', color: 'ok', reason: '费用已缴清' }
  if (paymentStatus === 'green_channel') return { allowed: true, label: '允许放行', color: 'ok', reason: '绿色通道' }
  if (paymentStatus === 'partial') return { allowed: false, label: '需人工确认', color: 'wa', reason: '部分未缴费，建议引导至缴费处' }
  return { allowed: false, label: '不允许放行', color: 'er', reason: '未缴费，请先完成缴费或走绿色通道' }
}

function verifyPayment(state, params) {
  const keyword = params.keyword || params.studentNo || params.verifyCode || ''
  if (!keyword) return fail('请输入学号或姓名', 40001)
  const payment = state.payments.find(p =>
    p.studentNo === keyword || p.studentName === keyword || p.studentName.includes(keyword)
  )
  if (!payment) return fail('未找到该学生', 40400)
  const student = studentOf(payment.studentNo)
  const checkin = state.checkins.find(c => c.studentNo === payment.studentNo)
  const clearance = getClearanceResult(payment.paymentStatus, payment.paidAmount, payment.receivableAmount)
  const lastPayment = payment.paidAmount > 0 ? (payment.lastPaymentTime || '—') : '—'
  return ok({
    studentName: student.name,
    studentNo: student.studentNo,
    college: student.college,
    major: student.major,
    className: student.className,
    receivableAmount: payment.receivableAmount,
    paidAmount: payment.paidAmount,
    unpaidAmount: Math.max(payment.receivableAmount - payment.paidAmount, 0),
    paymentStatus: payment.paymentStatus,
    paymentStatusLabel: paymentLabel(payment.paymentStatus),
    paymentStatusColor: paymentColor(payment.paymentStatus),
    clearance,
    lastPaymentTime: lastPayment,
    checkedIn: checkin ? checkin.checkinStatus === 'checked_in' : false,
    checkinTime: checkin ? checkin.checkinTime || '' : '',
    isGreenChannel: payment.paymentStatus === 'green_channel',
    note: payment.paymentStatus === 'green_channel' ? '绿色通道学生，已批准缓缴' : ''
  })
}

function logVerify(state, params) {
  if (!params.studentNo) return fail('学号不能为空', 40001)
  state.verifyLogs = state.verifyLogs || []
  const log = {
    logId: `vlog-${now()}`,
    studentName: params.studentName || '',
    studentNo: params.studentNo,
    verifyResult: params.verifyResult || '',
    verifyResultColor: params.verifyResultColor || 'ok',
    verifyTime: iso(),
    verifyMethod: params.verifyMethod || 'manual',
    operatorId: params.operatorId || 'staff_checkin_001',
    operatorName: params.operatorName || '迎新工作人员'
  }
  state.verifyLogs.unshift(log)
  return ok(log)
}

function getVerifyLogs(state, params) {
  state.verifyLogs = state.verifyLogs || []
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 20
  const start = (page - 1) * pageSize
  return ok({
    list: state.verifyLogs.slice(start, start + pageSize),
    total: state.verifyLogs.length,
    page,
    pageSize
  })
}

function registerOnsiteCollection(state, params) {
  if (!params.studentNo) return fail('学号不能为空', 40001)
  if (!params.amount || Number(params.amount) <= 0) return fail('金额无效', 40001)
  const amount = Number(params.amount)
  const payment = state.payments.find(p => p.studentNo === params.studentNo)
  if (payment) {
    payment.paidAmount = (payment.paidAmount || 0) + amount
    const unpaid = Math.max(payment.receivableAmount - payment.paidAmount, 0)
    if (unpaid <= 0) payment.paymentStatus = 'paid'
    else payment.paymentStatus = 'partial'
    payment.lastPaymentTime = iso()
  }
  const record = {
    offlinePaymentId: `off-${now()}`,
    studentNo: params.studentNo,
    studentName: params.studentName || (payment ? payment.studentName : ''),
    amount,
    method: params.payMethod || params.method || 'wechat',
    project: params.project || '现场缴费',
    remark: params.remark || '',
    voucherFileId: params.voucherFileId || '',
    receiptImage: params.receiptImage || '',
    location: '迎新现场',
    submittedAt: iso(),
    status: 'pending'
  }
  state.offlinePayments.unshift(record)
  const updatedPayment = state.payments.find(p => p.studentNo === params.studentNo)
  return ok({
    offlinePaymentId: record.offlinePaymentId,
    updatedPaymentStatus: updatedPayment ? updatedPayment.paymentStatus : null,
    updatedPaidAmount: updatedPayment ? updatedPayment.paidAmount : 0,
    updatedUnpaidAmount: updatedPayment ? Math.max(updatedPayment.receivableAmount - updatedPayment.paidAmount, 0) : 0,
    enteredFinancePending: true
  })
}

// ── 现场收款 Mock 处理函数 ──

function getStudentBillData(state, params) {
  const keyword = params.studentNo || params.keyword || ''
  if (!keyword) return fail('请输入学号', 40001)
  const payment = state.payments.find(p => p.studentNo === keyword)
  if (!payment) return fail('未找到该学生的账单', 40400)
  const student = studentOf(payment.studentNo)
  const billId = `BILL${payment.studentNo}`
  const schoolYear = '2026-2027'
  const chargeItem = '学费'
  const unpaidAmount = Math.max(payment.receivableAmount - payment.paidAmount, 0)
  return {
    billId,
    studentId: payment.studentId,
    studentNo: payment.studentNo,
    studentName: student.name,
    college: student.college,
    major: student.major,
    className: student.className,
    schoolYear,
    chargeItem,
    totalAmount: payment.receivableAmount,
    paidAmount: payment.paidAmount,
    unpaidAmount,
    paymentStatus: payment.paymentStatus,
    paymentStatusLabel: paymentLabel(payment.paymentStatus),
    paymentStatusColor: paymentColor(payment.paymentStatus),
    lastPayTime: payment.lastPaymentTime || '',
    isGreenChannel: payment.paymentStatus === 'green_channel'
  }
}

function searchStudentBills(state, params) {
  const keyword = (params.keyword || '').trim().toLowerCase()
  if (!keyword) return fail('请输入学号或姓名', 40001)
  const matched = state.payments.filter(p => {
    const studentNo = String(p.studentNo || '').toLowerCase()
    const studentName = String(p.studentName || '').toLowerCase()
    return studentNo.includes(keyword) || studentName.includes(keyword)
  })
  if (!matched.length) return { list: [], total: 0, keyword: params.keyword }
  return {
    list: matched.map(p => {
      const student = studentOf(p.studentNo)
      const billId = `BILL${p.studentNo}`
      return {
        billId,
        studentId: p.studentId,
        studentNo: p.studentNo,
        studentName: student.name,
        college: student.college,
        major: student.major,
        className: student.className,
        schoolYear: '2026-2027',
        chargeItem: '学费',
        totalAmount: p.receivableAmount,
        paidAmount: p.paidAmount,
        unpaidAmount: Math.max(p.receivableAmount - p.paidAmount, 0),
        paymentStatus: p.paymentStatus,
        paymentStatusLabel: paymentLabel(p.paymentStatus),
        paymentStatusColor: paymentColor(p.paymentStatus),
        lastPayTime: p.lastPaymentTime || '',
        isGreenChannel: p.paymentStatus === 'green_channel'
      }
    }),
    total: matched.length,
    keyword: params.keyword
  }
}

function registerOfflinePayment(state, params) {
  if (!params.studentNo) return fail('学号不能为空', 40001)
  if (!params.amount || Number(params.amount) <= 0) return fail('请输入有效收款金额', 40001)
  const amount = Number(params.amount)
  const payment = state.payments.find(p => p.studentNo === params.studentNo)
  if (!payment) return fail('未找到该学生的账单', 40400)
  const unpaidAmount = Math.max(payment.receivableAmount - payment.paidAmount, 0)
  if (amount > unpaidAmount && unpaidAmount > 0) return fail(`收款金额不能大于未缴金额 ¥${unpaidAmount.toLocaleString()}`, 40001)

  const oldPaid = payment.paidAmount
  payment.paidAmount = oldPaid + amount
  const newUnpaid = Math.max(payment.receivableAmount - payment.paidAmount, 0)
  if (payment.paymentStatus === 'green_channel') {
    // 绿通学生缴费后状态不变
  } else if (newUnpaid <= 0) {
    payment.paymentStatus = 'paid'
  } else if (payment.paidAmount > 0) {
    payment.paymentStatus = 'partial'
  }
  payment.lastPaymentTime = iso()

  const student = studentOf(params.studentNo)
  const record = {
    offlinePaymentId: `off-${now()}`,
    id: `off-${now()}`,
    studentNo: params.studentNo,
    studentName: student.name,
    name: student.name,
    avatar: student.name.charAt(0),
    amount,
    method: params.payMethod || params.method || 'cash',
    collectionType: params.payMethod || params.method || 'cash',
    location: '迎新现场',
    remark: params.remark || '',
    voucherFileId: params.voucherFileId || '',
    submittedAt: iso(),
    time: iso().slice(5, 16).replace('T', ' '),
    status: 'pending',
    college: student.college,
    className: student.className
  }
  state.offlinePayments.unshift(record)

  const updatedPayment = state.payments.find(p => p.studentNo === params.studentNo)
  return {
    offlinePaymentId: record.offlinePaymentId,
    record,
    updatedPaymentStatus: updatedPayment ? updatedPayment.paymentStatus : null,
    updatedPaymentStatusLabel: updatedPayment ? paymentLabel(updatedPayment.paymentStatus) : null,
    updatedPaidAmount: updatedPayment ? updatedPayment.paidAmount : 0,
    updatedUnpaidAmount: updatedPayment ? Math.max(updatedPayment.receivableAmount - updatedPayment.paidAmount, 0) : 0,
    enteredFinancePending: true
  }
}

function getOfflinePaymentList(state, params) {
  const list = state.offlinePayments.map(item => {
    const student = studentOf(item.studentNo)
    const meta = item.status === 'confirmed' ? ['已确认', 'ok'] : item.status === 'voided' ? ['已作废', 'er'] : ['待确认', 'wa']
    return {
      ...item,
      id: item.offlinePaymentId || item.id,
      studentName: item.studentName || student.name,
      name: item.name || item.studentName || student.name,
      avatar: (item.name || item.studentName || student.name || '?').charAt(0),
      college: student.college,
      className: student.className,
      statusLabel: meta[0],
      badgeColor: meta[1],
      collectionType: item.collectionType || item.method || '',
      confirmTime: item.confirmTime || '',
      receiptNo: item.receiptNo || '',
      voidTime: item.voidTime || ''
    }
  })
  return filterList(list, params, ['studentNo', 'studentName', 'name', 'method', 'collectionType'])
}

function confirmOfflinePayment(state, params) {
  const item = state.offlinePayments.find(i => (i.offlinePaymentId || i.id) === params.id)
  if (!item) return fail('线下收款记录不存在', 40400)
  if (item.status === 'confirmed') return fail('该记录已确认', 40001)
  if (item.status === 'voided') return fail('已作废记录不可确认', 40001)

  const oldStatus = item.status
  item.status = 'confirmed'
  item.statusText = '已确认'
  item.confirmTime = iso()
  item.confirmPayMethod = params.collectionType || item.collectionType || item.method || ''
  item.collectionType = item.confirmPayMethod
  item.remark = params.remark || item.remark || ''
  item.confirmOperator = params.confirmedBy || '陈美玲'
  item.confirmedBy = item.confirmOperator
  item.method = item.collectionType

  // 生成收据编号
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const existingReceipts = state.offlinePayments.filter(i => i.receiptNo && i.receiptNo.includes(dateStr)).length
  const serial = String(existingReceipts + 1).padStart(6, '0')
  item.receiptNo = `RCPT${dateStr}${serial}`

  const pay = state.payments.find(i => i.studentNo === item.studentNo)
  if (pay) {
    pay.paidAmount = (pay.paidAmount || 0) + (item.amount || 0)
    pay.unpaidAmount = Math.max(pay.receivableAmount - pay.paidAmount, 0)
    if (pay.unpaidAmount <= 0) pay.paymentStatus = 'paid'
    else if (pay.paidAmount > 0) pay.paymentStatus = 'partial'
  }

  return {
    offlinePaymentId: item.offlinePaymentId || item.id,
    oldStatus,
    status: item.status,
    receiptNo: item.receiptNo,
    paymentStatus: pay?.paymentStatus,
    billStatuses: [],
    invoiceId: `inv-${item.offlinePaymentId || item.id}`
  }
}

function voidOfflinePayment(state, params) {
  const item = state.offlinePayments.find(i => (i.offlinePaymentId || i.id) === params.id)
  if (!item) return fail('线下收款记录不存在', 40400)
  if (item.status === 'voided') return fail('该单据已作废，不可重复操作', 40001)
  if (item.status !== 'confirmed') return fail('仅已确认单据可作废', 40001)

  const oldStatus = item.status
  item.status = 'voided'
  item.voidTime = iso()

  // 回退账单金额
  const pay = state.payments.find(i => i.studentNo === item.studentNo)
  if (pay) {
    pay.paidAmount = Math.max((pay.paidAmount || 0) - (item.amount || 0), 0)
    pay.unpaidAmount = Math.max(pay.receivableAmount - pay.paidAmount, 0)
    if (pay.paidAmount <= 0) {
      pay.paymentStatus = pay.paymentStatus === 'green_channel' ? 'green_channel' : 'unpaid'
    } else if (pay.unpaidAmount > 0) {
      pay.paymentStatus = 'partial'
    }
    pay.lastPaymentTime = iso()
  }

  return {
    offlinePaymentId: item.offlinePaymentId || item.id,
    oldStatus,
    status: item.status,
    paymentStatus: pay?.paymentStatus,
    message: '单据已作废，账单金额已回退'
  }
}

function getGlobalStats(state) {
  const totalStudents = state.students.length
  const checkedIn = state.checkins.filter(i => i.checkinStatus === 'checked_in').length
  const unpaid = state.payments.filter(i => ['unpaid', 'overdue'].includes(i.paymentStatus)).length
  const paid = state.payments.filter(i => i.paymentStatus === 'paid').length
  const totalFee = state.payments.reduce((s, p) => s + p.receivableAmount, 0)
  const paidFee = state.payments.reduce((s, p) => s + p.paidAmount, 0)
  return ok({
    checkin: { total: totalStudents, checkedIn, unchecked: totalStudents - checkedIn, rate: totalStudents > 0 ? Math.round(checkedIn / totalStudents * 100) : 0 },
    fees: { total: totalFee, paid: paidFee, paidCount: paid, unpaidCount: unpaid, rate: totalFee > 0 ? Math.round(paidFee / totalFee * 100) : 0 },
    aids: { total: state.scholarships.length, approved: state.scholarships.filter(i => ['final_pass', 'payment_pending', 'paid', 'completed'].includes(i.status)).length, pending: state.scholarships.filter(i => ['pending', 'first_pass', 'review_pass'].includes(i.status)).length, rejected: state.scholarships.filter(i => i.status === 'rejected').length },
    loans: { total: state.loans.length, approved: state.loans.filter(i => ['final_pass', 'payment_pending', 'paid', 'completed'].includes(i.status)).length, pending: state.loans.filter(i => ['pending', 'first_pass', 'review_pass'].includes(i.status)).length, rejected: state.loans.filter(i => i.status === 'rejected').length },
    dorm: { total: totalStudents, changes: state.roomChanges.filter(i => i.status === 'pending').length, nonDorm: state.nonDorms.length }
  })
}

function getCollegeStats(state, params) {
  return getGlobalStats(state)
}

function route(method, path, params, state) {
  const auth = handleAuth(path, method, params, state)
  if (auth) return auth

  if (path === '/dashboard/teacher') return ok({ teacher: { name: '刘晓华', avatar: '刘', college: '计算机学院', className: '2026级1班', totalStudents: state.students.length }, classStats: { totalStudents: state.students.length, checkedIn: state.checkins.filter(i => i.checkinStatus === 'checked_in').length, unchecked: state.checkins.filter(i => i.checkinStatus !== 'checked_in').length, checkinRate: 70 }, todo: { docPending: state.documents.filter(i => i.status === 'pending').length, aidPending: state.scholarships.filter(i => ['pending', 'review_pass'].includes(i.status)).length, loanPending: state.loans.filter(i => ['pending', 'review_pass'].includes(i.status)).length, feeOverdue: state.payments.filter(i => i.paymentStatus === 'overdue').length, roomChangePending: state.roomChanges.filter(i => i.status === 'pending').length, dormWithdrawPending: state.dormWithdraws.filter(i => i.status === 'pending').length, nonDormPending: state.nonDorms.filter(i => i.status === 'pending').length }, unreadCount: state.messages.teacher.filter(m => !m.read).length, quickEntries: [] })
  if (path === '/dashboard/finance') return ok({ todayReceivedAmount: 128500, paidStudentCount: state.payments.filter(i => i.paymentStatus === 'paid').length, unpaidStudentCount: state.payments.filter(i => ['unpaid', 'overdue'].includes(i.paymentStatus)).length, refundPendingCount: state.refunds.filter(i => i.status === 'pending').length, todo: { aidPayoutPending: state.scholarships.filter(i => i.status === 'payment_pending').length, loanPayoutPending: state.loans.filter(i => i.status === 'payment_pending').length, refundPending: state.refunds.filter(i => i.status === 'pending').length, processedCount: state.refunds.filter(i => i.status !== 'pending').length + state.scholarships.filter(i => ['paid', 'completed'].includes(i.status)).length + state.loans.filter(i => ['paid', 'completed'].includes(i.status)).length }, unreadCount: state.messages.finance.filter(m => !m.read).length })
  if (path === '/dashboard/government') return ok({ todayCheckinCount: state.checkins.filter(i => i.checkinStatus === 'checked_in').length, checkedInCount: state.checkins.filter(i => i.checkinStatus === 'checked_in').length, uncheckedCount: state.checkins.filter(i => i.checkinStatus !== 'checked_in').length, checkinRate: 70, todo: { roomChangePending: state.roomChanges.filter(i => i.status === 'pending').length, aidReviewPending: state.scholarships.filter(i => i.status === 'first_pass').length, loanReviewPending: state.loans.filter(i => i.status === 'first_pass').length, applicationPending: state.nonDorms.filter(i => i.status === 'pending').length }, unreadCount: state.messages.government.filter(m => !m.read).length })
  if (path === '/statistics/summary') return ok(getSummaryData(state, params.bizType, params))

  if (path === '/students/search') return ok(filterList(withStudentRows(state.students), params, ['studentNo', 'name', 'phone']))
  const classStudents = path.match(/^\/classes\/([^/]+)\/students$/)
  if (classStudents) return ok(filterList(withStudentRows(state.students.filter(s => s.classId === classStudents[1])), params, ['studentNo', 'name']))
  const studentDetail = path.match(/^\/students\/([^/]+)$/)
  if (studentDetail) return ok(studentDetailData(state, studentDetail[1]))

  if (path === '/payments/class-stats') return ok(paymentStats(state))
  if (path === '/payments/students') return ok(filterList(paymentRows(state, params), params, ['studentNo', 'studentName', 'name']))
  const payDetail = path.match(/^\/payments\/students\/([^/]+)$/)
  if (payDetail && !path.endsWith('/bills') && !path.endsWith('/records')) return ok(studentPaymentDetail(state, payDetail[1]))
  const payBills = path.match(/^\/payments\/students\/([^/]+)\/bills$/)
  if (payBills) return ok(studentPaymentDetail(state, payBills[1]).bills)
  const payRecords = path.match(/^\/payments\/students\/([^/]+)\/records$/)
  if (payRecords) return ok(studentPaymentDetail(state, payRecords[1]).records)
  if (path === '/payments/offline/pending') return ok(filterList(withStudentRows(state.offlinePayments.map(o => ({ ...o, id: o.offlinePaymentId, status: o.status, time: o.submittedAt.slice(5, 16), avatar: studentOf(o.studentNo).name.charAt(0) }))), params, ['studentNo', 'name', 'method']))
  const offlineConfirm = path.match(/^\/payments\/offline\/([^/]+)\/confirm$/)
  if (offlineConfirm && method === 'POST') return confirmOffline(state, offlineConfirm[1], params)

  if (path === '/reminders/send' && method === 'POST') return sendReminder(state, params)
  if (path === '/reminders/batch' && method === 'POST') return batchReminder(state, params)
  if (path === '/reminders/tasks') return ok(filterList(state.reminderTasks, params, ['taskName']))
  if (path === '/reminders/records') return ok(filterList(state.reminderRecords, params, ['studentNo', 'studentName']))

  if (path === '/refunds') return ok(filterList(withStudentRows(state.refunds).map(withRefundMeta), params, ['studentNo', 'studentName', 'name', 'refundNo']))
  const refundDetail = path.match(/^\/refunds\/([^/]+)$/)
  if (refundDetail) return ok(withStudentRows(state.refunds).find(i => i.refundId === refundDetail[1] || i.uid === refundDetail[1]))
  const refundAction = path.match(/^\/refunds\/([^/]+)\/(approve|reject|execute|retry)$/)
  if (refundAction && method === 'POST') return mutateRefund(state, refundAction[1], refundAction[2], params)
  if (path === '/refunds/diff') return ok(filterList(state.refunds.filter(i => i.feeType === '住宿费').map(i => ({ ...i, diffRefundId: `diff-${i.refundId}`, diffOrderNo: `DIFF-${i.refundNo}`, oldDormFee: 1800, newDormFee: 1200, diffAmount: -600, refundAmount: 600 })), params, ['studentNo', 'studentName']))
  const diffConfirm = path.match(/^\/refunds\/diff\/([^/]+)\/confirm$/)
  if (diffConfirm) return ok({ diffRefundId: diffConfirm[1], status: 'refunded', updatedAt: iso() })
  if (path === '/finance/processed-records') return ok(filterList(processedRecords(state), params, ['studentNo', 'studentName', 'summary']))

  if (path === '/documents/reviews') return ok(filterList(withStudentRows(filterDocuments(state.documents, params)), params, ['studentNo', 'studentName', 'name']))
  const docDetail = path.match(/^\/documents\/reviews\/([^/]+)$/)
  if (docDetail) return ok(withStudentRows(state.documents).find(i => i.documentReviewId === docDetail[1] || i.uid === docDetail[1]))
  const docAction = path.match(/^\/documents\/reviews\/([^/]+)\/(approve|reject)$/)
  if (docAction) return docAction[2] === 'approve' ? approveReview(state, 'documents', docAction[1], params, 'first_pass') : rejectReview(state, 'documents', docAction[1], params)

  if (path === '/scholarships') return ok(filterList(withStudentRows(applyTab(state.scholarships, params, roleOf(params, state))).map(withReviewMeta), params, ['studentNo', 'studentName', 'name', 'applicationNo']))
  const aidDetail = path.match(/^\/scholarships\/([^/]+)$/)
  if (aidDetail) return ok(withStudentRows(state.scholarships).find(i => i.scholarshipId === aidDetail[1] || i.uid === aidDetail[1]))
  const aidAction = path.match(/^\/scholarships\/([^/]+)\/(approve|reject|disburse)$/)
  if (aidAction) return aidAction[2] === 'disburse' ? disburse(state, 'scholarships', aidAction[1], params) : aidAction[2] === 'approve' ? approveReview(state, 'scholarships', aidAction[1], params) : rejectReview(state, 'scholarships', aidAction[1], params)

  if (path === '/loans') return ok(filterList(withStudentRows(applyTab(state.loans, params, roleOf(params, state))).map(withReviewMeta), params, ['studentNo', 'studentName', 'name', 'applicationNo', 'receiptNo']))
  const loanDetail = path.match(/^\/loans\/([^/]+)$/)
  if (loanDetail) return ok(withStudentRows(state.loans).find(i => i.loanId === loanDetail[1] || i.uid === loanDetail[1]))
  const loanAction = path.match(/^\/loans\/([^/]+)\/(approve|reject|disburse)$/)
  if (loanAction) return loanAction[2] === 'disburse' ? disburse(state, 'loans', loanAction[1], params) : loanAction[2] === 'approve' ? approveReview(state, 'loans', loanAction[1], params) : rejectReview(state, 'loans', loanAction[1], params)

  if (path === '/checkin/statistics') return ok(checkinStats(state))
  if (path === '/checkin/students') return ok(filterList(state.checkins, params, ['studentNo', 'studentName', 'name']))
  const checkinAction = path.match(/^\/checkin\/students\/([^/]+)\/(confirm|cancel|delay|block)$/)
  if (checkinAction) return mutateCheckin(state, checkinAction[1], checkinAction[2], params)

  if (path === '/uniform/sizes') return ok(filterList(state.uniforms, params, ['studentNo', 'studentName', 'name']))
  const uniformDetail = path.match(/^\/uniform\/sizes\/([^/]+)$/)
  if (uniformDetail) return ok(state.uniforms.find(i => i.studentId === uniformDetail[1] || i.studentNo === uniformDetail[1]))
  if (path === '/uniform/sizes/statistics') return ok({ total: state.uniforms.length, filledCount: state.uniforms.filter(i => i.status === 'filled').length, emptyCount: state.uniforms.filter(i => i.status === 'empty').length, abnormalCount: state.uniforms.filter(i => i.status === 'abnormal').length, byClothingSize: Object.entries(statusCounts(state.uniforms, 'clothingSize')).map(([size, count]) => ({ size, count })), byShoeSize: Object.entries(statusCounts(state.uniforms, 'shoeSize')).map(([size, count]) => ({ size, count })) })
  if (path === '/supplies/distribution-records') return ok(filterList(supplyRows(state), params, ['studentNo', 'studentName', 'itemName']))

  if (path === '/dormitories/students') return ok(filterList(dormRows(state), params, ['studentNo', 'studentName', 'name', 'buildingName', 'roomNo']))
  const dormStudentDetail = path.match(/^\/dormitories\/students\/([^/]+)$/)
  if (dormStudentDetail) return ok(dormDetail(state, dormStudentDetail[1]))
  if (path === '/dormitories/buildings' || path === '/dormitory/buildings') return ok(dormBuildings())
  const dormRooms = path.match(/^\/dormitories\/buildings\/([^/]+)\/rooms$/)
  if (dormRooms) return ok(dormRoomsData(dormRooms[1]))
  const legacyDormRooms = path.match(/^\/dormitory\/building\/([^/]+)\/rooms$/)
  if (legacyDormRooms) return ok(dormRoomsData(legacyDormRooms[1]))
  if (path === '/dormitory/stats') return ok({ total: state.students.length, assigned: state.students.filter(i => i.dormText !== '校外住宿').length, unassigned: 0, nonDorm: state.students.filter(i => i.dormText === '校外住宿').length })
  if (path === '/dormitory/list') return ok(filterList(dormRows(state), params, ['studentNo', 'studentName', 'name', 'buildingName', 'roomNo']))
  const legacyDormStudent = path.match(/^\/dormitory\/student\/([^/]+)$/)
  if (legacyDormStudent) return ok(dormDetail(state, legacyDormStudent[1]))
  const dormList = path.match(/^\/dormitory\/(room-change|withdraw|non-dorm)-applications$/)
  if (dormList) return ok(filterList(dormApplicationRows(state, dormList[1]), params, ['studentNo', 'studentName', 'name', 'reason']))
  const dormDetailAction = path.match(/^\/dormitory\/(room-change|withdraw|non-dorm)-applications\/([^/]+)(?:\/(approve|reject))?$/)
  if (dormDetailAction) {
    if (dormDetailAction[3] && method === 'POST') return mutateDormApplication(state, dormDetailAction[1], dormDetailAction[2], dormDetailAction[3], params)
    return ok(dormApplicationRows(state, dormDetailAction[1]).find(i => i.applicationId === dormDetailAction[2] || i.uid === dormDetailAction[2]))
  }

  if (path === '/invoices') {
    if (method === 'POST') return ok({ invoiceId: `inv-${now()}`, invoiceNo: `INV${now()}`, status: 'issued', issuedAt: iso(), fileId: `file-inv-${now()}` })
    return ok(filterList(invoiceRows(state), params, ['invoiceNo', 'studentNo', 'studentName', 'itemName']))
  }
  const invoiceDetail = path.match(/^\/invoices\/([^/]+)$/)
  if (invoiceDetail) return ok(invoiceRows(state).find(i => i.invoiceId === invoiceDetail[1]) || invoiceRows(state)[0])
  const invoiceAction = path.match(/^\/invoices\/([^/]+)\/(reprint|void)$/)
  if (invoiceAction) return ok({ invoiceId: invoiceAction[1], status: invoiceAction[2] === 'void' ? 'voided' : 'issued', updatedAt: iso() })

  if (path === '/messages') {
    if (method === 'GET') return ok(filterList((state.messages[params.role || roleOf(params, state)] || []).filter(m => params.status ? m.status === params.status : true), params, ['title', 'content', 'type']))
    if (method === 'DELETE') { state.messages[params.role || roleOf(params, state)] = []; return ok({ deletedCount: 999 }) }
  }
  if (path === '/messages/unread-count') return ok({ count: (state.messages[params.role || roleOf(params, state)] || []).filter(m => !m.read).length, byType: {} })
  if (path === '/messages/read-all' && method === 'PUT') { const list = state.messages[params.role || roleOf(params, state)] || []; list.forEach(m => { m.read = true; m.status = 'read'; m.readAt = iso() }); return ok({ updatedCount: list.length }) }
  const messageRead = path.match(/^\/messages\/([^/]+)\/read$/)
  if (messageRead) return mutateMessage(state, messageRead[1], 'read')
  const messageDelete = path.match(/^\/messages\/([^/]+)$/)
  if (messageDelete && method === 'DELETE') return mutateMessage(state, messageDelete[1], 'delete')
  if (path === '/messages/templates') return ok(filterList([{ templateCode: 'FEE_REMINDER', name: '缴费催缴', channels: ['sms', 'site'] }], params, ['name']))
  if (path === '/messages/send') return ok({ recordId: `send-${now()}`, status: 'sent' })
  if (path === '/messages/send-records') return ok(filterList([], params, ['templateCode']))

  const materialMatch = path.match(/^\/materials\/([^/]+)\/([^/]+)$/)
  if (materialMatch) return ok({ bizType: materialMatch[1], bizId: materialMatch[2], files: materialFiles(materialMatch[2]) })
  const filePreview = path.match(/^\/files\/([^/]+)\/preview$/)
  if (filePreview) return ok({ previewUrl: `https://mock.local/preview/${filePreview[1]}`, expiresAt: iso() })
  const fileDownload = path.match(/^\/files\/([^/]+)\/download$/)
  if (fileDownload) return ok({ downloadUrl: `https://mock.local/download/${fileDownload[1]}`, fileName: `${fileDownload[1]}.pdf`, expiresAt: iso() })
  if (path === '/files/package') return ok({ taskId: `pkg-${now()}`, status: 'finished', fileId: `pkg-file-${now()}`, downloadUrl: 'https://mock.local/download/material-package.zip' })
  if (path === '/files/upload') return ok({ fileId: `file-${now()}`, fileName: params.name || 'mock-upload.pdf', mimeType: 'application/pdf', size: 1000, url: '/api/v1/files/mock/download', previewUrl: '/api/v1/files/mock/preview', uploadedAt: iso() })

  if (path === '/export/tasks' && method === 'POST') { const task = { taskId: `exp-${now()}`, exportType: params.exportType, status: 'finished', progress: 100, fileId: `file-exp-${now()}`, downloadUrl: `https://mock.local/export/${params.exportType || 'data'}.xlsx`, fileName: `${params.exportType || 'export'}_${new Date().toISOString().slice(0, 10)}.xlsx`, createdAt: iso(), expiresAt: iso() }; state.exportTasks.unshift(task); return ok(task) }
  const exportTask = path.match(/^\/export\/tasks\/([^/]+)$/)
  if (exportTask) return ok(state.exportTasks.find(t => t.taskId === exportTask[1]) || { taskId: exportTask[1], status: 'finished', progress: 100, downloadUrl: 'https://mock.local/export/mock.xlsx' })
  const exportDownload = path.match(/^\/export\/tasks\/([^/]+)\/download$/)
  if (exportDownload) return ok({ downloadUrl: `https://mock.local/export/${exportDownload[1]}.xlsx`, fileName: `${exportDownload[1]}.xlsx` })

  if (path.startsWith('/reports/')) return ok({ summary: getSummaryData(state, path.includes('refund') ? 'refund' : 'payment', params), groups: [], points: [] })
  if (path === '/events/business-state') return ok(filterList(state.events, params, ['bizType', 'bizId']))

  if (path === '/auth/permissions') return ok(getPermissionsData(state, params))
  if (path === '/staff/checkin/payment/verify') return ok(verifyPayment(state, params))
  if (path === '/staff/checkin/payment/verify-log' && method === 'POST') return ok(logVerify(state, params))
  if (path === '/staff/checkin/payment/verify-logs') return ok(getVerifyLogs(state, params))
  if (path === '/staff/checkin/offline-payment' && method === 'POST') return ok(registerOnsiteCollection(state, params))
  if (path === '/government/stats/global') return ok(getGlobalStats(state))
  if (path === '/government/stats/college') return ok(getCollegeStats(state, params))

  // ── 现场收款 / 线下收款确认 ──
  if (path === '/finance/offline-payment/search-student') return ok(searchStudentBills(state, params))
  if (path === '/finance/offline-payment/student-bill') return ok(getStudentBillData(state, params))
  if (path === '/finance/offline-payment/register' && method === 'POST') return ok(registerOfflinePayment(state, params))
  if (path === '/finance/offline-payment/list') return ok(getOfflinePaymentList(state, params))
  if (path === '/finance/offline-payment/confirm' && method === 'POST') return ok(confirmOfflinePayment(state, params))
  if (path === '/finance/offline-payment/void' && method === 'POST') return ok(voidOfflinePayment(state, params))

  return ok({})
}

function paymentRows(state, params) {
  let rows = state.payments
  if (params.status === 'unpaid') rows = rows.filter(i => ['unpaid', 'overdue'].includes(i.paymentStatus))
  return withStudentRows(rows).map(i => ({ ...i, status: i.paymentStatus, statusLabel: paymentLabel(i.paymentStatus), statusColor: paymentColor(i.paymentStatus), daysLabel: i.paymentStatus === 'overdue' ? '逾期未缴费' : paymentLabel(i.paymentStatus), avatarBg: `var(--${paymentColor(i.paymentStatus)}-bg)` }))
}
const paymentLabel = s => ({ paid: '已缴', unpaid: '未缴', overdue: '逾期', partial: '部分未缴', green_channel: '绿色通道' }[s] || s)
const paymentColor = s => ({ paid: 'ok', unpaid: 'wa', overdue: 'er', partial: 'in', green_channel: 'pu' }[s] || 'wa')
function paymentStats(state) {
  const rows = state.payments
  return { totalStudents: rows.length, paidCount: rows.filter(i => i.paymentStatus === 'paid').length, unpaidCount: rows.filter(i => ['unpaid', 'overdue'].includes(i.paymentStatus)).length, partialCount: rows.filter(i => i.paymentStatus === 'partial').length, overdueCount: rows.filter(i => i.paymentStatus === 'overdue').length, greenChannelCount: rows.filter(i => i.paymentStatus === 'green_channel').length, totalReceivableAmount: rows.reduce((s, i) => s + i.receivableAmount, 0), totalPaidAmount: rows.reduce((s, i) => s + i.paidAmount, 0), totalUnpaidAmount: rows.reduce((s, i) => s + i.unpaidAmount, 0) }
}
function studentPaymentDetail(state, id) {
  const payment = state.payments.find(i => [i.studentId, i.studentNo].includes(id)) || state.payments[0]
  const student = studentOf(payment.studentNo)
  return { student, summary: payment, bills: [{ billId: `bill-${payment.studentNo}`, billNo: `BILL${payment.studentNo}`, itemName: '学费', itemType: 'tuition', receivableAmount: payment.receivableAmount, paidAmount: payment.paidAmount, discountAmount: 0, unpaidAmount: payment.unpaidAmount, priority: 1, dueDate: payment.dueDate, status: payment.paymentStatus }], records: payment.paidAmount ? [{ recordId: `rec-${payment.studentNo}`, paymentNo: `PAY${payment.studentNo}`, amount: payment.paidAmount, method: 'offline', channel: 'mock', paidAt: '2026-05-16 09:00', operatorName: 'Mock 财务', invoiceId: `inv-${payment.studentNo}`, sourceType: 'offline' }] : [], reminders: state.reminderRecords.filter(i => i.studentNo === payment.studentNo), refunds: state.refunds.filter(i => i.studentNo === payment.studentNo), invoices: [] }
}
function studentDetailData(state, id) {
  const student = state.students.find(i => [i.studentId, i.studentNo].includes(id)) || state.students[0]
  const pay = state.payments.find(i => i.studentNo === student.studentNo)
  return { ...student, paymentSummary: pay, documentSummary: state.documents.find(i => i.studentNo === student.studentNo), aidSummary: state.scholarships.find(i => i.studentNo === student.studentNo), loanSummary: state.loans.find(i => i.studentNo === student.studentNo), checkin: state.checkins.find(i => i.studentNo === student.studentNo), auditLogs: [] }
}
function filterDocuments(list, params) {
  if (params.tab === 'passed') return list.filter(i => ['first_pass', 'department_review', 'final_pass'].includes(i.status))
  if (params.tab === 'rejected') return list.filter(i => i.status === 'rejected')
  if (params.tab === 'pending') return list.filter(i => i.status === 'pending')
  return list
}
function confirmOffline(state, id, params) {
  const item = state.offlinePayments.find(i => i.offlinePaymentId === id)
  if (!item) return fail('线下收款记录不存在', 40400)
  const oldStatus = item.status
  item.status = 'confirmed'
  item.confirmTime = iso()
  item.collectionType = params.collectionType || item.collectionType || item.method
  item.collectionRemark = params.remark || ''
  item.method = item.collectionType
  const pay = state.payments.find(i => i.studentNo === item.studentNo)
  if (pay) { pay.paidAmount = Math.max(pay.paidAmount, params.confirmedAmount || item.amount); pay.unpaidAmount = Math.max(pay.receivableAmount - pay.paidAmount, 0); pay.paymentStatus = pay.unpaidAmount === 0 ? 'paid' : 'partial'; pay.payStatus = pay.paymentStatus }
  return ok({ paymentRecordId: `rec-${id}`, oldStatus, status: item.status, paymentStatus: pay?.paymentStatus, billStatuses: [], invoiceId: `inv-${id}` })
}
function sendReminder(state, params) {
  const pay = state.payments.find(i => [i.studentId, i.studentNo].includes(params.studentId))
  if (pay) { pay.urgeCount += 1; pay.lastUrgeAt = iso() }
  const record = { reminderId: `rem-${now()}`, studentId: pay?.studentId || params.studentId, studentNo: pay?.studentNo || params.studentId, studentName: pay?.studentName || '', billId: params.billIds?.[0] || '', amount: pay?.unpaidAmount || 0, channel: (params.channels || ['site']).join(','), templateCode: params.templateCode || 'FEE_REMINDER', sendStatus: 'success', sentAt: iso(), operatorName: 'Mock' }
  state.reminderRecords.unshift(record)
  return ok({ reminderId: record.reminderId, sentAt: record.sentAt, sendResults: [{ channel: record.channel, status: 'success' }], urgeCount: pay?.urgeCount || 1 })
}
function batchReminder(state, params) {
  const ids = params.studentIds || []
  ids.forEach(studentId => sendReminder(state, { ...params, studentId }))
  const task = { taskId: `task-${now()}`, taskName: '批量催缴', channels: params.channels || ['site'], targetCount: ids.length, sentCount: ids.length, failedCount: 0, status: 'finished', createdBy: state.currentUserId, createdAt: iso(), finishedAt: iso() }
  state.reminderTasks.unshift(task)
  return ok({ taskId: task.taskId, total: ids.length, accepted: ids.length, skipped: 0, skippedReasons: [] })
}
function mutateRefund(state, id, action, params) {
  const item = state.refunds.find(i => i.refundId === id || i.uid === id)
  if (!item) return fail('退款记录不存在', 40400)
  const oldStatus = item.status
  if (action === 'approve') item.status = 'approved'
  if (action === 'reject') { item.status = 'rejected'; item.rejectReason = params.rejectReason || params.opinion || '财务驳回' }
  if (action === 'execute' || action === 'retry') item.status = 'refunded'
  return ok(mutationResult(state, 'refund', id, oldStatus, item.status, { node: '财务处理', result: action, remark: params.opinion || params.rejectReason || '', time: iso() }))
}
function processedRecords(state) {
  return [...state.scholarships.filter(i => ['paid', 'completed'].includes(i.status)).map(i => ({ recordId: `pr-${i.uid}`, bizType: 'scholarship', bizId: i.uid, studentNo: i.studentNo, studentName: i.studentName, amount: i.amount, status: i.status, processedAt: i.payout?.paidAt || i.submittedAt, operatorName: 'Mock 财务', summary: '助学金打款' })), ...state.loans.filter(i => ['paid', 'completed'].includes(i.status)).map(i => ({ recordId: `pr-${i.uid}`, bizType: 'loan', bizId: i.uid, studentNo: i.studentNo, studentName: i.studentName, amount: i.amount, status: i.status, processedAt: i.payout?.paidAt || i.submittedAt, operatorName: 'Mock 财务', summary: '助学贷款打款' })), ...state.refunds.filter(i => i.status !== 'pending').map(i => ({ recordId: `pr-${i.uid}`, bizType: 'refund', bizId: i.uid, studentNo: i.studentNo, studentName: i.studentName, amount: i.amount, status: i.status, processedAt: i.applyTime, operatorName: 'Mock 财务', summary: '退费处理' }))]
}
function checkinStats(state) {
  const total = state.checkins.length
  const checkedIn = state.checkins.filter(i => i.checkinStatus === 'checked_in').length
  return { total, checkedIn, unchecked: total - checkedIn, todayCheckedIn: checkedIn, checkinRate: total ? Number(((checkedIn / total) * 100).toFixed(1)) : 0, byCollege: [], byClass: [] }
}
function mutateCheckin(state, id, action, params) {
  const item = state.checkins.find(i => [i.studentId, i.studentNo].includes(id))
  if (!item) return fail('报到记录不存在', 40400)
  const oldStatus = item.checkinStatus
  const map = { confirm: 'checked_in', cancel: 'pending', delay: 'delayed', block: 'blocked' }
  item.checkinStatus = map[action] || 'pending'
  item.lastStatus = { checked_in: '已报到', pending: '待报到', delayed: '延期', blocked: '阻塞' }[item.checkinStatus]
  item.checkedInAt = action === 'confirm' ? iso() : ''
  item.remark = params.remark || params.reason || ''
  return ok({ studentId: item.studentId, checkinStatus: item.checkinStatus, checkedInAt: item.checkedInAt, operatorName: 'Mock', statistics: checkinStats(state), oldStatus, newStatus: item.checkinStatus })
}
function mutateMessage(state, id, action) {
  for (const role of Object.keys(state.messages)) {
    const list = state.messages[role]
    const idx = list.findIndex(m => m.messageId === id || m.id === id)
    if (idx >= 0) {
      if (action === 'delete') { list.splice(idx, 1); return ok({ deletedCount: 1 }) }
      list[idx].read = true; list[idx].status = 'read'; list[idx].readAt = iso(); return ok({ updatedCount: 1 })
    }
  }
  return fail('消息不存在', 40400)
}

function withReviewMeta(item) {
  const meta = {
    pending: ['待审批', 'wa'],
    first_pass: ['审批中', 'in'],
    review_pass: ['待终审', 'in'],
    final_pass: ['待打款', 'pu'],
    payment_pending: ['待打款', 'pu'],
    paid: ['已完成', 'ok'],
    completed: ['已完结', 'ok'],
    rejected: ['已驳回', 'er']
  }[item.status] || [item.status, 'wa']
  return { ...item, statusLabel: item.statusLabel || meta[0], badgeColor: item.badgeColor || meta[1] }
}

function withRefundMeta(item) {
  const meta = {
    pending: ['待审核', 'wa'],
    approved: ['待财务确认打款', 'wa'],
    processing: ['待财务确认打款', 'wa'],
    refunded: ['已完结', 'ok'],
    failed: ['退费失败', 'er'],
    rejected: ['已驳回', 'er']
  }[item.status] || [item.status, 'wa']
  return { ...item, statusLabel: item.statusLabel || meta[0], badgeColor: item.badgeColor || meta[1] }
}

function supplyRows(state) {
  return state.students.map((student, idx) => ({
    recordId: `sup-${idx + 1}`,
    studentId: student.studentId,
    studentNo: student.studentNo,
    studentName: student.name,
    name: student.name,
    className: student.className,
    itemType: idx % 2 ? 'uniform' : 'daily',
    itemName: idx % 2 ? '军训服套装' : '迎新用品包',
    size: state.uniforms[idx]?.clothingSize || 'M',
    status: idx % 3 === 0 ? 'pending' : 'distributed',
    distributedAt: idx % 3 === 0 ? '' : `2026-05-${18 + idx} 10:00`,
    operatorName: idx % 3 === 0 ? '' : 'Mock 教师'
  }))
}

function dormRows(state) {
  return state.students.map(student => {
    const [buildingName = '', roomNo = '', bedNo = ''] = student.dormText === '校外住宿' ? ['校外住宿', '', ''] : student.dormText.split(' ')
    return {
      studentId: student.studentId,
      studentNo: student.studentNo,
      studentName: student.name,
      name: student.name,
      gender: student.gender,
      className: student.className,
      buildingId: buildingName.includes('6号楼') ? 'b-6' : 'b-3',
      buildingName,
      roomNo,
      bedNo,
      dormText: student.dormText,
      dormFee: student.dormText === '校外住宿' ? 0 : 1800,
      status: student.dormText === '校外住宿' ? 'non_dorm' : 'assigned'
    }
  })
}

function dormDetail(state, id) {
  const row = dormRows(state).find(i => [i.studentId, i.studentNo].includes(id)) || dormRows(state)[0]
  return {
    ...row,
    student: studentOf(row.studentNo),
    currentDorm: { buildingName: row.buildingName, roomNo: row.roomNo, bedNo: row.bedNo, dormText: row.dormText },
    applications: [...state.roomChanges, ...state.dormWithdraws, ...state.nonDorms].filter(i => i.studentNo === row.studentNo),
    feeStandard: { itemName: '住宿费', amount: row.dormFee },
    diffOrders: []
  }
}

function dormBuildings() {
  return [
    { buildingId: 'b-3', buildingName: '3号楼', genderLimit: 'male', floorCount: 6, roomCount: 120, bedCount: 720, availableBedCount: 36 },
    { buildingId: 'b-6', buildingName: '6号楼', genderLimit: 'female', floorCount: 6, roomCount: 128, bedCount: 768, availableBedCount: 42 }
  ]
}

function dormRoomsData(buildingId) {
  return Array.from({ length: 6 }).map((_, idx) => ({
    roomId: `${buildingId}-room-${idx + 1}`,
    roomNo: `${300 + idx}`,
    floor: 3,
    capacity: 6,
    occupiedCount: idx % 2 ? 5 : 4,
    availableBedCount: idx % 2 ? 1 : 2,
    feeStandard: 1800,
    beds: Array.from({ length: 6 }).map((__, bedIdx) => ({ bedNo: `${bedIdx + 1}床`, occupied: bedIdx < (idx % 2 ? 5 : 4) }))
  }))
}

function dormApplicationRows(state, type) {
  const map = { 'room-change': 'roomChanges', withdraw: 'dormWithdraws', 'non-dorm': 'nonDorms' }
  return withStudentRows(state[map[type]] || [])
}

function mutateDormApplication(state, type, id, action, params) {
  const map = { 'room-change': 'roomChanges', withdraw: 'dormWithdraws', 'non-dorm': 'nonDorms' }
  const item = state[map[type]].find(i => i.applicationId === id || i.uid === id)
  if (!item) return fail('住宿申请不存在', 40400)
  const oldStatus = item.status
  item.status = action === 'approve' ? 'approved' : 'rejected'
  const log = { node: '住宿审批', result: action === 'approve' ? '通过' : '驳回', remark: params.remark || params.rejectReason || '', time: iso() }
  item.auditLogs = item.auditLogs || []
  item.auditLogs.unshift(log)
  return ok({ ...mutationResult(state, type, id, oldStatus, item.status, log), applicationId: id, dormitoryChanged: action === 'approve', diffOrderId: params.generateDiffOrder === false ? '' : `diff-${id}` })
}

function invoiceRows(state) {
  return state.payments.filter(i => i.paidAmount > 0).map(payment => ({
    invoiceId: `inv-${payment.studentNo}`,
    invoiceNo: `INV${payment.studentNo}`,
    studentId: payment.studentId,
    studentNo: payment.studentNo,
    studentName: payment.studentName,
    itemName: '学费',
    amount: payment.paidAmount,
    status: 'issued',
    issuedAt: '2026-05-16 09:00',
    fileId: `file-inv-${payment.studentNo}`
  }))
}

export function isMockUrl(url, globalConfig) {
  return !!globalConfig?.useMock && typeof url === 'string' && url.includes('/api/v1')
}

export function mockRequest(method, url, params = {}) {
  const state = readState()
  const { path, query } = parseUrl(url)
  const response = route(String(method || 'GET').toUpperCase(), path, paramsOf(query, params), state)
  saveState(state)
  return Promise.resolve({ data: response, statusCode: response.code === 0 ? 200 : 400, header: {}, errMsg: 'request:ok' })
}

export function resetMockState() {
  const state = seedState()
  saveState(state)
  return state
}
