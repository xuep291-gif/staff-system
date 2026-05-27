import { studentApi } from '@/common/api/student.js'

export default {
  namespaced: true,
  state: {
    classInfo: null,       // 班级基本信息
    students: [],          // 班级学生列表
    currentStudent: null,  // 当前查看的学生详情
    searchResults: [],     // 搜索结果
    loading: false
  },
  mutations: {
    SET_CLASS_INFO(state, data) { state.classInfo = data },
    SET_STUDENTS(state, data) { state.students = data },
    SET_CURRENT_STUDENT(state, data) { state.currentStudent = data },
    SET_SEARCH_RESULTS(state, data) { state.searchResults = data },
    SET_LOADING(state, val) { state.loading = val }
  },
  actions: {
    async fetchClassStudents({ commit }, { classId, params }) {
      commit('SET_LOADING', true)
      const res = await studentApi.getClassStudents(classId, params)
      if (res?.data?.code === 200) {
        commit('SET_STUDENTS', res.data.data)
      }
      commit('SET_LOADING', false)
      return res
    },
    async fetchStudentDetail({ commit }, studentId) {
      commit('SET_LOADING', true)
      const res = await studentApi.getStudentDetail(studentId)
      if (res?.data?.code === 200) commit('SET_CURRENT_STUDENT', res.data.data)
      commit('SET_LOADING', false)
      return res
    },
    async searchStudents({ commit }, params) {
      const res = await studentApi.searchStudents(params)
      if (res?.data?.code === 200) commit('SET_SEARCH_RESULTS', res.data.data)
      return res
    },
    setClassInfo({ commit }, info) {
      commit('SET_CLASS_INFO', info)
    }
  }
}
