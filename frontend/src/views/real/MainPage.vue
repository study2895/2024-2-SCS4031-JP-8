<template>
  <div class="background">
    <div class="mobile-container">
      <header class="header">
        <h1>또타자</h1>
      </header>
      <SearchFormComponent />
      <button
        class="search-button"
        :disabled="!canSearch"
        @click="searchRoutes"
        style="color: #625858"
      >
        길 찾기
      </button>
    </div>
  </div>
</template>

<script>
import SearchFormComponent from '@/components/layout/SearchFormComponent.vue'
import { mapState, mapActions } from 'vuex'

export default {
  components: {
    SearchFormComponent
  },
  computed: {
    ...mapState('departure', {
      departureName: (state) => state.departure?.name || '',
      departureCoordinates: (state) => state.departure?.coordinates || {}
    }),
    ...mapState('destination', {
      destinationName: (state) => state.destination?.name || '',
      destinationCoordinates: (state) => state.destination?.coordinates || {}
    }),
    ...mapState('time', {
      month: (state) => state.month,
      day: (state) => state.day,
      hour: (state) => state.hour,
      minute: (state) => state.minute
    }),
    canSearch() {
      return (
        this.departureName &&
        this.destinationName &&
        this.month &&
        this.day &&
        this.hour &&
        this.minute
      )
    }
  },
  methods: {
    ...mapActions('departure', ['updateDeparture']),
    ...mapActions('destination', ['updateDestination']),
    ...mapActions('time', ['updateTime']),
    searchRoutes() {
      console.log('출발지 좌표:', this.departureCoordinates)
      console.log('도착지 좌표:', this.destinationCoordinates)

      const { x: startX, y: startY } = this.departureCoordinates
      const { x: endX, y: endY } = this.destinationCoordinates

      if (!startX || !startY || !endX || !endY) {
        console.error('출발지와 도착지의 x, y 좌표가 설정되지 않았습니다.')
        alert('출발지와 도착지의 위치를 먼저 설정해주세요.')
        return
      }

      console.log('Search routes clicked!')

      // 좌표 및 시간 정보와 함께 페이지 이동
      this.$router.push({
        path: '/bus-search',
        query: {
          startX,
          startY,
          endX,
          endY,
          month: this.$store.state.time.month,
          day: this.$store.state.time.day,
          hour: this.$store.state.time.hour,
          minute: this.$store.state.time.minute
        }
      })
    }
  }
}
</script>

<style scoped>
.background {
  background-color: #eaeaea;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.mobile-container {
  width: 100%;
  max-width: 425px;
  margin: 0 auto;
  padding: 25px;
  background-color: white;
  height: 100vh;
  overflow-y: auto;
}
.header {
  text-align: center;
  margin-bottom: 20px;
}
h1 {
  font-size: 18px;
  font-weight: bold;
}
.search-button {
  width: 100%;
  padding: 12px;
  background-color: #e5c7c7;
  color: white;
  font-size: 16px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
}
.search-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
