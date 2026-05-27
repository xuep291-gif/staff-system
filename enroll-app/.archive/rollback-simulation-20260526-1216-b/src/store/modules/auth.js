import { ROLES, resolveRole, resolveAllRoles, applyTheme } from '@/utils/role.js'

export default {
  namespaced: true,
  state: {
    role: ROLES.STUDENT,
    allRoles: [ROLES.STUDENT],
    token: '',
    userInfo: null
  },
  getters: {
    currentRole: (state) => state.role,
    allRoles: (state) => state.allRoles,
    isTeacher: (state) => state.role === ROLES.TEACHER,
    isFinance: (state) => state.role === ROLES.FINANCE,
    isAdmin: (state) => state.role === ROLES.ADMIN,
    isStudent: (state) => state.role === ROLES.STUDENT,
    token: (state) => state.token
  },
  mutations: {
    SET_ROLE(state, role) {
      state.role = role
    },
    SET_ALL_ROLES(state, roles) {
      state.allRoles = roles
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
    },
    LOGOUT(state) {
      state.role = ROLES.STUDENT
      state.allRoles = [ROLES.STUDENT]
      state.token = ''
      state.userInfo = null
    }
  },
  actions: {
    initAuth({ commit, dispatch }, userInfo) {
      if (!userInfo) return
      commit('SET_USER_INFO', userInfo)
      const role = resolveRole(userInfo)
      const allRoles = resolveAllRoles(userInfo)
      commit('SET_ROLE', role)
      commit('SET_ALL_ROLES', allRoles)
      applyTheme(role)
    },
    switchRole({ commit, state }, role) {
      if (!state.allRoles.includes(role)) return false
      commit('SET_ROLE', role)
      applyTheme(role)
      return true
    },
    logout({ commit }) {
      commit('LOGOUT')
      try {
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('token')
        uni.removeStorageSync('communityData')
      } catch (e) {
        // ignore
      }
    }
  }
}
