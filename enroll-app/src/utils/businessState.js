const STORAGE_PREFIX = 'enroll_mobile_business_v2_'

export const REVIEW_STATUS = {
  PENDING: 'pending',
  FIRST_PASS: 'first_pass',
  REVIEW_PASS: 'review_pass',
  FINAL_PASS: 'final_pass',
  PAYMENT_PENDING: 'payment_pending',
  PAID: 'paid',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  DEPARTMENT_REVIEW: 'review_pass',
  SCHOOL_REVIEW: 'final_pass',
  APPROVED: 'final_pass',
  DISBURSED: 'paid'
}

export const MATERIAL_STATUS = {
  PENDING: 'pending',
  FIRST_PASS: 'first_pass',
  DEPARTMENT_REVIEW: 'department_review',
  FINAL_PASS: 'final_pass',
  REJECTED: 'rejected'
}

export const SIZE_STATUS = {
  EMPTY: 'empty',
  FILLED: 'filled',
  ABNORMAL: 'abnormal'
}

export const DORM_REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

export const REFUND_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REFUNDED: 'refunded'
}

const REFUND_STATUS_MAP = {
  [REFUND_STATUS.PENDING]: REFUND_STATUS.PENDING,
  pending_review: REFUND_STATUS.PENDING,
  '待审核': REFUND_STATUS.PENDING,
  [REFUND_STATUS.APPROVED]: REFUND_STATUS.APPROVED,
  pending_payment: REFUND_STATUS.APPROVED,
  payout_pending: REFUND_STATUS.APPROVED,
  '待财务确认打款': REFUND_STATUS.APPROVED,
  [REFUND_STATUS.REJECTED]: REFUND_STATUS.REJECTED,
  '已驳回': REFUND_STATUS.REJECTED,
  [REFUND_STATUS.REFUNDED]: REFUND_STATUS.REFUNDED,
  completed: REFUND_STATUS.REFUNDED,
  '已退费': REFUND_STATUS.REFUNDED,
  '已完结': REFUND_STATUS.REFUNDED
}

const OFFLINE_COLLECTION_STATUS_MAP = {
  pending: 'pending',
  pending_confirmation: 'pending',
  '待确认': 'pending',
  confirmed: 'confirmed',
  '已确认': 'confirmed',
  voided: 'voided',
  '已作废': 'voided'
}

const PAYMENT_STATUS_MAP = {
  unpaid: 'unpaid',
  unpaid_fee: 'unpaid',
  '未缴': 'unpaid',
  '未缴费': 'unpaid',
  overdue: 'overdue',
  overdue_unpaid: 'overdue',
  '逾期': 'overdue',
  '逾期未缴': 'overdue',
  partial: 'partial',
  partial_paid: 'partial',
  '部分未缴': 'partial',
  '部分未缴费': 'partial',
  paid: 'paid',
  completed: 'paid',
  '已缴': 'paid',
  '已缴费': 'paid',
  channel: 'channel',
  green_channel: 'channel',
  '绿通': 'channel',
  '绿色通道': 'channel'
}

const MATERIAL_STATUS_MAP = {
  [MATERIAL_STATUS.PENDING]: MATERIAL_STATUS.PENDING,
  pending_review: MATERIAL_STATUS.PENDING,
  '待审核': MATERIAL_STATUS.PENDING,
  [MATERIAL_STATUS.FIRST_PASS]: MATERIAL_STATUS.FIRST_PASS,
  approved: MATERIAL_STATUS.FIRST_PASS,
  passed: MATERIAL_STATUS.FIRST_PASS,
  '已通过': MATERIAL_STATUS.FIRST_PASS,
  [MATERIAL_STATUS.DEPARTMENT_REVIEW]: MATERIAL_STATUS.DEPARTMENT_REVIEW,
  [MATERIAL_STATUS.FINAL_PASS]: MATERIAL_STATUS.FINAL_PASS,
  [MATERIAL_STATUS.REJECTED]: MATERIAL_STATUS.REJECTED,
  returned: MATERIAL_STATUS.REJECTED,
  rejected: MATERIAL_STATUS.REJECTED,
  '已退回': MATERIAL_STATUS.REJECTED
}

const DORM_REVIEW_STATUS_MAP = {
  [DORM_REVIEW_STATUS.PENDING]: DORM_REVIEW_STATUS.PENDING,
  pending_review: DORM_REVIEW_STATUS.PENDING,
  '待审核': DORM_REVIEW_STATUS.PENDING,
  '待终审': DORM_REVIEW_STATUS.PENDING,
  '班主任已通过': DORM_REVIEW_STATUS.PENDING,
  [DORM_REVIEW_STATUS.APPROVED]: DORM_REVIEW_STATUS.APPROVED,
  passed: DORM_REVIEW_STATUS.APPROVED,
  '已通过': DORM_REVIEW_STATUS.APPROVED,
  [DORM_REVIEW_STATUS.REJECTED]: DORM_REVIEW_STATUS.REJECTED,
  returned: DORM_REVIEW_STATUS.REJECTED,
  '已驳回': DORM_REVIEW_STATUS.REJECTED
}

const nowText = () => {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const statusMeta = {
  pending: { label: '待审核', short: '待审', color: 'wa', filterKey: 'pending' },
  first_pass: { label: '初审通过', short: '初审通过', color: 'ok', filterKey: 'first_pass' },
  review_pass: { label: '复审通过', short: '复审通过', color: 'ok', filterKey: 'review_pass' },
  final_pass: { label: '终审通过', short: '终审通过', color: 'ok', filterKey: 'final_pass' },
  payment_pending: { label: '待打款', short: '待打款', color: 'wa', filterKey: 'payment_pending' },
  paid: { label: '已打款', short: '已打款', color: 'ok', filterKey: 'paid' },
  completed: { label: '已完成', short: '已完成', color: 'ok', filterKey: 'completed' },
  rejected: { label: '已驳回', short: '已驳回', color: 'er', filterKey: 'rejected' },
  department_review: { label: '复审通过', short: '复审通过', color: 'ok', filterKey: 'review_pass' },
  school_review: { label: '终审通过', short: '终审通过', color: 'ok', filterKey: 'final_pass' },
  approved: { label: '终审通过', short: '终审通过', color: 'ok', filterKey: 'final_pass' },
  disbursed: { label: '已打款', short: '已打款', color: 'ok', filterKey: 'paid' }
}

export const materialStatusMeta = {
  pending: { label: '待审核', color: 'wa' },
  first_pass: { label: '已通过', color: 'ok' },
  department_review: { label: '已通过', color: 'ok' },
  final_pass: { label: '已通过', color: 'ok' },
  rejected: { label: '已退回', color: 'er' }
}

export const sizeStatusMeta = {
  empty: { label: '未填写', color: 'wa' },
  filled: { label: '已填写', color: 'ok' },
  abnormal: { label: '尺码异常', color: 'er' }
}

export const dormReviewStatusMeta = {
  pending: { label: '待审核', color: 'wa', filterKey: 'pending' },
  approved: { label: '已通过', color: 'ok', filterKey: 'approved' },
  rejected: { label: '已驳回', color: 'er', filterKey: 'rejected' }
}

export const refundStatusMeta = {
  pending: { label: '待审核', color: 'wa', filterKey: 'pending' },
  approved: { label: '待财务确认打款', color: 'wa', filterKey: 'approved' },
  rejected: { label: '已驳回', color: 'er', filterKey: 'rejected' },
  refunded: { label: '已完结', color: 'ok', filterKey: 'refunded' }
}

const students = [
  { sid: '2026010001', name: '王明辉', gender: '男', className: '2026级1班', college: '计算机学院', major: '软件工程', phone: '13875615678', parentPhone: '13984564321', idNo: '430102200812120019', address: '湖南省长沙市岳麓区麓山南路932号', dorm: '3号楼 305室 2床', checkedIn: false },
  { sid: '2026010002', name: '李雪梅', gender: '女', className: '2026级1班', college: '计算机学院', major: '软件工程', phone: '13690881235', parentPhone: '13976223415', idNo: '430103200803050027', address: '湖南省株洲市天元区泰山路18号', dorm: '6号楼 214室 1床', checkedIn: true },
  { sid: '2026010008', name: '张宇轩', gender: '男', className: '2026级1班', college: '计算机学院', major: '网络工程', phone: '13755119002', parentPhone: '13822134489', idNo: '430111200809180034', address: '湖南省湘潭市雨湖区韶山东路86号', dorm: '3号楼 308室 4床', checkedIn: false },
  { sid: '2026010015', name: '陈晓琳', gender: '女', className: '2026级1班', college: '计算机学院', major: '信息安全', phone: '13508466731', parentPhone: '13908466731', idNo: '430104200811210046', address: '湖南省长沙市开福区芙蓉中路一段92号', dorm: '6号楼 218室 3床', checkedIn: true },
  { sid: '2026010022', name: '刘佳慧', gender: '女', className: '2026级1班', college: '计算机学院', major: '软件工程', phone: '13707315520', parentPhone: '13973109012', idNo: '430105200810110052', address: '湖南省衡阳市蒸湘区解放大道38号', dorm: '6号楼 220室 2床', checkedIn: true },
  { sid: '2026010030', name: '赵明', gender: '男', className: '2026级1班', college: '计算机学院', major: '网络工程', phone: '13908421331', parentPhone: '13873345621', idNo: '430106200807300060', address: '湖南省常德市武陵区洞庭大道116号', dorm: '3号楼 312室 5床', checkedIn: true },
  { sid: '2026010035', name: '孙丽', gender: '女', className: '2026级1班', college: '计算机学院', major: '信息安全', phone: '13607318872', parentPhone: '13787213454', idNo: '430107200812010071', address: '湖南省岳阳市岳阳楼区求索东路20号', dorm: '6号楼 222室 4床', checkedIn: true },
  { sid: '2026010039', name: '孙文浩', gender: '男', className: '2026级1班', college: '计算机学院', major: '软件工程', phone: '13874885531', parentPhone: '13974885531', idNo: '430108200801160083', address: '湖南省益阳市赫山区桃花仑西路58号', dorm: '3号楼 316室 1床', checkedIn: false },
  { sid: '2026010042', name: '周小龙', gender: '男', className: '2026级1班', college: '计算机学院', major: '网络工程', phone: '13739002311', parentPhone: '13639002311', idNo: '430109200809230095', address: '湖南省邵阳市大祥区宝庆中路66号', dorm: '3号楼 318室 2床', checkedIn: false }
  ,{ sid: '2026010018', name: '周华强', gender: '男', className: '2026级1班', college: '计算机学院', major: '软件工程', phone: '13800180018', parentPhone: '13900180018', idNo: '430110200807180018', address: '湖南省长沙市雨花区劳动东路88号', dorm: '3号楼 320室 3床', checkedIn: false }
  ,{ sid: '2026010027', name: '吴静雯', gender: '女', className: '2026级1班', college: '计算机学院', major: '信息安全', phone: '13800270027', parentPhone: '13900270027', idNo: '430111200806270027', address: '湖南省长沙市天心区书院路100号', dorm: '6号楼 224室 2床', checkedIn: true }
  ,{ sid: '2026010033', name: '马晓东', gender: '男', className: '2026级1班', college: '计算机学院', major: '网络工程', phone: '13800330033', parentPhone: '13900330033', idNo: '430112200805030033', address: '湖南省长沙县星沙大道66号', dorm: '3号楼 322室 1床', checkedIn: true }
]

const seed = {
  students,
  fees: [
    { sid: '2026010001', amount: '5,800', payStatus: 'overdue', urgeCount: 2, urgeTimes: ['2026-05-18 09:10', '2026-05-21 10:25'], billId: 'BILL20260001', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010002', amount: '5,800', payStatus: 'overdue', urgeCount: 1, urgeTimes: ['2026-05-21 09:30'], billId: 'BILL20260002', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010008', amount: '5,800', payStatus: 'overdue', urgeCount: 3, urgeTimes: ['2026-05-17 09:00', '2026-05-19 09:00', '2026-05-21 09:00'], billId: 'BILL20260003', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010015', amount: '5,800', payStatus: 'unpaid', urgeCount: 0, urgeTimes: [], billId: 'BILL20260004', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010022', amount: '5,800', payStatus: 'partial', urgeCount: 1, urgeTimes: ['2026-05-20 14:18'], billId: 'BILL20260005', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010030', amount: '5,800', payStatus: 'paid', urgeCount: 0, urgeTimes: [], billId: 'BILL20260006', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010035', amount: '5,800', payStatus: 'paid', urgeCount: 0, urgeTimes: [], billId: 'BILL20260007', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010039', amount: '2,900', payStatus: 'unpaid', urgeCount: 0, urgeTimes: [], billId: 'BILL20260008', schoolYear: '2026-2027', chargeItem: '教材费' },
    { sid: '2026010042', amount: '0', payStatus: 'channel', urgeCount: 0, urgeTimes: [], billId: 'BILL20260009', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010018', amount: '5,800', payStatus: 'partial', urgeCount: 0, urgeTimes: [], billId: 'BILL20260010', schoolYear: '2026-2027', chargeItem: '学费' },
    { sid: '2026010027', amount: '3,200', payStatus: 'partial', urgeCount: 0, urgeTimes: [], billId: 'BILL20260011', schoolYear: '2026-2027', chargeItem: '学费' }
  ],
  documents: [
    { uid: 'doc-1', sid: '2026010001', status: MATERIAL_STATUS.PENDING, submittedAt: '05-15 14:32', tags: ['身份证', '录取通知书', '户口本', '证件照'], logs: [{ node: '学生提交', time: '2026-05-15 14:32', result: '已提交' }] },
    { uid: 'doc-2', sid: '2026010002', status: MATERIAL_STATUS.PENDING, submittedAt: '05-15 16:07', tags: ['身份证', '录取通知书', '户口本', '证件照'], logs: [{ node: '学生提交', time: '2026-05-15 16:07', result: '已提交' }] },
    { uid: 'doc-3', sid: '2026010008', status: MATERIAL_STATUS.PENDING, submittedAt: '05-16 09:15', tags: ['身份证', '录取通知书', '户口本', '证件照'], logs: [{ node: '学生提交', time: '2026-05-16 09:15', result: '已提交' }] },
    { uid: 'doc-4', sid: '2026010022', status: MATERIAL_STATUS.FIRST_PASS, submittedAt: '05-14 11:20', tags: ['身份证', '录取通知书', '户口本', '证件照'], logs: [{ node: '班主任审核', time: '2026-05-14 11:20', result: '审核通过' }] },
    { uid: 'doc-5', sid: '2026010030', status: MATERIAL_STATUS.FINAL_PASS, submittedAt: '05-14 14:55', tags: ['身份证', '录取通知书', '户口本', '证件照'], logs: [{ node: '班主任审核', time: '2026-05-14 14:55', result: '审核通过' }] },
    { uid: 'doc-6', sid: '2026010039', status: MATERIAL_STATUS.REJECTED, submittedAt: '05-15 09:30', tags: ['身份证', '录取通知书', '户口本', '证件照'], reason: '身份证照片模糊', logs: [{ node: '班主任审核', time: '2026-05-15 09:30', result: '已退回', remark: '身份证照片模糊' }] }
  ],
        aids: [
        { uid: 'aid-1', sid: '2026010039', name: '孙文浩', amount: '4,000', type: '国家助学金', status: REVIEW_STATUS.PENDING, date: '05-14', logs: [{ node: '学生申请', time: '2026-05-14 16:22', result: '已提交' }] },
        { uid: 'aid-2', sid: '2026010015', name: '陈晓琳', amount: '3,000', type: '学校助学金', status: REVIEW_STATUS.PENDING, date: '05-15', logs: [{ node: '学生申请', time: '2026-05-15 10:02', result: '已提交' }] },
        { uid: 'aid-3', sid: '2026010027', name: '吴静雯', amount: '2,000', type: '社会助学金', status: REVIEW_STATUS.PENDING, date: '05-16', logs: [{ node: '学生申请', time: '2026-05-16 09:18', result: '已提交' }] },
        { uid: 'aid-4', sid: '2026010001', name: '王明辉', amount: '5,000', type: '临时困难补助', status: REVIEW_STATUS.FIRST_PASS, date: '05-17', logs: [{ node: '学生申请', time: '2026-05-17 08:30', result: '已提交' }, { node: '辅导员初审', time: '2026-05-19 10:00', result: '初审通过' }] },
        { uid: 'aid-5', sid: '2026010002', name: '李雪梅', amount: '3,000', type: '国家助学金', status: REVIEW_STATUS.FIRST_PASS, date: '05-18', logs: [{ node: '学生申请', time: '2026-05-18 09:00', result: '已提交' }, { node: '辅导员初审', time: '2026-05-20 10:00', result: '初审通过' }] },
        { uid: 'aid-6', sid: '2026010033', name: '马晓东', amount: '3,500', type: '国家助学金', status: REVIEW_STATUS.REVIEW_PASS, date: '05-13', logs: [{ node: '学院负责人复审', time: '2026-05-13 11:20', result: '复审通过' }] },
        { uid: 'aid-7', sid: '2026010008', name: '张宇轩', amount: '2,500', type: '学校助学金', status: REVIEW_STATUS.FINAL_PASS, date: '05-12', logs: [{ node: '学工处审批', time: '2026-05-12 14:10', result: '学工处审批通过' }] },
        { uid: 'aid-8', sid: '2026010030', name: '赵明', amount: '3,000', type: '临时困难补助', status: REVIEW_STATUS.PAYMENT_PENDING, date: '05-11', logs: [{ node: '学工处审批', time: '2026-05-11 10:00', result: '审批通过，待财务打款' }] },
        { uid: 'aid-9', sid: '2026010035', name: '孙丽', amount: '2,000', type: '国家助学金', status: REVIEW_STATUS.COMPLETED, date: '05-10', logs: [{ node: '财务打款', time: '2026-05-10 16:30', result: '已完成' }] },
        { uid: 'aid-10', sid: '2026010022', name: '刘佳慧', amount: '3,500', type: '社会助学金', status: REVIEW_STATUS.REJECTED, date: '05-09', logs: [{ node: '辅导员初审', time: '2026-05-09 10:00', result: '已驳回', remark: '材料不完整' }] }
      ],
      loans: [
    { uid: 'loan-1', sid: '2026010015', amount: '8,000', status: REVIEW_STATUS.PENDING, type: '生源地助学贷款', logs: [{ node: '学生提交', time: '2026-05-20 09:15', result: '已提交' }] },
    { uid: 'loan-2', sid: '2026010022', amount: '6,000', status: REVIEW_STATUS.PENDING, type: '生源地助学贷款', logs: [{ node: '学生提交', time: '2026-05-20 10:42', result: '已提交' }] },
    { uid: 'loan-3', sid: '2026010030', amount: '10,000', status: REVIEW_STATUS.FIRST_PASS, type: '校园地助学贷款', logs: [{ node: '班主任初审', time: '2026-05-19 16:20', result: '初审通过' }] },
    { uid: 'loan-4', sid: '2026010008', amount: '8,000', status: REVIEW_STATUS.FINAL_PASS, type: '生源地助学贷款', logs: [{ node: '教师终审', time: '2026-05-18 15:40', result: '终审通过' }] },
    { uid: 'loan-5', sid: '2026010035', amount: '6,000', status: REVIEW_STATUS.REJECTED, type: '生源地助学贷款', logs: [{ node: '院系审核', time: '2026-05-18 09:30', result: '已驳回', remark: '材料缺失' }] },
    { uid: 'loan-6', sid: '2026010042', amount: '8,000', status: REVIEW_STATUS.PAID, type: '生源地助学贷款', logs: [{ node: '财务打款', time: '2026-05-17 14:10', result: '已打款' }] },
    { uid: 'loan-7', sid: '2026010039', amount: '7,000', status: REVIEW_STATUS.PAYMENT_PENDING, type: '生源地助学贷款', logs: [{ node: '教师终审', time: '2026-05-21 13:00', result: '终审通过，待打款' }] },
    { uid: 'loan-8', sid: '2026010027', amount: '9,000', status: REVIEW_STATUS.REVIEW_PASS, type: '校园地助学贷款', logs: [{ node: '政务复审', time: '2026-05-17 14:30', result: '复审通过' }] },
    { uid: 'loan-9', sid: '2026010002', amount: '6,000', status: REVIEW_STATUS.COMPLETED, type: '生源地助学贷款', logs: [{ node: '财务打款', time: '2026-05-14 09:20', result: '已完成' }] },
    { uid: 'loan-10', sid: '2026010033', amount: '5,000', status: REVIEW_STATUS.PAYMENT_PENDING, type: '校园地助学贷款', logs: [{ node: '政务终审', time: '2026-05-20 16:10', result: '终审通过，待打款' }] }
  ],
  refunds: [
    { uid: 'rf-1', sid: '2026010001', feeType: '退住宿费', reason: '退出宿舍，改为走读', amount: 1200, status: REFUND_STATUS.PENDING, applyTime: '2026-05-20 10:10', logs: [{ node: '学生申请', time: '2026-05-20 10:10', result: '已提交' }] },
    { uid: 'rf-2', sid: '2026010015', feeType: '退教材费', reason: '重复缴费', amount: 320, status: REFUND_STATUS.PENDING, applyTime: '2026-05-20 15:30', logs: [{ node: '学生申请', time: '2026-05-20 15:30', result: '已提交' }] },
    { uid: 'rf-3', sid: '2026010039', feeType: '退住宿费', reason: '宿舍补差退款', amount: 800, status: REFUND_STATUS.APPROVED, applyTime: '2026-05-18 09:20', logs: [{ node: '财务审核', time: '2026-05-18 15:20', result: '已通过' }] },
    { uid: 'rf-4', sid: '2026010002', feeType: '退教材费', reason: '课程包调整', amount: 320, status: REFUND_STATUS.REFUNDED, applyTime: '2026-05-14 08:50', logs: [{ node: '财务退费', time: '2026-05-14 16:20', result: '已退费' }] },
    { uid: 'rf-5', sid: '2026010035', feeType: '退军训服费', reason: '尺码异常暂缓发放', amount: 180, status: REFUND_STATUS.REJECTED, applyTime: '2026-05-13 12:10', logs: [{ node: '财务审核', time: '2026-05-13 16:40', result: '已驳回', remark: '需学生重新提交说明' }] }
  ],
  offlineCollections: [
    { id: 'oc-1', sid: '2026010001', method: '现金缴纳', location: '收款台1', time: '05-16 09:12', amount: 5800, status: 'pending', logs: [{ node: '学生线下缴费', time: '2026-05-16 09:12', result: '待确认' }] },
    { id: 'oc-2', sid: '2026010002', method: '银行转账', location: '自助', time: '05-16 09:35', amount: 7000, status: 'pending', logs: [{ node: '学生线下缴费', time: '2026-05-16 09:35', result: '待确认' }] },
    { id: 'oc-3', sid: '2026010008', method: '现金缴纳', location: '收款台2', time: '05-16 10:05', amount: 5800, status: 'pending', logs: [{ node: '学生线下缴费', time: '2026-05-16 10:05', result: '待确认' }] },
    { id: 'oc-4', sid: '2026010030', method: '现金', collectionType: '现金', location: '收款台1', time: '05-16 08:50', amount: 5800, status: 'confirmed', confirmedBy: '陈美玲', confirmTime: '2026-05-16 08:55', logs: [{ node: '财务确认', time: '2026-05-16 08:55', result: '已确认' }] }
  ],
  differenceRefunds: [
    { id: 'df-1', sid: '2026010039', roomFrom: '6人间', roomTo: '4人间', refundType: '差额退款', amount: 400, status: 'pending', submittedAt: '2026-05-18 10:20' },
    { id: 'df-2', sid: '2026010027', roomFrom: '4人间', roomTo: '6人间', refundType: '差额退款', amount: 200, status: 'pending', submittedAt: '2026-05-18 14:30' },
    { id: 'df-3', sid: '2026010008', roomFrom: '8人间', roomTo: '4人间', refundType: '差额退款', amount: 600, status: 'refunded', submittedAt: '2026-05-16 09:20', confirmedAt: '2026-05-16 15:10' }
  ],
  receipts: [
    { id: 'rp-1', sid: '2026010001', receiptNo: 'PJ20260516001', receiptType: '学费收据', amount: 5800, reason: '原件遗失', status: 'pending', submittedAt: '2026-05-20 09:20' },
    { id: 'rp-2', sid: '2026010002', receiptNo: 'PJ20260516002', receiptType: '住宿费收据', amount: 1200, reason: '报销需要', status: 'pending', submittedAt: '2026-05-20 10:15' },
    { id: 'rp-3', sid: '2026010030', receiptNo: 'PJ20260514003', receiptType: '学费收据', amount: 5800, reason: '补打', status: 'reprinted', reprintTime: '2026-05-14 14:30' }
  ],
  urgeTasks: [
    { id: 'ut-1', name: '学费逾期催缴 - 5月第二批', scope: '计算机学院', targetCount: 5, sentCount: 5, paidCount: 2, createdAt: '2026-05-16 08:00', status: 'running' },
    { id: 'ut-2', name: '学费逾期催缴 - 5月第一批', scope: '全校', targetCount: 89, sentCount: 89, paidCount: 89, createdAt: '2026-05-09 08:00', status: 'completed' }
  ],
  roomChanges: [
    { uid: 'rc-1', sid: '2026010008', oldDorm: '3号楼 308室 4床', targetDorm: '3号楼 305室 1床', reason: '与同专业同学合住，便于课程项目协作', applyTime: '2026-05-20 10:20', status: DORM_REVIEW_STATUS.PENDING, logs: [{ node: '学生申请', time: '2026-05-20 10:20', result: '已提交' }] },
    { uid: 'rc-2', sid: '2026010039', oldDorm: '3号楼 316室 1床', targetDorm: '3号楼 318室 5床', reason: '原宿舍临近施工区域，休息受影响', applyTime: '2026-05-21 08:42', status: DORM_REVIEW_STATUS.PENDING, logs: [{ node: '学生申请', time: '2026-05-21 08:42', result: '已提交' }] },
    { uid: 'rc-3', sid: '2026010030', oldDorm: '3号楼 312室 5床', targetDorm: '3号楼 310室 2床', reason: '学院统一调整', applyTime: '2026-05-18 14:10', status: DORM_REVIEW_STATUS.APPROVED, logs: [{ node: '班主任审核', time: '2026-05-18 16:00', result: '已通过' }] }
  ],
  dormWithdraws: [
    { uid: 'dw-1', sid: '2026010015', currentDorm: '6号楼 218室 3床', reason: '家庭住址距学校较近，申请走读不住宿', applyTime: '2026-05-20 11:12', status: DORM_REVIEW_STATUS.PENDING, logs: [{ node: '学生申请', time: '2026-05-20 11:12', result: '已提交' }] },
    { uid: 'dw-2', sid: '2026010035', currentDorm: '6号楼 222室 4床', reason: '身体原因需家长照顾，申请退宿', applyTime: '2026-05-19 09:20', status: DORM_REVIEW_STATUS.REJECTED, logs: [{ node: '班主任审核', time: '2026-05-19 15:20', result: '已驳回', remark: '需补充医院证明' }] }
  ],
  nonDorm: [
    { uid: 'gnd-1', sid: '2026010008', address: '校园路12号', reason: '家庭住址距学校较近，为节省住宿费用，申请校外住宿', applyTime: '2026-05-12 10:30', status: DORM_REVIEW_STATUS.PENDING, logs: [{ node: '学生提交', time: '2026-05-12 10:30', result: '已提交' }, { node: '班主任审核', time: '2026-05-15 09:20', result: '审核通过' }] },
    { uid: 'gnd-2', sid: '2026010027', address: '学府花园3栋', reason: '家庭原因申请校外住宿', applyTime: '2026-05-14 08:15', status: DORM_REVIEW_STATUS.PENDING, logs: [{ node: '学生提交', time: '2026-05-14 08:15', result: '已提交' }, { node: '班主任审核', time: '2026-05-16 11:00', result: '审核通过' }] },
    { uid: 'gnd-3', sid: '2026010015', address: '阳光小区5号楼', reason: '家住学校附近，申请校外住宿', applyTime: '2026-05-10 14:00', status: DORM_REVIEW_STATUS.PENDING, logs: [{ node: '学生提交', time: '2026-05-10 14:00', result: '已提交' }, { node: '班主任审核', time: '2026-05-12 09:30', result: '审核通过' }] }
  ],
  sizes: [
    { sid: '2026010001', clothing: 'XL', shoe: 43, height: 178, weight: 72, remark: '肩宽偏宽', status: SIZE_STATUS.FILLED },
    { sid: '2026010002', clothing: 'M', shoe: 37, height: 164, weight: 50, remark: '', status: SIZE_STATUS.FILLED },
    { sid: '2026010008', clothing: 'L', shoe: 42, height: 174, weight: 65, remark: '', status: SIZE_STATUS.FILLED },
    { sid: '2026010015', clothing: 'S', shoe: 36, height: 158, weight: 47, remark: '', status: SIZE_STATUS.FILLED },
    { sid: '2026010022', clothing: 'M', shoe: 38, height: 166, weight: 52, remark: '', status: SIZE_STATUS.FILLED },
    { sid: '2026010030', clothing: 'XXL', shoe: 44, height: 184, weight: 82, remark: '建议试穿', status: SIZE_STATUS.FILLED },
    { sid: '2026010035', clothing: 'M', shoe: 37, height: 162, weight: 49, remark: '', status: SIZE_STATUS.FILLED },
    { sid: '2026010039', clothing: '', shoe: '', height: '', weight: '', remark: '', status: SIZE_STATUS.EMPTY },
    { sid: '2026010042', clothing: 'XXXL', shoe: 49, height: 188, weight: 94, remark: '鞋码超男生常规范围，需单独采购', status: SIZE_STATUS.ABNORMAL }
  ],
  messages: {
    teacher: [
      { id: 't-1', type: '催缴提醒', icon: '!', color: 'var(--er)', time: '10:15', content: '班级仍有 5 名学生学费逾期，请跟进催缴', read: false },
      { id: 't-2', type: '资料审核', icon: 'i', color: 'var(--in)', time: '09:30', content: '孙文浩重新提交了资料，请尽快审核', read: false },
      { id: 't-3', type: '助贷审核', icon: '*', color: 'var(--ok)', time: '昨天', content: '马晓东助贷申请已通过学院复审，等待学工处终审', read: true }
    ],
    finance: [
      { id: 'f-1', type: '收款确认', icon: '¥', color: 'var(--ok)', time: '09:05', content: '今日新增 12 笔线下收款待确认', read: false },
      { id: 'f-2', type: '退费审批', icon: '!', color: 'var(--wa)', time: '昨天', content: '3 条退费申请等待财务处理', read: true }
    ],
    government: [
      { id: 'g-1', type: '终审提醒', icon: '*', color: 'var(--pu)', time: '11:20', content: '助学金终审有 4 条记录待处理', read: false },
      { id: 'g-2', type: '换房审批', icon: 'i', color: 'var(--in)', time: '昨天', content: '校外住宿材料已进入政务复审', read: true }
    ]
  }
}

const clone = value => JSON.parse(JSON.stringify(value))

const key = name => `${STORAGE_PREFIX}${name}`
const lastChangeKey = collection => `${STORAGE_PREFIX}last_change_${collection}`

const REVIEW_STATUS_TABS = [
  { label: '待审批', statuses: [REVIEW_STATUS.PENDING], color: 'brand' },
  { label: '审批中', statuses: [REVIEW_STATUS.FIRST_PASS, REVIEW_STATUS.REVIEW_PASS, REVIEW_STATUS.FINAL_PASS, REVIEW_STATUS.PAYMENT_PENDING], color: 'wa' },
  { label: '已完结', statuses: [REVIEW_STATUS.REJECTED, REVIEW_STATUS.PAID, REVIEW_STATUS.COMPLETED], color: 'ok' }
]

export const REVIEW_TAB_GROUPS = {
  teacher: REVIEW_STATUS_TABS,
  government: REVIEW_STATUS_TABS,
  finance: REVIEW_STATUS_TABS
}

export const REFUND_TAB_GROUPS = [
  { label: '待审核', statuses: [REFUND_STATUS.PENDING], color: 'brand' },
  { label: '待财务确认打款', statuses: [REFUND_STATUS.APPROVED], color: 'wa' },
  { label: '已完结', statuses: [REFUND_STATUS.REFUNDED, REFUND_STATUS.REJECTED], color: 'ok' }
]

export const PAYMENT_TAB_GROUPS = [
  { label: '未缴费', statuses: ['unpaid', 'overdue'], color: 'wa' },
  { label: '部分未缴费', statuses: ['partial'], color: 'in' },
  { label: '已缴费', statuses: ['paid'], color: 'ok' },
  { label: '绿色通道', statuses: ['channel', 'green_channel'], color: 'pu' }
]

export const MATERIAL_TAB_GROUPS = [
  { label: '待审核', statuses: [MATERIAL_STATUS.PENDING], color: 'brand' },
  { label: '已通过', statuses: [MATERIAL_STATUS.FIRST_PASS, MATERIAL_STATUS.DEPARTMENT_REVIEW, MATERIAL_STATUS.FINAL_PASS], color: 'ok' },
  { label: '已退回', statuses: [MATERIAL_STATUS.REJECTED], color: 'er' }
]

export const DORM_REVIEW_TAB_GROUPS = [
  { label: '待审核', statuses: [DORM_REVIEW_STATUS.PENDING], color: 'brand' },
  { label: '已通过', statuses: [DORM_REVIEW_STATUS.APPROVED], color: 'ok' },
  { label: '已驳回', statuses: [DORM_REVIEW_STATUS.REJECTED], color: 'er' }
]

export const REVIEW_STATUS_MAP = {
  [REVIEW_STATUS.PENDING]: REVIEW_STATUS.PENDING,
  todo: REVIEW_STATUS.PENDING,
  pending_review: REVIEW_STATUS.PENDING,
  pending_approval: REVIEW_STATUS.PENDING,
  '待审核': REVIEW_STATUS.PENDING,
  '待审批': REVIEW_STATUS.PENDING,
  [REVIEW_STATUS.FIRST_PASS]: REVIEW_STATUS.FIRST_PASS,
  initial_pass: REVIEW_STATUS.FIRST_PASS,
  in_review: REVIEW_STATUS.FIRST_PASS,
  processing: REVIEW_STATUS.FIRST_PASS,
  '初审通过': REVIEW_STATUS.FIRST_PASS,
  '审批中': REVIEW_STATUS.FIRST_PASS,
  [REVIEW_STATUS.REVIEW_PASS]: REVIEW_STATUS.REVIEW_PASS,
  department_review: REVIEW_STATUS.REVIEW_PASS,
  review_approved: REVIEW_STATUS.REVIEW_PASS,
  '复审通过': REVIEW_STATUS.REVIEW_PASS,
  [REVIEW_STATUS.FINAL_PASS]: REVIEW_STATUS.FINAL_PASS,
  school_review: REVIEW_STATUS.FINAL_PASS,
  approved: REVIEW_STATUS.FINAL_PASS,
  '终审通过': REVIEW_STATUS.FINAL_PASS,
  [REVIEW_STATUS.PAYMENT_PENDING]: REVIEW_STATUS.PAYMENT_PENDING,
  payout_pending: REVIEW_STATUS.PAYMENT_PENDING,
  '待打款': REVIEW_STATUS.PAYMENT_PENDING,
  [REVIEW_STATUS.PAID]: REVIEW_STATUS.PAID,
  disbursed: REVIEW_STATUS.PAID,
  '已打款': REVIEW_STATUS.PAID,
  [REVIEW_STATUS.COMPLETED]: REVIEW_STATUS.COMPLETED,
  finished: REVIEW_STATUS.COMPLETED,
  done: REVIEW_STATUS.COMPLETED,
  '已完成': REVIEW_STATUS.COMPLETED,
  '已完结': REVIEW_STATUS.COMPLETED,
  [REVIEW_STATUS.REJECTED]: REVIEW_STATUS.REJECTED,
  returned: REVIEW_STATUS.REJECTED,
  rejected_review: REVIEW_STATUS.REJECTED,
  '已驳回': REVIEW_STATUS.REJECTED,
  '已退回': REVIEW_STATUS.REJECTED
}

export function normalizeStatusKey(value) {
  return REVIEW_STATUS_MAP[value] || value
}

export function adaptReviewStatus(item = {}) {
  const status = normalizeStatusKey(item.status || item.filterKey || '')
  const meta = statusMeta[status] || {}
  return {
    ...item,
    status,
    statusLabel: meta.label || item.statusLabel || status,
    badgeColor: meta.color || item.badgeColor || 'wa',
    filterKey: meta.filterKey || status
  }
}

export function matchesStatusGroup(item, statuses) {
  return statuses.includes(item?.status || item?.filterKey)
}

const GROUP_BADGE_COLOR_MAP = {
  '待审批': 'wa',
  '待审核': 'wa',
  '审批中': 'in',
  '待财务确认打款': 'wa',
  '已完结': 'ok',
  '未缴费': 'wa',
  '部分未缴费': 'in',
  '已缴费': 'ok',
  '绿色通道': 'pu',
  '已通过': 'ok',
  '已退回': 'er',
  '已驳回': 'er'
}

function withListGroupStatus(item, group) {
  return {
    ...item,
    listStatusLabel: group.label,
    listBadgeColor: GROUP_BADGE_COLOR_MAP[group.label] || item.badgeColor || 'wa'
  }
}

export function buildReviewStatusSummary(list, role = 'teacher') {
  const groups = REVIEW_TAB_GROUPS[role] || REVIEW_TAB_GROUPS.teacher
  const records = list.map(adaptReviewStatus)
  return groups.map(group => {
    const items = records
      .filter(item => group.statuses.includes(item.status))
      .map(item => withListGroupStatus(item, group))
    return {
      label: group.label,
      count: items.length,
      color: group.color,
      items
    }
  })
}

export function buildReviewTabs(list, role = 'teacher') {
  return buildReviewStatusSummary(list, role).map(({ label, count, color }) => ({ label, count, color }))
}

export function filterReviewByTab(list, role = 'teacher', tabIndex = 0) {
  const summary = buildReviewStatusSummary(list, role)
  return summary[tabIndex]?.items || summary[0]?.items || []
}

export function getReviewTabIndex(item, role = 'teacher') {
  const groups = REVIEW_TAB_GROUPS[role] || REVIEW_TAB_GROUPS.teacher
  const status = adaptReviewStatus(item).status
  const index = groups.findIndex(group => group.statuses.includes(status))
  return index >= 0 ? index : 0
}

export function buildFundingReviewSteps(item = {}) {
  const record = adaptReviewStatus(item)
  const submittedAt = record.logs?.find(log => /学生/.test(log.node))?.time?.slice(0, 10) || '已提交'
  const steps = [
    { label: '学生提交申请', sub: submittedAt, done: true, current: false, popping: false },
    { label: '辅导员初审', sub: '待进行', done: false, current: false, popping: false },
    { label: '学院负责人复审', sub: '待进行', done: false, current: false, popping: false },
    { label: '学工处审批', sub: '待进行', done: false, current: false, popping: false },
    { label: '财务打款', sub: '待进行', done: false, current: false, popping: false }
  ]
  const complete = (index, sub = '已通过') => {
    steps[index] = { ...steps[index], sub, done: true, current: false }
  }
  const current = (index, sub = '当前步骤') => {
    steps[index] = { ...steps[index], sub, done: false, current: true }
  }

  switch (record.status) {
    case REVIEW_STATUS.PENDING:
      current(1)
      break
    case REVIEW_STATUS.FIRST_PASS:
      complete(1)
      current(2, '待复审')
      break
    case REVIEW_STATUS.REVIEW_PASS:
      complete(1)
      complete(2)
      current(3)
      break
    case REVIEW_STATUS.FINAL_PASS:
    case REVIEW_STATUS.PAYMENT_PENDING:
      complete(1)
      complete(2)
      complete(3)
      current(4, '待打款')
      break
    case REVIEW_STATUS.PAID:
    case REVIEW_STATUS.COMPLETED:
      complete(1)
      complete(2)
      complete(3)
      complete(4, '已完成')
      break
    case REVIEW_STATUS.REJECTED:
      steps[1] = { ...steps[1], sub: '已驳回' }
      break
    default:
      current(1)
  }
  return steps
}

export function buildRefundTabs(list) {
  return REFUND_TAB_GROUPS.map(group => ({
    label: group.label,
    count: list.filter(item => matchesStatusGroup(item, group.statuses)).length,
    color: group.color
  }))
}

export function filterRefundByTab(list, tabIndex = 0) {
  const group = REFUND_TAB_GROUPS[tabIndex] || REFUND_TAB_GROUPS[0]
  return list
    .filter(item => matchesStatusGroup(item, group.statuses))
    .map(item => withListGroupStatus(item, group))
}

export function getRefundTabIndex(item) {
  const index = REFUND_TAB_GROUPS.findIndex(group => matchesStatusGroup(item, group.statuses))
  return index >= 0 ? index : 0
}

export function buildPaymentTabs(list) {
  return PAYMENT_TAB_GROUPS.map(group => ({
    label: group.label,
    count: list.filter(item => group.statuses.includes(item.payStatus || item.paymentStatus)).length,
    color: group.color
  }))
}

export function filterPaymentByTab(list, tabIndex = 0) {
  const group = PAYMENT_TAB_GROUPS[tabIndex] || PAYMENT_TAB_GROUPS[0]
  return list
    .filter(item => group.statuses.includes(item.payStatus || item.paymentStatus))
    .map(item => withListGroupStatus(item, group))
}

export function buildMaterialTabs(list) {
  return MATERIAL_TAB_GROUPS.map(group => ({
    label: group.label,
    count: list.filter(item => matchesStatusGroup(item, group.statuses)).length,
    color: group.color
  }))
}

export function filterMaterialByTab(list, tabIndex = 0) {
  const group = MATERIAL_TAB_GROUPS[tabIndex] || MATERIAL_TAB_GROUPS[0]
  return list
    .filter(item => matchesStatusGroup(item, group.statuses))
    .map(item => withListGroupStatus(item, group))
}

export function getMaterialTabIndex(item) {
  const index = MATERIAL_TAB_GROUPS.findIndex(group => matchesStatusGroup(item, group.statuses))
  return index >= 0 ? index : 0
}

export function buildMaterialReviewSteps(item = {}) {
  const submittedAt = item.logs?.find(log => /学生/.test(log.node))?.time?.slice(0, 10) || item.submittedAt || '已提交'
  const steps = [
    { label: '学生提交', sub: submittedAt, done: true, current: false, popping: false },
    { label: '教师审核', sub: '当前步骤', done: false, current: true, popping: false }
  ]
  if ([MATERIAL_STATUS.FIRST_PASS, MATERIAL_STATUS.DEPARTMENT_REVIEW, MATERIAL_STATUS.FINAL_PASS].includes(item.status)) {
    steps[1] = { label: '教师审核', sub: '已通过', done: true, current: false, popping: false }
  } else if (item.status === MATERIAL_STATUS.REJECTED) {
    steps[1] = { label: '教师审核', sub: '已退回', done: false, current: false, popping: false }
  }
  return steps
}

export function buildDormReviewTabs(list) {
  return DORM_REVIEW_TAB_GROUPS.map(group => ({
    label: group.label,
    count: list.filter(item => matchesStatusGroup(item, group.statuses)).length,
    color: group.color
  }))
}

export function filterDormReviewByTab(list, tabIndex = 0) {
  const group = DORM_REVIEW_TAB_GROUPS[tabIndex] || DORM_REVIEW_TAB_GROUPS[0]
  return list
    .filter(item => matchesStatusGroup(item, group.statuses))
    .map(item => withListGroupStatus(item, group))
}

function notifyBusinessStateChange(collection, item) {
  try {
    const time = nowText()
    uni.setStorageSync(`${STORAGE_PREFIX}version`, `${Date.now()}`)
    uni.setStorageSync(lastChangeKey(collection), JSON.stringify({ uid: item?.uid || '', status: item?.status || '', time }))
    if (typeof uni.$emit === 'function') {
      uni.$emit('business-state-change', { collection, uid: item?.uid || '', status: item?.status || '', time })
    }
  } catch (e) { /* ignore */ }
}

export function getLastBusinessChange(collection) {
  try {
    const raw = uni.getStorageSync(lastChangeKey(collection))
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

export function loadState(name) {
  try {
    const raw = uni.getStorageSync(key(name))
    if (raw) return JSON.parse(raw)
  } catch (e) { /* ignore */ }
  const value = clone(seed[name])
  saveState(name, value)
  return value
}

export function saveState(name, value) {
  try { uni.setStorageSync(key(name), JSON.stringify(value)) } catch (e) { /* ignore */ }
}

export function getStudents() {
  return loadState('students')
}

export function getStudent(sid) {
  const list = getStudents()
  return list.find(s => s.sid === sid) || null
}

export function updateStudentCheckin(sid, checkedIn) {
  const list = loadState('students')
  const item = list.find(student => student.sid === sid)
  if (item) item.checkedIn = checkedIn
  saveState('students', list)
  if (item) notifyBusinessStateChange('students', item)
  return item
}

function ensureClassCoverage(collection, list, createRecord) {
  const next = [...list]
  let changed = false
  getStudents().forEach(student => {
    if (!next.some(item => item.sid === student.sid)) {
      next.push(createRecord(student))
      changed = true
    }
  })
  if (changed) saveState(collection, next)
  return next
}

export function withStudent(record, metaMap = statusMeta) {
  const student = getStudent(record.sid) || {}
  const meta = metaMap[record.status] || {}
  return {
    ...record,
    ...student,
    uid: record.uid,
    sid: record.sid,
    id: record.sid,
    avatar: (record.name || student.name || '?').charAt(0),
    name: record.name || student.name || '未知学生',
    college: student.college || '计算机学院',
    className: student.className || '2026级1班',
    statusLabel: meta.label || record.status,
    badgeColor: meta.color || record.badgeColor || 'wa',
    filterKey: meta.filterKey || record.status
  }
}

export function getFeeList() {
  const records = ensureClassCoverage('fees', loadState('fees'), student => ({
    sid: student.sid,
    amount: '5,800',
    payStatus: 'unpaid',
    urgeCount: 0,
    urgeTimes: [],
    billId: `BILL${student.sid}`,
    schoolYear: '2026-2027',
    chargeItem: '学费'
  }))
  return records.map(fee => {
    const student = getStudent(fee.sid) || {}
    const payStatus = PAYMENT_STATUS_MAP[fee.payStatus || fee.paymentStatus || fee.statusLabel] || 'unpaid'
    const statusMap = {
      paid: { label: '已缴', color: 'ok', days: '已缴清' },
      overdue: { label: '逾期', color: 'er', days: '逾期未缴费' },
      unpaid: { label: '未缴', color: 'wa', days: '未缴费' },
      partial: { label: '部分未缴', color: 'in', days: '部分未缴' },
      channel: { label: '绿通', color: 'pu', days: '绿色通道' }
    }
    const meta = statusMap[payStatus] || statusMap.unpaid
    const expectedAmount = Number(String(fee.expectedAmount || fee.amount || '0').replace(/,/g, '')) || 0
    const paidAmount = fee.paidAmount !== undefined
      ? Number(fee.paidAmount)
      : payStatus === 'paid'
        ? expectedAmount
        : payStatus === 'partial'
          ? Math.round(expectedAmount / 2)
          : 0
    const dueAmount = payStatus === 'channel' ? 0 : Math.max(expectedAmount - paidAmount, 0)
    const overdueDays = payStatus === 'overdue' ? (fee.overdueDays || 12) : 0
    return {
      ...fee,
      ...student,
      payStatus,
      studentNo: fee.sid,
      expectedAmount,
      paidAmount,
      dueAmount,
      overdueDays,
      statusLabel: meta.label,
      statusColor: meta.color,
      daysLabel: meta.days,
      avatarBg: `var(--${meta.color}-bg)`
    }
  })
}

export function getPaymentSummary(list = getFeeList()) {
  const tabs = buildPaymentTabs(list)
  const paid = tabs[2]?.count || 0
  const total = list.length
  return {
    tabs,
    total,
    paid,
    unpaid: tabs[0]?.count || 0,
    partial: tabs[1]?.count || 0,
    channel: tabs[3]?.count || 0,
    payRate: total ? Math.round((paid / total) * 1000) / 10 : 0,
    outstandingAmount: list.reduce((sum, item) => sum + Number(item.dueAmount || 0), 0)
  }
}

export function urgeStudents(sids) {
  const list = loadState('fees')
  const time = nowText()
  let changedItem = null
  list.forEach(item => {
    if (sids.includes(item.sid) && ['unpaid', 'overdue', 'partial'].includes(item.payStatus)) {
      item.urgeCount = (item.urgeCount || 0) + 1
      item.urgeTimes = item.urgeTimes || []
      item.urgeTimes.unshift(time)
      changedItem = changedItem || item
    }
  })
  saveState('fees', list)
  if (changedItem) notifyBusinessStateChange('fees', changedItem)
  return time
}

export function updateReview(collection, uid, status, log) {
  const list = loadState(collection)
  const item = list.find(i => i.uid === uid)
  if (item) {
    item.status = status
    item.logs = item.logs || []
    item.logs.unshift({ time: nowText(), ...log })
    if (log?.remark) item.reason = log.remark
  }
  saveState(collection, list)
  notifyBusinessStateChange(collection, item)
  return item
}

export function markPayment(collection, uid, log = {}) {
  const item = updateReview(collection, uid, collection === 'loans' ? REVIEW_STATUS.PAID : REVIEW_STATUS.COMPLETED, {
    node: '财务确认打款',
    result: collection === 'loans' ? '已打款' : '已完成',
    ...log
  })
  return item
}

function ensureReviewDemoCoverage(collection, list) {
  if (!['aids', 'loans'].includes(collection)) return list
  const required = collection === 'aids'
    ? [
        { uid: 'aid-demo-pending', sid: '2026010039', amount: '4,000', type: '特殊困难助学金', status: REVIEW_STATUS.PENDING, date: '05-14', logs: [{ node: '学生申请', time: '2026-05-14 16:22', result: '已提交' }] },
        { uid: 'aid-demo-first-pass', sid: '2026010015', amount: '3,000', type: '普通困难助学金', status: REVIEW_STATUS.FIRST_PASS, date: '05-15', logs: [{ node: '教师初审', time: '2026-05-15 10:20', result: '初审通过' }] },
        { uid: 'aid-demo-review-pass', sid: '2026010033', amount: '3,500', type: '国家助学金', status: REVIEW_STATUS.REVIEW_PASS, date: '05-13', logs: [{ node: '政务复审', time: '2026-05-13 11:20', result: '复审通过' }] },
        { uid: 'aid-demo-final-pass', sid: '2026010027', amount: '2,000', type: '普通困难助学金', status: REVIEW_STATUS.FINAL_PASS, date: '05-16', logs: [{ node: '教师终审', time: '2026-05-16 09:18', result: '终审通过' }] },
        { uid: 'aid-demo-payment-pending', sid: '2026010002', amount: '3,000', type: '国家助学金', status: REVIEW_STATUS.PAYMENT_PENDING, date: '05-12', logs: [{ node: '教师终审', time: '2026-05-12 14:10', result: '终审通过，待财务打款' }] },
        { uid: 'aid-demo-completed', sid: '2026010008', amount: '2,500', type: '普通困难助学金', status: REVIEW_STATUS.COMPLETED, date: '05-10', logs: [{ node: '财务打款', time: '2026-05-10 16:30', result: '已完成' }] },
        { uid: 'aid-demo-rejected', sid: '2026010035', amount: '2,000', type: '普通困难助学金', status: REVIEW_STATUS.REJECTED, date: '05-11', logs: [{ node: '教师初审', time: '2026-05-11 12:30', result: '已驳回', remark: '家庭经济情况说明不完整' }] }
      ]
    : [
        { uid: 'loan-demo-pending', sid: '2026010015', amount: '8,000', status: REVIEW_STATUS.PENDING, type: '生源地助学贷款', logs: [{ node: '学生提交', time: '2026-05-20 09:15', result: '已提交' }] },
        { uid: 'loan-demo-first-pass', sid: '2026010030', amount: '10,000', status: REVIEW_STATUS.FIRST_PASS, type: '校园地助学贷款', logs: [{ node: '班主任初审', time: '2026-05-19 16:20', result: '初审通过' }] },
        { uid: 'loan-demo-review-pass', sid: '2026010027', amount: '9,000', status: REVIEW_STATUS.REVIEW_PASS, type: '校园地助学贷款', logs: [{ node: '政务复审', time: '2026-05-17 14:30', result: '复审通过' }] },
        { uid: 'loan-demo-final-pass', sid: '2026010008', amount: '8,000', status: REVIEW_STATUS.FINAL_PASS, type: '生源地助学贷款', logs: [{ node: '教师终审', time: '2026-05-18 15:40', result: '终审通过' }] },
        { uid: 'loan-demo-payment-pending', sid: '2026010039', amount: '7,000', status: REVIEW_STATUS.PAYMENT_PENDING, type: '生源地助学贷款', logs: [{ node: '教师终审', time: '2026-05-21 13:00', result: '终审通过，待打款' }] },
        { uid: 'loan-demo-paid', sid: '2026010042', amount: '8,000', status: REVIEW_STATUS.PAID, type: '生源地助学贷款', logs: [{ node: '财务打款', time: '2026-05-17 14:10', result: '已打款' }] },
        { uid: 'loan-demo-rejected', sid: '2026010035', amount: '6,000', status: REVIEW_STATUS.REJECTED, type: '生源地助学贷款', logs: [{ node: '院系审核', time: '2026-05-18 09:30', result: '已驳回', remark: '材料缺失' }] }
      ]

  const next = [...list]
  let changed = false
  required.forEach(record => {
    const hasStatus = next.some(item => item.status === record.status)
    const hasUid = next.some(item => item.uid === record.uid)
    if (!hasStatus && !hasUid) {
      next.push(clone(record))
      changed = true
    }
  })
  if (changed) saveState(collection, next)
  return next
}

export function getReviewList(collection) {
  let list = loadState(collection)
  if (collection === 'documents') {
    list = ensureClassCoverage('documents', list, student => ({
      uid: `doc-auto-${student.sid}`,
      sid: student.sid,
      status: MATERIAL_STATUS.PENDING,
      submittedAt: '',
      tags: ['身份证', '录取通知书', '户口本', '证件照'],
      logs: []
    }))
  } else {
    list = ensureReviewDemoCoverage(collection, list)
  }
  const metaMap = collection === 'documents' ? materialStatusMeta : statusMeta
  return list.map(item => {
    const record = collection === 'documents'
      ? { ...item, status: MATERIAL_STATUS_MAP[item.status || item.filterKey || item.statusLabel] || MATERIAL_STATUS.PENDING }
      : adaptReviewStatus(item)
    return withStudent(record, metaMap)
  })
}

export function getDormReviewList(collection) {
  const demos = {
    roomChanges: {
      approved: { uid: 'rc-demo-approved', sid: '2026010030', oldDorm: '3号楼 312室 5床', targetDorm: '3号楼 310室 2床', reason: '学院统一调整', applyTime: '2026-05-18 14:10', status: DORM_REVIEW_STATUS.APPROVED, logs: [{ node: '班主任审核', time: '2026-05-18 16:00', result: '已通过' }] },
      rejected: { uid: 'rc-demo-rejected', sid: '2026010035', oldDorm: '6号楼 222室 4床', targetDorm: '6号楼 226室 2床', reason: '床位资源不足', applyTime: '2026-05-17 09:10', status: DORM_REVIEW_STATUS.REJECTED, logs: [{ node: '班主任审核', time: '2026-05-17 13:30', result: '已驳回' }] }
    },
    dormWithdraws: {
      approved: { uid: 'dw-demo-approved', sid: '2026010022', currentDorm: '6号楼 220室 2床', reason: '家庭原因申请退宿', applyTime: '2026-05-18 10:12', status: DORM_REVIEW_STATUS.APPROVED, logs: [{ node: '班主任审核', time: '2026-05-18 15:20', result: '已通过' }] },
      rejected: { uid: 'dw-demo-rejected', sid: '2026010035', currentDorm: '6号楼 222室 4床', reason: '身体原因需家长照顾，申请退宿', applyTime: '2026-05-19 09:20', status: DORM_REVIEW_STATUS.REJECTED, logs: [{ node: '班主任审核', time: '2026-05-19 15:20', result: '已驳回' }] }
    },
    nonDorm: {
      approved: { uid: 'gnd-demo-approved', sid: '2026010030', address: '麓山南路188号', reason: '校外住宿申请', applyTime: '2026-05-11 09:00', status: DORM_REVIEW_STATUS.APPROVED, logs: [{ node: '政务处审批', time: '2026-05-14 10:30', result: '审批通过' }] },
      rejected: { uid: 'gnd-demo-rejected', sid: '2026010022', address: '岳麓区枫林三路99号', reason: '校外住宿申请', applyTime: '2026-05-09 15:20', status: DORM_REVIEW_STATUS.REJECTED, logs: [{ node: '政务处审批', time: '2026-05-13 14:00', result: '已驳回', remark: '居住证明不完整' }] }
    }
  }
  const list = loadState(collection)
  const coverage = demos[collection]
  if (coverage) {
    Object.values(coverage).forEach(record => {
      if (!list.some(item => item.status === record.status)) list.push(clone(record))
    })
    saveState(collection, list)
  }
  return list.map(item => {
    const student = getStudent(item.sid) || {}
    const status = DORM_REVIEW_STATUS_MAP[item.status || item.filterKey || item.statusLabel] || DORM_REVIEW_STATUS.PENDING
    const meta = dormReviewStatusMeta[status] || dormReviewStatusMeta.pending
    return {
      ...item,
      ...student,
      status,
      uid: item.uid,
      id: item.sid,
      avatar: (student.name || '?').charAt(0),
      statusLabel: meta.label,
      badgeColor: meta.color,
      filterKey: meta.filterKey
    }
  })
}

export function getDormReviewItem(collection, uid) {
  return getDormReviewList(collection).find(i => i.uid === uid) || null
}

export function getReviewItem(collection, uid) {
  const list = getReviewList(collection)
  return list.find(i => i.uid === uid) || null
}

export function getRefundList() {
  return loadState('refunds').map(item => {
    const student = getStudent(item.sid) || {}
    const status = REFUND_STATUS_MAP[item.status || item.filterKey || item.statusLabel] || item.status
    const meta = refundStatusMeta[status] || refundStatusMeta.pending
    return {
      ...item,
      ...student,
      status,
      id: item.sid,
      studentNo: item.sid,
      studentName: student.name || '未知学生',
      type: item.feeType,
      avatar: (student.name || '?').charAt(0),
      statusLabel: meta.label,
      badgeColor: meta.color,
      filterKey: meta.filterKey
    }
  })
}

export function getRefundItem(uid) {
  return getRefundList().find(item => item.uid === uid) || null
}

export function updateRefund(uid, status, log) {
  const list = loadState('refunds')
  const item = list.find(i => i.uid === uid)
  if (item) {
    item.status = status
    item.logs = item.logs || []
    item.logs.unshift({ time: nowText(), ...log })
    if (log?.remark) item.reasonNote = log.remark
  }
  saveState('refunds', list)
  notifyBusinessStateChange('refunds', item)
  return item
}

export function getOfflineCollectionList() {
  return loadState('offlineCollections').map(item => {
    const student = getStudent(item.sid) || {}
    const status = OFFLINE_COLLECTION_STATUS_MAP[item.status || item.statusLabel] || item.status
    return {
      ...item,
      status,
      name: student.name || '未知学生',
      studentNo: item.sid,
      college: student.college || '计算机学院',
      className: student.className || '2026级1班',
      statusLabel: status === 'confirmed' ? '已确认' : status === 'voided' ? '已作废' : '待确认',
      badgeColor: status === 'confirmed' ? 'ok' : status === 'voided' ? 'er' : 'wa',
      collectionType: item.collectionType || item.method || '',
      avatar: (student.name || '?').charAt(0)
    }
  })
}

export function getDifferenceRefundList() {
  return loadState('differenceRefunds').map(item => {
    const student = getStudent(item.sid) || {}
    return {
      ...item,
      studentName: student.name || '未知学生',
      studentNo: item.sid,
      statusLabel: item.status === 'refunded' ? '已退款' : '待处理',
      badgeColor: item.status === 'refunded' ? 'ok' : 'wa'
    }
  })
}

export function confirmDifferenceRefund(id) {
  const list = loadState('differenceRefunds')
  const item = list.find(record => record.id === id)
  if (item && item.status === 'pending') {
    item.status = 'refunded'
    item.confirmedAt = nowText()
    saveState('differenceRefunds', list)
    notifyBusinessStateChange('differenceRefunds', item)
  }
  return item
}

export function getReceiptList() {
  return loadState('receipts').map(item => {
    const student = getStudent(item.sid) || {}
    return {
      ...item,
      name: student.name || '未知学生',
      studentNo: item.sid,
      badgeColor: item.status === 'pending' ? 'wa' : item.status === 'voided' ? 'er' : 'ok',
      statusLabel: item.status === 'pending' ? '待处理' : item.status === 'voided' ? '已作废' : '已补打'
    }
  })
}

export function updateReceipt(id, action) {
  const list = loadState('receipts')
  const item = list.find(record => record.id === id)
  if (!item || item.status === 'voided') return item
  if (action === 'reprint' && item.status === 'pending') {
    item.status = 'reprinted'
    item.reprintTime = nowText()
  } else if (action === 'void' && item.status !== 'pending') {
    item.status = 'voided'
    item.voidTime = nowText()
  } else {
    return item
  }
  saveState('receipts', list)
  notifyBusinessStateChange('receipts', item)
  return item
}

export function getUrgeTasks() {
  return loadState('urgeTasks')
}

export function createUrgeTask(data = {}) {
  const list = loadState('urgeTasks')
  const targetCount = getFeeList().filter(item => ['unpaid', 'overdue'].includes(item.payStatus)).length
  const item = {
    id: `ut-${Date.now()}`,
    name: data.name || '学费逾期催缴任务',
    scope: data.scope || '全校未缴及逾期学生',
    targetCount,
    sentCount: targetCount,
    paidCount: 0,
    createdAt: nowText(),
    status: 'running'
  }
  list.unshift(item)
  saveState('urgeTasks', list)
  notifyBusinessStateChange('urgeTasks', item)
  return item
}

export function confirmOfflineCollection(id, details = {}) {
  const list = loadState('offlineCollections')
  const item = list.find(i => i.id === id)
  if (item && item.status !== 'confirmed' && item.status !== 'voided') {
    item.status = 'confirmed'
    item.statusText = '已确认'
    item.confirmTime = nowText()
    item.confirmPayMethod = details.collectionType || item.collectionType || item.method || ''
    item.collectionType = item.confirmPayMethod
    item.collectionRemark = details.remark || ''
    item.confirmOperator = details.confirmedBy || '陈美玲'
    item.confirmedBy = item.confirmOperator
    item.method = item.collectionType
    item.receiptNo = details.receiptNo || generateReceiptNumber()
    item.logs = item.logs || []
    item.logs.unshift({ node: '线下收款确认', time: item.confirmTime, result: '已确认', remark: item.collectionRemark, receiptNo: item.receiptNo })

    const fees = loadState('fees')
    const fee = fees.find(record => record.sid === item.sid)
    if (fee) {
      const oldPaid = fee.paidAmount || 0
      fee.paidAmount = (fee.paidAmount || 0) + (item.amount || 0)
      fee.dueAmount = Math.max((fee.expectedAmount || Number(String(fee.amount || '0').replace(/,/g, '')) || 0) - fee.paidAmount, 0)
      if (fee.dueAmount <= 0) {
        fee.payStatus = 'paid'
        fee.statusLabel = '已缴'
        fee.statusColor = 'ok'
      } else if (fee.paidAmount > 0) {
        fee.payStatus = 'partial'
        fee.statusLabel = '部分未缴'
        fee.statusColor = 'wa'
      }
      fee.paidAt = item.confirmTime
      fee.lastPaymentTime = item.confirmTime
      fee.paymentMethod = item.collectionType
      fee.collectionRemark = item.collectionRemark
      saveState('fees', fees)
      notifyBusinessStateChange('fees', fee)
    }
  }
  saveState('offlineCollections', list)
  notifyBusinessStateChange('offlineCollections', item)
  return item
}

// ============================================================
// 学生账单查询（用于现场收款）
// ============================================================

export function searchStudentBill(keyword) {
  if (!keyword) return []
  const kw = String(keyword).trim().toLowerCase()
  const fees = getFeeList()
  const matched = fees.filter(f => {
    const sid = String(f.sid || '').toLowerCase()
    const name = String(f.name || '').toLowerCase()
    const studentNo = String(f.studentNo || '').toLowerCase()
    return sid.includes(kw) || studentNo.includes(kw) || name.includes(kw)
  })
  return matched.map(fee => ({
    billId: fee.billId || `BILL${fee.sid}`,
    studentId: fee.sid,
    studentNo: fee.sid || fee.studentNo,
    studentName: fee.name || '',
    college: fee.college || '',
    major: fee.major || '',
    className: fee.className || '',
    schoolYear: fee.schoolYear || '2026-2027',
    chargeItem: fee.chargeItem || '学费',
    totalAmount: fee.expectedAmount || 0,
    paidAmount: fee.paidAmount || 0,
    unpaidAmount: fee.dueAmount || 0,
    paymentStatus: fee.payStatus || 'unpaid',
    paymentStatusLabel: fee.statusLabel || '未缴',
    paymentStatusColor: fee.statusColor || 'wa',
    lastPayTime: fee.lastPaymentTime || '',
    isGreenChannel: fee.payStatus === 'channel'
  }))
}

export function getStudentBill(studentNo) {
  if (!studentNo) return null
  const fees = getFeeList()
  const fee = fees.find(f => f.sid === studentNo || f.studentNo === studentNo)
  if (!fee) return null
  const student = getStudent(studentNo) || {}
  return {
    billId: fee.billId || `BILL${studentNo}`,
    studentId: student.sid || fee.sid,
    studentNo: student.sid || fee.studentNo || studentNo,
    studentName: fee.name || student.name || '',
    college: fee.college || student.college || '',
    major: fee.major || student.major || '',
    className: fee.className || student.className || '',
    schoolYear: fee.schoolYear || '2026-2027',
    chargeItem: fee.chargeItem || '学费',
    totalAmount: fee.expectedAmount || 0,
    paidAmount: fee.paidAmount || 0,
    unpaidAmount: fee.dueAmount || 0,
    paymentStatus: fee.payStatus || 'unpaid',
    paymentStatusLabel: fee.statusLabel || '未缴',
    paymentStatusColor: fee.statusColor || 'wa',
    lastPayTime: fee.lastPaymentTime || '',
    isGreenChannel: fee.payStatus === 'channel'
  }
}

// ============================================================
// 收据编号生成
// ============================================================

const RECEIPT_COUNTER_KEY = 'enroll_receipt_counter'

export function generateReceiptNumber() {
  const d = new Date()
  const pad = n => String(n).padStart(2, '0')
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  let counter = 1
  try {
    const raw = uni.getStorageSync(RECEIPT_COUNTER_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.date === dateStr) {
        counter = (parsed.counter || 0) + 1
      }
    }
  } catch (e) { /* ignore */ }
  uni.setStorageSync(RECEIPT_COUNTER_KEY, JSON.stringify({ date: dateStr, counter }))
  const serial = String(counter).padStart(6, '0')
  return `RCPT${dateStr}${serial}`
}

// ============================================================
// 作废线下收款单据
// ============================================================

export function voidOfflineCollection(id) {
  const list = loadState('offlineCollections')
  const item = list.find(i => i.id === id)
  if (!item) return { success: false, message: '记录不存在' }
  if (item.status === 'voided') return { success: false, message: '该单据已作废，不可重复操作' }
  if (item.status !== 'confirmed') return { success: false, message: '仅已确认单据可作废' }

  const oldStatus = item.status
  item.status = 'voided'
  item.voidTime = nowText()
  item.logs = item.logs || []
  item.logs.unshift({ node: '单据作废', time: item.voidTime, result: '已作废', remark: '管理员作废，回退账单金额' })

  // 回退账单金额
  const fees = loadState('fees')
  const fee = fees.find(record => record.sid === item.sid)
  if (fee) {
    const refundAmount = item.amount || 0
    fee.paidAmount = Math.max((fee.paidAmount || 0) - refundAmount, 0)
    const expectedAmount = fee.expectedAmount || Number(String(fee.amount || '0').replace(/,/g, '')) || 0
    fee.dueAmount = Math.max(expectedAmount - fee.paidAmount, 0)
    if (fee.paidAmount <= 0) {
      fee.payStatus = fee.payStatus === 'channel' ? 'channel' : 'unpaid'
      fee.statusLabel = fee.payStatus === 'channel' ? '绿通' : '未缴'
      fee.statusColor = fee.payStatus === 'channel' ? 'pu' : 'wa'
    } else if (fee.dueAmount > 0) {
      fee.payStatus = 'partial'
      fee.statusLabel = '部分未缴'
      fee.statusColor = 'wa'
    }
    saveState('fees', fees)
    notifyBusinessStateChange('fees', fee)
  }

  saveState('offlineCollections', list)
  notifyBusinessStateChange('offlineCollections', item)
  return { success: true, message: '单据已作废，账单金额已回退', item }
}

export function getOfflineCollectionById(id) {
  const list = getOfflineCollectionList()
  return list.find(i => i.id === id) || null
}

export function getSizeList() {
  const records = ensureClassCoverage('sizes', loadState('sizes'), student => ({
    sid: student.sid,
    clothing: '',
    shoe: '',
    height: '',
    weight: '',
    remark: '',
    status: SIZE_STATUS.EMPTY
  }))
  return records.map(item => {
    const student = getStudent(item.sid) || {}
    return {
      sid: item.sid,
      clothing: item.clothing || '',
      shoe: item.shoe || '',
      status: item.status,
      name: student.name || '未知学生',
      gender: student.gender || '',
      className: student.className || '',
      college: student.college || '',
      phone: student.phone || '',
      id: item.sid,
      statusLabel: sizeStatusMeta[item.status]?.label || '未填写',
      badgeColor: sizeStatusMeta[item.status]?.color || 'wa'
    }
  })
}

export function getClassSummary() {
  const students = getStudents()
  const fees = getFeeList()
  const documents = getReviewList('documents')
  const aids = getReviewList('aids')
  const loans = getReviewList('loans')
  const refunds = getRefundList()
  const roomChanges = getDormReviewList('roomChanges')
  const dormWithdraws = getDormReviewList('dormWithdraws')
  const sizes = getSizeList()
  const total = students.length
  const checkedIn = students.filter(item => item.checkedIn).length
  const countTabs = tabs => tabs.reduce((sum, tab) => sum + tab.count, 0)
  return {
    totalStudents: total,
    checkin: {
      checkedIn,
      unchecked: total - checkedIn,
      total,
      rate: total ? Math.round((checkedIn / total) * 1000) / 10 : 0
    },
    fees: {
      ...getPaymentSummary(fees),
      overdue: fees.filter(item => item.payStatus === 'overdue').length
    },
    documents: { tabs: buildMaterialTabs(documents), total: documents.length },
    aids: { tabs: buildReviewTabs(aids), total: aids.length },
    loans: { tabs: buildReviewTabs(loans), total: loans.length },
    refunds: { tabs: buildRefundTabs(refunds), total: refunds.length },
    roomChanges: { tabs: buildDormReviewTabs(roomChanges), total: roomChanges.length },
    dormWithdraws: { tabs: buildDormReviewTabs(dormWithdraws), total: dormWithdraws.length },
    sizes: { total: sizes.length, filled: sizes.filter(i => i.status === SIZE_STATUS.FILLED).length, empty: sizes.filter(i => i.status === SIZE_STATUS.EMPTY).length, abnormal: sizes.filter(i => i.status === SIZE_STATUS.ABNORMAL).length },
    valid: {
      fees: countTabs(buildPaymentTabs(fees)) === fees.length && fees.length === total,
      documents: countTabs(buildMaterialTabs(documents)) === documents.length && documents.length === total,
      aids: countTabs(buildReviewTabs(aids)) === aids.length,
      loans: countTabs(buildReviewTabs(loans)) === loans.length,
      refunds: countTabs(buildRefundTabs(refunds)) === refunds.length,
      roomChanges: countTabs(buildDormReviewTabs(roomChanges)) === roomChanges.length,
      dormWithdraws: countTabs(buildDormReviewTabs(dormWithdraws)) === dormWithdraws.length,
      sizes: sizes.length === total
    }
  }
}

export function getMessages(role) {
  const all = loadState('messages')
  const raw = all[role] || []
  return raw.map(msg => ({
    id: msg.id || '',
    type: msg.type || '系统通知',
    icon: msg.icon || '🔔',
    color: msg.color || 'var(--N500)',
    time: msg.time || '',
    content: msg.content || '',
    read: msg.read !== undefined ? msg.read : false
  }))
}

export function saveMessages(role, list) {
  const all = loadState('messages')
  all[role] = list
  saveState('messages', all)
}

export function getUnreadCount(role) {
  return getMessages(role).filter(m => !m.read).length
}

export function markMessageRead(role, id) {
  const list = getMessages(role)
  const updated = list.map(m => m.id === id ? { ...m, read: true } : m)
  saveMessages(role, updated)
  return updated
}

export function markAllMessagesRead(role) {
  const list = getMessages(role).map(m => ({ ...m, read: true }))
  saveMessages(role, list)
  return list
}

export function deleteMessage(role, id) {
  const list = getMessages(role).filter(m => m.id !== id)
  saveMessages(role, list)
  return list
}

export function clearAllMessages(role) {
  saveMessages(role, [])
  return []
}

export function clearBusinessState() {
  Object.keys(seed).forEach(name => saveState(name, clone(seed[name])))
}
