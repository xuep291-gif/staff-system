import { paymentApi } from '@/common/api/payment.js'

export default {
  namespaced: true,
  state: {
    classStats: null,        // 班级缴费统计
    studentPayments: [],     // 学生缴费列表
    currentStudent: null,    // 当前查看的学生缴费详情
    studentBills: [],        // 学生账单明细
    payRecords: [],          // 缴费记录
    pendingOffline: [],      // 待确认线下收款
    paymentRecords: [],      // 收款记录查询结果
    loading: false
  },
  mutations: {
    SET_CLASS_STATS(state, data) { state.classStats = data },
    SET_STUDENT_PAYMENTS(state, data) { state.studentPayments = data },
    SET_CURRENT_STUDENT(state, data) { state.currentStudent = data },
    SET_STUDENT_BILLS(state, data) { state.studentBills = data },
    SET_PAY_RECORDS(state, data) { state.payRecords = data },
    SET_PENDING_OFFLINE(state, data) { state.pendingOffline = data },
    SET_PAYMENT_RECORDS(state, data) { state.paymentRecords = data },
    SET_LOADING(state, val) { state.loading = val }
  },
  actions: {
    async fetchClassStats({ commit }, params) {
      const res = await paymentApi.getClassStats(params)
      if (res?.data?.code === 200) commit('SET_CLASS_STATS', res.data.data)
      return res
    },
    async fetchStudentPayments({ commit }, params) {
      commit('SET_LOADING', true)
      const res = await paymentApi.getStudentPayments(params)
      if (res?.data?.code === 200) commit('SET_STUDENT_PAYMENTS', res.data.data)
      commit('SET_LOADING', false)
      return res
    },
    async fetchStudentDetail({ commit }, studentId) {
      const res = await paymentApi.getStudentPaymentDetail(studentId)
      if (res?.data?.code === 200) commit('SET_CURRENT_STUDENT', res.data.data)
      return res
    },
    async fetchStudentBills({ commit }, studentId) {
      const res = await paymentApi.getStudentBills(studentId)
      if (res?.data?.code === 200) commit('SET_STUDENT_BILLS', res.data.data)
      return res
    },
    async fetchPayRecords({ commit }, studentId) {
      const res = await paymentApi.getStudentPayRecords(studentId)
      if (res?.data?.code === 200) commit('SET_PAY_RECORDS', res.data.data)
      return res
    },
    async confirmOffline({ commit }, params) {
      return await paymentApi.confirmOfflinePayment(params)
    },
    async fetchPendingOffline({ commit }) {
      const res = await paymentApi.getPendingOfflinePayments()
      if (res?.data?.code === 200) commit('SET_PENDING_OFFLINE', res.data.data)
      return res
    },
    async fetchPaymentRecords({ commit }, params) {
      const res = await paymentApi.getPaymentRecords(params)
      if (res?.data?.code === 200) commit('SET_PAYMENT_RECORDS', res.data.data)
      return res
    }
  }
}
