import { createStore } from 'vuex'
import _ from 'lodash'
import { ROLES, resolveRole, resolveAllRoles, applyTheme } from '@/utils/role.js'

const getCommunityData = () => {
  try {
    if (typeof uni !== 'undefined') {
      const data = uni.getStorageSync('communityData')
      return {
        orgId: _.get(data, 'orgId'),
        communityId: _.get(data, 'communityId')
      }
    }
  } catch (e) {
    console.warn('Failed to get community data:', e)
  }
  return {
    orgId: undefined,
    communityId: undefined
  }
}

const getUserInfoCache = () => {
  try {
    if (typeof uni !== 'undefined') {
      const raw = uni.getStorageSync('userInfo')
      if (raw && typeof raw === 'object') return raw
      if (raw && typeof raw === 'string') {
        if (raw.includes('_|_')) {
          const parts = raw.split('_|_')
          const expireTime = Number(parts[1])
          const nowTime = Date.parse(new Date()) / 1000
          if (expireTime > nowTime) {
            return JSON.parse(parts[0])
          }
        } else {
          return JSON.parse(raw)
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null
}

const commonStore = createStore({
  state: () => {
    const userInfo = getUserInfoCache()
    const role = userInfo ? resolveRole(userInfo) : ROLES.STUDENT
    const allRoles = userInfo ? resolveAllRoles(userInfo) : [ROLES.STUDENT]
    return {
      isShareIn: false,
      communityData: getCommunityData(),
      // 角色认证
      role,               // 当前角色
      allRoles,           // 用户所有角色列表
      userInfo: userInfo, // 缓存的用户信息
      isLoggedIn: !!userInfo
    }
  },
  getters: {
    currentRole: (state) => state.role,
    allRoles: (state) => state.allRoles,
    isTeacher: (state) => state.role === ROLES.TEACHER,
    isFinance: (state) => state.role === ROLES.FINANCE,
    isGovernment: (state) => state.role === ROLES.GOVERNMENT,
    isAdmin: (state) => state.role === ROLES.ADMIN,
    isStudent: (state) => state.role === ROLES.STUDENT,
    userInfo: (state) => state.userInfo
  },
  mutations: {
    updateState: (state, payload = {}) => {
      for (const i in payload) {
        state[i] = payload[i]
      }
    },
    cleanState: (state) => {
      state.isShareIn = false
      state.communityData = {
        orgId: undefined,
        communityId: undefined
      }
      state.role = ROLES.STUDENT
      state.allRoles = [ROLES.STUDENT]
      state.userInfo = null
      state.isLoggedIn = false
    },
    // 设置当前角色
    setRole(state, role) {
      if (state.allRoles.includes(role)) {
        state.role = role
        applyTheme(role)
      }
    },
    // 设置用户信息并解析角色
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo
      state.isLoggedIn = !!userInfo
      if (userInfo) {
        state.role = resolveRole(userInfo)
        state.allRoles = resolveAllRoles(userInfo)
        applyTheme(state.role)
      }
    }
  }
})

export default commonStore
