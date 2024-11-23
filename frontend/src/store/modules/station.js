const state = {
  stationData: null
}

const mutations = {
  SET_STATION_DATA(state, payload) {
    state.stationData = payload
  }
}

const actions = {
  saveStationData({ commit }, payload) {
    commit('SET_STATION_DATA', payload)
  }
}

const getters = {
  getStationData: (state) => state.stationData
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
