<template>
  <div class="search-form">
    <div class="input-group">
      <label>출발지:</label>
      <input
        v-model="departureName"
        placeholder="출발지를 입력하세요"
        @focus="goToSearchDeparture"
        readonly
      />
    </div>
    <div class="input-group">
      <label>도착지:</label>
      <input
        v-model="destinationName"
        placeholder="도착지를 입력하세요"
        @focus="goToSearchDestination"
        readonly
      />
    </div>
    <div class="input-group">
      <label>출발 시각:</label>
      <div class="time-inputs">
        <input v-model="localMonth" placeholder="월" @input="updateTime" />
        <input v-model="localDay" placeholder="일" @input="updateTime" />
        <input v-model="localHour" placeholder="시" @input="updateTime" />
        <input v-model="localMinute" placeholder="분" @input="updateTime" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      localMonth: '',
      localDay: '',
      localHour: '',
      localMinute: ''
    }
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
    })
  },
  watch: {
    month: 'syncLocalTime',
    day: 'syncLocalTime',
    hour: 'syncLocalTime',
    minute: 'syncLocalTime'
  },
  methods: {
    ...mapMutations('time', ['setTime']),
    goToSearchDeparture() {
      this.$router.push('/search-departure')
    },
    goToSearchDestination() {
      this.$router.push('/search-destination')
    },
    updateTime() {
      console.log(
        '로컬 시간 업데이트:',
        this.localMonth,
        this.localDay,
        this.localHour,
        this.localMinute
      )
      this.setTime({
        month: this.localMonth,
        day: this.localDay,
        hour: this.localHour,
        minute: this.localMinute
      })
      console.log('Vuex에 업데이트된 시간:', this.$store.state.time)
    },
    syncLocalTime() {
      this.localMonth = this.month
      this.localDay = this.day
      this.localHour = this.hour
      this.localMinute = this.minute
      console.log(
        'Vuex 시간 데이터와 동기화된 로컬 상태:',
        this.localMonth,
        this.localDay,
        this.localHour,
        this.localMinute
      )
    },
    searchRoutes() {
      const { x: startX, y: startY } = this.departureCoordinates
      const { x: endX, y: endY } = this.destinationCoordinates

      if (!startX || !startY || !endX || !endY) {
        console.error('출발지와 도착지의 x, y 좌표가 설정되지 않았습니다.')
        alert('출발지와 도착지의 위치를 먼저 설정해주세요.')
        return
      }

      console.log('출발지와 도착지 좌표:', { startX, startY, endX, endY })
      console.log('전달할 출발 날짜:', this.localMonth, this.localDay)
      console.log('전달할 출발 시간:', this.localHour, this.localMinute)

      this.$router.push({
        path: '/bus-search',
        query: {
          startX,
          startY,
          endX,
          endY,
          month: this.localMonth,
          day: this.localDay,
          hour: this.localHour,
          minute: this.localMinute
        }
      })
    }
  },
  mounted() {
    this.syncLocalTime()
  }
}
</script>

<style scoped>
.search-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px 0;
}

.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

label {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.time-inputs {
  display: flex;
  gap: 10px;
}

.time-inputs input {
  flex: 1;
}
</style>
