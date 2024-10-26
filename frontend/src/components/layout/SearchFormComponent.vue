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
      // Vuex의 값을 복사하여 로컬 상태로 저장
      localMonth: '',
      localDay: '',
      localHour: '',
      localMinute: ''
    }
  },
  computed: {
    // Vuex에서 출발지와 도착지의 이름과 좌표 가져오기
    ...mapState('departure', {
      departureName: (state) => state.departure?.name || '',
      departureCoordinates: (state) => state.departure?.coordinates || {}
    }),
    ...mapState('destination', {
      destinationName: (state) => state.destination?.name || '',
      destinationCoordinates: (state) => state.destination?.coordinates || {}
    }),
    // Vuex의 시간 모듈에서 시간 값 가져오기 (변경 감지 없이 읽기 전용)
    ...mapState('time', {
      month: (state) => state.month,
      day: (state) => state.day,
      hour: (state) => state.hour,
      minute: (state) => state.minute
    })
  },
  watch: {
    // Vuex 상태가 변하면 local data와 동기화
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
      // 로컬 상태를 Vuex에 업데이트
      this.setTime({
        month: this.localMonth,
        day: this.localDay,
        hour: this.localHour,
        minute: this.localMinute
      })
    },
    syncLocalTime() {
      // Vuex의 현재 시간 값을 로컬 상태에 동기화
      this.localMonth = this.month
      this.localDay = this.day
      this.localHour = this.hour
      this.localMinute = this.minute
    },
    searchRoutes() {
      // 출발지와 도착지의 좌표 설정 여부 확인
      const { x: startX, y: startY } = this.departureCoordinates
      const { x: endX, y: endY } = this.destinationCoordinates

      if (!startX || !startY || !endX || !endY) {
        console.error('출발지와 도착지의 x, y 좌표가 설정되지 않았습니다.')
        alert('출발지와 도착지의 위치를 먼저 설정해주세요.')
        return
      }

      console.log('출발지와 도착지의 좌표:', {
        startX,
        startY,
        endX,
        endY
      })

      // 다음 페이지로 좌표 및 시간 정보 전달
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
    // 컴포넌트가 로드될 때 Vuex의 시간 데이터를 로컬 상태로 설정
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
