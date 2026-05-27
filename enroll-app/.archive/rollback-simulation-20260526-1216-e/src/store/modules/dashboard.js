import { reportApi } from '@/common/api/report.js'

export default {
  namespaced: true,
  state: {
    dashboardData: null,       // 迎新大数据
    progressReport: null,      // 收费进度
    transactionReport: null,   // 收费流水
    methodReport: null,        // 支付方式统计
    trendReport: null,         // 收费趋势
    arrearsReport: null,       // 欠费统计
    refundReport: null,        // 退费统计
    diffRefundReport: null     // 补差统计
  },
  mutations: {
    SET_DASHBOARD(state, data) { state.dashboardData = data },
    SET_PROGRESS(state, data) { state.progressReport = data },
    SET_TRANSACTIONS(state, data) { state.transactionReport = data },
    SET_METHODS(state, data) { state.methodReport = data },
    SET_TREND(state, data) { state.trendReport = data },
    SET_ARREARS(state, data) { state.arrearsReport = data },
    SET_REFUND(state, data) { state.refundReport = data },
    SET_DIFF_REFUND(state, data) { state.diffRefundReport = data }
  },
  actions: {
    async fetchDashboard({ commit }) {
      const res = await reportApi.getDashboardData()
      if (res?.data?.code === 200) commit('SET_DASHBOARD', res.data.data)
      return res
    },
    async fetchProgress({ commit }, params) {
      const res = await reportApi.getProgressReport(params)
      if (res?.data?.code === 200) commit('SET_PROGRESS', res.data.data)
      return res
    },
    async fetchTransactions({ commit }, params) {
      const res = await reportApi.getTransactionReport(params)
      if (res?.data?.code === 200) commit('SET_TRANSACTIONS', res.data.data)
      return res
    },
    async fetchMethods({ commit }, params) {
      const res = await reportApi.getMethodReport(params)
      if (res?.data?.code === 200) commit('SET_METHODS', res.data.data)
      return res
    },
    async fetchTrend({ commit }, params) {
      const res = await reportApi.getTrendReport(params)
      if (res?.data?.code === 200) commit('SET_TREND', res.data.data)
      return res
    },
    async fetchArrears({ commit }, params) {
      const res = await reportApi.getArrearsReport(params)
      if (res?.data?.code === 200) commit('SET_ARREARS', res.data.data)
      return res
    },
    async fetchRefund({ commit }, params) {
      const res = await reportApi.getRefundReport(params)
      if (res?.data?.code === 200) commit('SET_REFUND', res.data.data)
      return res
    },
    async fetchDiffRefund({ commit }, params) {
      const res = await reportApi.getDiffRefundReport(params)
      if (res?.data?.code === 200) commit('SET_DIFF_REFUND', res.data.data)
      return res
    }
  }
}
