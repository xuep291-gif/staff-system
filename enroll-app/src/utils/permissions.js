import { ROLES } from '@/utils/role.js'

// ============================================================
// 子角色常量
// ============================================================

export const SUB_ROLES = {
  // 教师端
  HEAD_TEACHER: 'head_teacher',

  // 财务端
  FEE_COLLECTOR: 'fee_collector',
  FEE_APPROVER: 'fee_approver',
  CHECKIN_STAFF: 'checkin_staff',

  // 政务端
  STUDENT_AFFAIRS: 'student_affairs',
  COLLEGE_DEAN: 'college_dean'
}

// 子角色显示名称
export const SUB_ROLE_LABELS = {
  [SUB_ROLES.HEAD_TEACHER]: '班主任',
  [SUB_ROLES.FEE_COLLECTOR]: '收费专员',
  [SUB_ROLES.FEE_APPROVER]: '审批专员',
  [SUB_ROLES.CHECKIN_STAFF]: '迎新工作人员',
  [SUB_ROLES.STUDENT_AFFAIRS]: '学工处负责人',
  [SUB_ROLES.COLLEGE_DEAN]: '学院负责人'
}

// ============================================================
// 权限常量
// ============================================================

export const PERMISSIONS = {
  // 教师端
  'teacher:overview': '班级概览',
  'teacher:fee-list': '缴费列表',
  'teacher:student-detail': '学生详情',
  'teacher:urge': '催缴',
  'teacher:aid-list': '助学金列表',
  'teacher:loan-list': '贷款列表',
  'teacher:doc-review': '资料审核',
  'teacher:dorm-view': '宿舍查看',
  'teacher:checkin': '报到统计',

  // 财务端 - 收费专员
  'finance:overview': '财务概览',
  'finance:collect': '线下收款',
  'finance:refund': '退费处理',
  'finance:diff': '补差退款',
  'finance:receipt': '票据管理',
  'finance:urge': '催缴任务',
  'finance:payout': '打款',

  // 财务端 - 审批专员
  'finance:aid-review': '助学金审批',
  'finance:loan-review': '贷款审批',
  'finance:stats': '统计查看',

  // 财务端 - 迎新工作人员
  'finance:verify': '缴费核验',
  'finance:onsite': '现场收款',
  'finance:checkin-stats': '报到统计',

  // 政务端 - 学工处
  'gov:overview': '政务概览',
  'gov:aid-final': '助学金终审',
  'gov:loan-final': '贷款终审',
  'gov:dorm-review': '换房审批',
  'gov:checkin-stats': '报到统计',
  'gov:non-dorm': '校外住宿审核',
  'gov:stats-global': '全校统计',

  // 政务端 - 学院负责人
  'gov:aid-review': '助学金复审',
  'gov:loan-review': '贷款复审',
  'gov:dorm-view': '宿舍查看',
  'gov:stats-college': '本院统计'
}

// ============================================================
// 子角色对应的 Todo Key 配置（用于首页动态显示）
// ============================================================

export const SUB_ROLE_TODO_KEYS = {
  [SUB_ROLES.FEE_COLLECTOR]: ['collect', 'aid-payout', 'loan-payout', 'refund', 'diff', 'receipt', 'urge', 'processed'],
  [SUB_ROLES.FEE_APPROVER]: ['aid-review', 'loan-review', 'processed'],
  [SUB_ROLES.CHECKIN_STAFF]: ['verify', 'onsite', 'checkin-stats'],
  [SUB_ROLES.STUDENT_AFFAIRS]: ['room-change', 'aid-home', 'loan-home'],
  [SUB_ROLES.COLLEGE_DEAN]: ['room-change', 'aid-home', 'loan-home'],
  [SUB_ROLES.HEAD_TEACHER]: ['doc-home', 'aid-home', 'fee-home', 'loan-home', 'room-change']
}

// 子角色对应的快捷功能 Key 配置
export const SUB_ROLE_QUICK_KEYS = {
  [SUB_ROLES.FEE_COLLECTOR]: ['collect', 'refund', 'diff', 'receipt', 'urge', 'payout'],
  [SUB_ROLES.FEE_APPROVER]: ['aid-review', 'loan-review'],
  [SUB_ROLES.CHECKIN_STAFF]: ['verify', 'onsite', 'checkin-stats'],
  [SUB_ROLES.STUDENT_AFFAIRS]: ['room-change', 'aid-home', 'loan-home', 'checkin', 'messages'],
  [SUB_ROLES.COLLEGE_DEAN]: ['room-change', 'aid-home', 'loan-home', 'checkin', 'messages'],
  [SUB_ROLES.HEAD_TEACHER]: ['fee-home', 'doc-home', 'loan-home', 'dorm-home', 'room-change', 'dorm-withdraw', 'aid-home', 'uniform', 'uniform-stats', 'checkin', 'messages']
}

// ============================================================
// 工具函数
// ============================================================

function readUserInfo() {
  try {
    const raw = uni.getStorageSync('userInfo')
    if (!raw) return null
    if (typeof raw === 'object' && raw.userId) return raw
    if (typeof raw === 'string') {
      if (raw.includes('_|_')) {
        const [payload] = raw.split('_|_')
        return JSON.parse(payload)
      }
      return JSON.parse(raw)
    }
    return null
  } catch (e) {
    return null
  }
}

// ============================================================
// 权限检查
// ============================================================

export function hasPermission(permission) {
  const user = readUserInfo()
  if (!user) return false
  const perms = user.permissions || []
  return perms.includes(permission)
}

export function hasAnyPermission(permissions) {
  const user = readUserInfo()
  if (!user) return false
  const userPerms = user.permissions || []
  return permissions.some(p => userPerms.includes(p))
}

export function hasAllPermissions(permissions) {
  const user = readUserInfo()
  if (!user) return false
  const userPerms = user.permissions || []
  return permissions.every(p => userPerms.includes(p))
}

export function getUserPermissions() {
  const user = readUserInfo()
  if (!user) return []
  return user.permissions || []
}

export function getSubRole() {
  try {
    const direct = uni.getStorageSync('staff_sub_role')
    if (direct) return direct
  } catch (e) { /* ignore */ }
  const user = readUserInfo()
  if (user && user.subRole) return user.subRole
  // 硬编码兜底：按 userId 映射
  if (user) {
    if (user.userId === 'staff_gov_001') return SUB_ROLES.STUDENT_AFFAIRS
    if (user.userId === 'staff_gov_002') return SUB_ROLES.COLLEGE_DEAN
  }
  return ''
}

export function getDataScope() {
  try {
    const direct = uni.getStorageSync('staff_data_scope')
    if (direct) return JSON.parse(direct)
  } catch (e) { /* ignore */ }
  const user = readUserInfo()
  if (!user) return { type: 'all' }
  return user.dataScope || { type: 'all' }
}

// ============================================================
// 数据范围过滤
// ============================================================

export function filterByDataScope(items, fieldMap = {}) {
  const scope = getDataScope()
  if (scope.type === 'all') return items

  return items.filter(item => {
    if (scope.type === 'college' && scope.collegeId) {
      const collegeField = fieldMap.college || 'collegeId'
      return item[collegeField] === scope.collegeId
    }
    if (scope.type === 'class' && scope.classId) {
      const classField = fieldMap.class || 'classId'
      return item[classField] === scope.classId
    }
    return true
  })
}

// ============================================================
// 获取当前子角色允许的 Todo Key 列表
// ============================================================

export function getAllowedTodoKeys() {
  const subRole = getSubRole()
  return SUB_ROLE_TODO_KEYS[subRole] || []
}

export function getAllowedQuickKeys() {
  const subRole = getSubRole()
  return SUB_ROLE_QUICK_KEYS[subRole] || []
}

// ============================================================
// 角色判断快捷方法
// ============================================================

export function isFeeCollector() { return getSubRole() === SUB_ROLES.FEE_COLLECTOR }
export function isFeeApprover() { return getSubRole() === SUB_ROLES.FEE_APPROVER }
export function isCheckinStaff() { return getSubRole() === SUB_ROLES.CHECKIN_STAFF }
export function isStudentAffairs() { return getSubRole() === SUB_ROLES.STUDENT_AFFAIRS }
export function isCollegeDean() { return getSubRole() === SUB_ROLES.COLLEGE_DEAN }
export function isHeadTeacher() { return getSubRole() === SUB_ROLES.HEAD_TEACHER }

export default {
  SUB_ROLES,
  SUB_ROLE_LABELS,
  PERMISSIONS,
  SUB_ROLE_TODO_KEYS,
  SUB_ROLE_QUICK_KEYS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  getSubRole,
  getDataScope,
  filterByDataScope,
  getAllowedTodoKeys,
  getAllowedQuickKeys,
  isFeeCollector,
  isFeeApprover,
  isCheckinStaff,
  isStudentAffairs,
  isCollegeDean,
  isHeadTeacher
}
