const state = {
  initialize: false, // 초기화 플래그 추가
  month: '',
  day: '',
  hour: '',
  minute: ''
}

const mutations = {
  setTime(state, { month, day, hour, minute }) {
    state.month = month
    state.day = day
    state.hour = hour
    state.minute = minute
  },
  resetTime(state) {
    // 초기화 mutation 추가
    state.month = ''
    state.day = ''
    state.hour = ''
    state.minute = ''
  },
  setInitialize(state, initialize) {
    state.initialize = initialize
  }
}

const actions = {
  updateTime({ commit }, time) {
    commit('setTime', time)
  },
  initialize({ commit, state }) {
    if (!state.initialize) {
      commit('setInitialize', true)
      commit('resetTime')
    }
  }
}

const getters = {
  getTime(state) {
    return {
      month: state.month,
      day: state.day,
      hour: state.hour,
      minute: state.minute
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
