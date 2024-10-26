const state = {
  departure: null
}

const mutations = {
  setDeparture(state, departure) {
    state.departure = departure
    console.log('Vuex - setDeparture:', state.departure)
  }
}

const actions = {
  updateDeparture({ commit }, departure) {
    commit('setDeparture', departure)
  }
}

const getters = {
  getDeparture(state) {
    return state.departure
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
