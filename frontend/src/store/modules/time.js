const state = {
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
  }
}

const actions = {
  updateTime({ commit }, time) {
    commit('setTime', time)
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
