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
  margin-bottom: 30px;
}

h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.search-button {
  width: 100%;
  padding: 14px;
  background-color: #e5c7c7;
  color: #625858;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.search-button:hover:not(:disabled) {
  background-color: #d8b4b4;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-button:disabled {
  background-color: #ccc;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

/* 추가적인 스타일 개선 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
