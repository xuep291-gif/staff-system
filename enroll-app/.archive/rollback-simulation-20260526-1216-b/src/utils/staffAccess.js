export const STAFF_POSITIONS = {
  CASHIER: 'cashier',
  STUDENT_AFFAIRS: 'student_affairs',
  COLLEGE_LEADER: 'college_leader',
  ORIENTATION: 'orientation'
}

export const STAFF_POSITION_LABELS = {
  [STAFF_POSITIONS.CASHIER]: '财务处 · 收费专员',
  [STAFF_POSITIONS.STUDENT_AFFAIRS]: '学工处 · 审批负责人',
  [STAFF_POSITIONS.COLLEGE_LEADER]: '计算机学院 · 学院负责人',
  [STAFF_POSITIONS.ORIENTATION]: '迎新现场 · 工作人员'
}

const ACCESS = {
  [STAFF_POSITIONS.CASHIER]: ['collect', 'refund', 'diff', 'receipt', 'urge', 'payout', 'processed'],
  [STAFF_POSITIONS.STUDENT_AFFAIRS]: ['approval', 'stats'],
  [STAFF_POSITIONS.COLLEGE_LEADER]: ['approval', 'stats'],
  [STAFF_POSITIONS.ORIENTATION]: ['verify', 'onsite']
}

function readUserInfo() {
  try {
    const raw = uni.getStorageSync('userInfo')
    if (!raw) return {}
    if (typeof raw === 'object') return raw
    const payload = raw.includes('_|_') ? raw.split('_|_')[0] : raw
    return JSON.parse(payload)
  } catch (e) {
    return {}
  }
}

export function getStaffProfile() {
  const user = readUserInfo()
  const position = user.staffPosition || STAFF_POSITIONS.CASHIER
  return {
    name: user.nickName || user.name || '陈美玲',
    position,
    positionLabel: STAFF_POSITION_LABELS[position] || STAFF_POSITION_LABELS[STAFF_POSITIONS.CASHIER],
    college: user.college || '计算机学院'
  }
}

export function canAccessStaffFeature(feature) {
  const profile = getStaffProfile()
  return (ACCESS[profile.position] || []).includes(feature)
}

export function guardStaffFeature(feature) {
  if (canAccessStaffFeature(feature)) return true
  uni.showToast({ title: '当前岗位无此操作权限', icon: 'none' })
  setTimeout(() => uni.reLaunch({ url: '/pages/finance/home/index' }), 250)
  return false
}

