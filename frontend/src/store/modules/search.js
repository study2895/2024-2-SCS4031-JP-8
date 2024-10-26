// store/search.js
export const search = {
  namespaced: true,
  state: () => ({
    results: [] // 검색 결과를 저장하는 상태
  }),
  mutations: {
    SET_RESULTS(state, payload) {
      state.results = payload
    }
  },
  actions: {
    setResults({ commit }, results) {
      commit('SET_RESULTS', results)
    }
  },
  getters: {
    getResults: (state) => state.results
  }
}
