import { refundApi } from '@/common/api/refund.js'

export default {
  namespaced: true,
  state: {
    refundList: [],        // 退费列表
    currentRefund: null,   // 当前退费详情
    diffList: [],          // 补差退款列表
    refundRecords: []      // 退费记录
  },
  mutations: {
    SET_REFUND_LIST(state, data) { state.refundList = data },
    SET_CURRENT_REFUND(state, data) { state.currentRefund = data },
    SET_DIFF_LIST(state, data) { state.diffList = data },
    SET_REFUND_RECORDS(state, data) { state.refundRecords = data }
  },
  actions: {
    async fetchRefundList({ commit }, params) {
      const res = await refundApi.getRefundList(params)
      if (res?.data?.code === 200) commit('SET_REFUND_LIST', res.data.data)
      return res
    },
    async fetchRefundDetail({ commit }, id) {
      const res = await refundApi.getRefundDetail(id)
      if (res?.data?.code === 200) commit('SET_CURRENT_REFUND', res.data.data)
      return res
    },
    async approveRefund({ dispatch }, { id, params }) {
      const res = await refundApi.approveRefund(id, params)
      return res
    },
    async executeRefund({ dispatch }, id) {
      return await refundApi.executeRefund(id)
    },
    async retryRefund({ dispatch }, id) {
      return await refundApi.retryRefund(id)
    },
    async fetchDiffList({ commit }, params) {
      const res = await refundApi.getDiffRefundList(params)
      if (res?.data?.code === 200) commit('SET_DIFF_LIST', res.data.data)
      return res
    },
    async confirmDiff({ dispatch }, { id, params }) {
      return await refundApi.confirmDiffRefund(id, params)
    },
    async fetchRefundRecords({ commit }, params) {
      const res = await refundApi.getRefundRecords(params)
      if (res?.data?.code === 200) commit('SET_REFUND_RECORDS', res.data.data)
      return res
    }
  }
}
