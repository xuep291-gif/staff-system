// ============================================================
// 迎新收费系统 — 状态枚举常量
// 基于 高校收费管理系统需求规格说明书_V3.0
// ============================================================

// ---------- 支付状态 ----------
export const PAY_STATUS = {
  PAID: 'paid',         // 已缴清
  PARTIAL: 'partial',   // 部分缴
  UNPAID: 'unpaid',     // 未缴
  OVERDUE: 'overdue'    // 逾期
}

export const PAY_STATUS_LABELS = {
  paid: '已缴清',
  partial: '部分缴',
  unpaid: '未缴',
  overdue: '逾期'
}

export const PAY_STATUS_COLORS = {
  paid: 'ok',
  partial: 'brand',
  unpaid: 'wa',
  overdue: 'er'
}

// ---------- 支付方式 ----------
export const PAY_METHOD = {
  ONLINE: 'online',       // 在线支付
  OFFLINE: 'offline',     // 线下收款
  DEDUCTION: 'deduction', // 批扣
  PREPAY: 'prepay',       // 预缴
  TRANSFER: 'transfer'    // 转账
}

export const PAY_METHOD_LABELS = {
  online: '在线支付',
  offline: '线下收款',
  deduction: '批扣',
  prepay: '预缴',
  transfer: '转账'
}

// ---------- 退费状态 ----------
export const REFUND_STATUS = {
  PENDING: 'pending',     // 待审核
  APPROVED: 'approved',   // 已通过
  PROCESSING: 'processing', // 处理中
  SUCCESS: 'success',     // 退费成功
  FAILED: 'failed',       // 退费失败
  REJECTED: 'rejected'    // 已拒绝
}

export const REFUND_STATUS_LABELS = {
  pending: '待审核',
  approved: '已通过',
  processing: '处理中',
  success: '退费成功',
  failed: '退费失败',
  rejected: '已拒绝'
}

// ---------- 退费类型 ----------
export const REFUND_TYPE = {
  FULL: 'full',           // 全额退费
  PARTIAL: 'partial',     // 部分退费
  DIFF: 'diff'            // 补差退款
}

export const REFUND_TYPE_LABELS = {
  full: '全额退费',
  partial: '部分退费',
  diff: '补差退款'
}

// ---------- 账单状态 ----------
export const BILL_STATUS = {
  UNPAID: 'unpaid',       // 未缴费
  PAID: 'paid',           // 已缴费
  PARTIAL: 'partial',     // 部分缴费
  OVERDUE: 'overdue',     // 已逾期
  EXEMPTED: 'exempted',   // 已减免
  CANCELLED: 'cancelled'  // 已作废
}

// ---------- 票据状态 ----------
export const INVOICE_STATUS = {
  ISSUED: 'issued',       // 已开具
  REPRINTED: 'reprinted', // 已补打
  VOIDED: 'voided',       // 已作废
  PENDING: 'pending'      // 待开具
}

export const INVOICE_STATUS_LABELS = {
  issued: '已开具',
  reprinted: '已补打',
  voided: '已作废',
  pending: '待开具'
}

// ---------- 催缴任务状态 ----------
export const URGE_STATUS = {
  PENDING: 'pending',     // 待执行
  RUNNING: 'running',     // 执行中
  COMPLETED: 'completed', // 已完成
  CANCELLED: 'cancelled'  // 已取消
}

// ---------- 通知渠道 ----------
export const URGE_CHANNEL = {
  SMS: 'sms',             // 短信
  APP: 'app',             // APP推送
  MINIAPP: 'miniapp',     // 小程序订阅消息
  PHONE: 'phone'          // 电话
}

// ---------- 助学金/贷款审批状态 ----------
export const AID_STATUS = {
  PENDING: 'pending',         // 待审核
  APPROVED: 'approved',       // 已通过
  REJECTED: 'rejected',       // 已拒绝
  DISBURSED: 'disbursed',     // 已发放
  REVOKED: 'revoked'          // 已撤销
}

export const AID_STATUS_LABELS = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已拒绝',
  disbursed: '已发放',
  revoked: '已撤销'
}

// ---------- 助学金/贷款类型 ----------
export const AID_TYPE = {
  SCHOLARSHIP: 'scholarship', // 助学金
  LOAN: 'loan'                // 助学贷款
}

// ---------- 收费项目类型 ----------
export const FEE_ITEM_TYPE = {
  TUITION: 'tuition',         // 学费
  DORMITORY: 'dormitory',     // 住宿费
  BOOKS: 'books',             // 教材费
  INSURANCE: 'insurance',     // 保险费
  REGISTRATION: 'registration', // 报名费
  OTHER: 'other'              // 其他
}

// ---------- 宿舍分配状态 ----------
export const DORM_STATUS = {
  UNASSIGNED: 'unassigned',   // 未分配
  ASSIGNED: 'assigned',       // 已分配
  CHECKED_IN: 'checked_in'    // 已入住
}

// ---------- 消息类型 ----------
export const MSG_TYPE = {
  PAYMENT: 'payment',         // 缴费提醒
  REFUND: 'refund',           // 退费通知
  URGE: 'urge',               // 催缴通知
  SYSTEM: 'system',           // 系统消息
  SCHOLARSHIP: 'scholarship', // 助学金通知
  DORMITORY: 'dormitory'      // 宿舍通知
}

export const MSG_TYPE_COLORS = {
  payment: 'brand',
  refund: 'ok',
  urge: 'er',
  system: 'in',
  scholarship: 'pu',
  dormitory: 'wa'
}

// ---------- 收费模式 ----------
export const FEE_MODE = {
  MAJOR: 'major',       // 按专业收费
  PERSONAL: 'personal'  // 按个人收费
}

// ---------- 财务报表类型 ----------
export const REPORT_TYPE = {
  PROGRESS: 'progress',     // 收费进度报表
  TRANSACTION: 'transaction', // 收费流水报表
  METHOD: 'method',         // 支付方式统计
  TREND: 'trend',           // 收费趋势分析
  ARREARS: 'arrears',       // 欠费统计
  REFUND: 'refund',         // 退费统计
  DIFF: 'diff',             // 补差退款统计
  DASHBOARD: 'dashboard'    // 迎新大数据大屏
}

// ---------- 分页默认值 ----------
export const PAGE_SIZE = 20
export const PAGE_SIZE_SMALL = 10

// ---------- 日期格式 ----------
export const DATE_FORMAT = 'YYYY-MM-DD'
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
