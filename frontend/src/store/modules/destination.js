const state = {
  destination: null
}

const mutations = {
  setDestination(state, destination) {
    state.destination = destination
    console.log('Vuex - setDestination:', state.destination)
  }
}

const actions = {
  updateDestination({ commit }, destination) {
    commit('setDestination', destination)
  }
}

const getters = {
  getDestination(state) {
    return state.destination
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
