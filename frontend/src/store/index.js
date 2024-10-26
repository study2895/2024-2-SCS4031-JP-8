import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import departure from './modules/departure'
import destination from './modules/destination'
import time from './modules/time'

export default createStore({
  modules: {
    departure,
    destination,
    time
  },
  plugins: [
    createPersistedState({
      paths: ['departure', 'destination', 'time']
    })
  ]
})
