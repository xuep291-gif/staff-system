import _ from 'lodash'
import { globalConfig } from '@/config.js'

// ============================================================
// 角色常量定义
// ============================================================

export const ROLES = {
  TEACHER: 'teacher',
  FINANCE: 'finance',
  GOVERNMENT: 'government',
  ADMIN: 'admin',
  STUDENT: 'student'
}

// 角色显示名称
export const ROLE_LABELS = {
  [ROLES.TEACHER]: '班主任',
  [ROLES.FINANCE]: '财务职工',
  [ROLES.GOVERNMENT]: '政务职工',
  [ROLES.ADMIN]: '管理员',
  [ROLES.STUDENT]: '学生'
}

// 角色对应的 type 值（后端 JWT claim 中 type / typeList）
export const ROLE_TYPE_MAP = {
  1: ROLES.STUDENT,
  2: ROLES.TEACHER,
  3: ROLES.FINANCE,
  4: ROLES.ADMIN,
  5: ROLES.GOVERNMENT
}

// ============================================================
// 门户配置：每个角色对应的首页路由、主题、导航模式
// ============================================================

export const PORTAL_CONFIG = {
  [ROLES.TEACHER]: {
    homePage: '/pages/teacher/home/index',
    theme: '',           // 默认蓝色
    themeClass: '',      // 不添加 body class
    navMode: 'tabbar',   // 移动端 TabBar
    label: '教师端'
  },
  [ROLES.FINANCE]: {
    homePage: '/pages/finance/home/index',
    theme: 'green',
    themeClass: 'rf',
    navMode: 'tabbar',
    label: '财务职工端'
  },
  [ROLES.GOVERNMENT]: {
    homePage: '/pages/government/home/index',
    theme: 'purple',
    themeClass: 'ra',
    navMode: 'tabbar',
    label: '政务职工端'
  },
  [ROLES.ADMIN]: {
    homePage: '/pages/finance/home/index',  // 管理后台已移除，重定向到财务端
    theme: 'blue',
    themeClass: '',
    navMode: 'tabbar',
    label: '后台管理端'
  },
  [ROLES.STUDENT]: {
    homePage: '/pages/home/index',
    theme: '',
    themeClass: '',
    navMode: 'tabbar',
    label: '学生端'
  }
}

// ============================================================
// JWT 解码（前端解析，不验证签名）
// ============================================================

export function decodeJWT(token) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch (e) {
    console.warn('[role] JWT decode failed:', e.message)
    return null
  }
}

function readCachedUserInfo() {
  try {
    const raw = uni.getStorageSync('userInfo')
    if (raw && typeof raw === 'object') return raw
    if (raw && typeof raw === 'string') {
      if (raw.includes('_|_')) {
        const [payload, expire] = raw.split('_|_')
        const expireTime = Number(expire)
        const nowTime = Date.parse(new Date()) / 1000
        if (!expireTime || expireTime > nowTime) return JSON.parse(payload)
        return null
      }
      return JSON.parse(raw)
    }
  } catch (e) {
    return null
  }
  return null
}

// ============================================================
// 从用户信息中解析角色
// 优先级：typeList（多角色数组）> type（单值）> 默认 student
// ============================================================

export function resolveRole(userInfo) {
  if (!userInfo) return ROLES.STUDENT

  // 多角色支持：typeList 是后端返回的角色数组
  const typeList = userInfo.typeList || userInfo.userTypeList || []
  if (typeList.length > 0) {
    // 优先级：admin > finance > teacher > student
    if (typeList.includes(5) || typeList.includes('5')) return ROLES.GOVERNMENT
    if (typeList.includes(4) || typeList.includes('4')) return ROLES.ADMIN
    if (typeList.includes(3) || typeList.includes('3')) return ROLES.FINANCE
    if (typeList.includes(2) || typeList.includes('2')) return ROLES.TEACHER
    return ROLES.STUDENT
  }

  // 单角色：type 字段
  const type = userInfo.type
  if (type !== undefined && type !== null) {
    return ROLE_TYPE_MAP[type] || ROLES.STUDENT
  }

  return ROLES.STUDENT
}

// 获取用户所有角色（用于角色切换）
export function resolveAllRoles(userInfo) {
  if (!userInfo) return [ROLES.STUDENT]

  const typeList = userInfo.typeList || userInfo.userTypeList || []
  if (typeList.length > 0) {
    return typeList.map(t => ROLE_TYPE_MAP[t] || ROLES.STUDENT).filter(Boolean)
  }

  const type = userInfo.type
  const role = ROLE_TYPE_MAP[type] || ROLES.STUDENT
  return [role]
}

// ============================================================
// 从 Storage 读取 token 并解析角色
// ============================================================

export function getRoleFromStorage() {
  try {
    const token = uni.getStorageSync(globalConfig.tokenStorageKey)
    const cachedUser = readCachedUserInfo()
    if (!token) return cachedUser ? resolveRole(cachedUser) : null

    const claims = decodeJWT(token)
    if (!claims) return cachedUser ? resolveRole(cachedUser) : null

    return resolveRole({
      type: claims.type,
      typeList: claims.typeList || claims.userTypeList
    })
  } catch (e) {
    console.warn('[role] getRoleFromStorage failed:', e)
    return null
  }
}

// 获取用户所有角色
export function getAllRolesFromStorage() {
  try {
    const token = uni.getStorageSync(globalConfig.tokenStorageKey)
    const cachedUser = readCachedUserInfo()
    if (!token) return cachedUser ? resolveAllRoles(cachedUser) : [ROLES.STUDENT]

    const claims = decodeJWT(token)
    if (!claims) return cachedUser ? resolveAllRoles(cachedUser) : [ROLES.STUDENT]

    return resolveAllRoles({
      type: claims.type,
      typeList: claims.typeList || claims.userTypeList
    })
  } catch (e) {
    return [ROLES.STUDENT]
  }
}

// ============================================================
// 权限校验
// ============================================================

export function hasRole(userInfo, role) {
  const roles = resolveAllRoles(userInfo)
  return roles.includes(role)
}

export function isTeacher(userInfo) {
  return hasRole(userInfo, ROLES.TEACHER)
}

export function isFinance(userInfo) {
  return hasRole(userInfo, ROLES.FINANCE)
}

export function isGovernment(userInfo) {
  return hasRole(userInfo, ROLES.GOVERNMENT)
}

export function isAdmin(userInfo) {
  return hasRole(userInfo, ROLES.ADMIN)
}

// ============================================================
// 获取角色门户首页路由
// ============================================================

export function getRoleHomePage(role) {
  const config = PORTAL_CONFIG[role]
  return config ? config.homePage : '/pages/home/index'
}

// 应用角色主题（直接设置 CSS 变量 + body class）
export function applyTheme(role) {
  const config = PORTAL_CONFIG[role]
  if (!config) return

  // 设置 body class（兼容旧逻辑）
  if (typeof document !== 'undefined' && document.body) {
    document.body.classList.remove('rf', 'ra')
    if (config.themeClass) document.body.classList.add(config.themeClass)
  }

  // 直接在 :root 上设置 CSS 变量，确保生效
  if (typeof document !== 'undefined' && document.documentElement) {
    const root = document.documentElement
    const themeColors = {
      teacher:  { brand: '#2B6CB0', brandT: '#DBEAFE' },
      finance:  { brand: '#16A34A', brandT: '#DCFCE7' },
      government: { brand: '#7C3AED', brandT: '#EDE9FE' }
    }
    const colors = themeColors[role] || themeColors.teacher
    root.style.setProperty('--brand', colors.brand)
    root.style.setProperty('--banner-bg', colors.brand)
    root.style.setProperty('--navbar-bg', colors.brand)
  }
}

// ============================================================
// 角色切换
// ============================================================

export function switchToRole(role, userInfo) {
  const roles = resolveAllRoles(userInfo)
  if (!roles.includes(role)) {
    uni.showToast({ title: '无此角色权限', icon: 'none' })
    return
  }
  applyTheme(role)
  const homePage = getRoleHomePage(role)
  uni.reLaunch({ url: homePage })
}

export default {
  ROLES,
  ROLE_LABELS,
  ROLE_TYPE_MAP,
  PORTAL_CONFIG,
  decodeJWT,
  resolveRole,
  resolveAllRoles,
  getRoleFromStorage,
  getAllRolesFromStorage,
  hasRole,
  isTeacher,
  isFinance,
  isGovernment,
  isAdmin,
  getRoleHomePage,
  applyTheme,
  switchToRole
}
