<template>
  <div class="debugging-container">
    <h1>버스 승차 확률 테스트</h1>
    <div>
      <label for="route-select">버스 노선 선택:</label>
      <select v-model="selectedRoute" id="route-select" @change="updateCsvPath">
        <option value="5000A">5000A</option>
        <option value="5000B">5000B</option>
        <option value="6001">6001</option>
        <option value="1112">1112</option>
        <option value="M7731">M7731</option>
      </select>
      <label for="day-select">요일 선택:</label>
      <select v-model="selectedDayType" id="day-select" @change="updateCsvPath">
        <option value="평일">평일</option>
        <option value="토요일">토요일</option>
        <option value="일요일">일요일</option>
      </select>
      <label for="direction-select">방향 선택:</label>
      <select
        v-model="selectedDirection"
        id="direction-select"
        @change="setTargetStation"
      >
        <option value="up">상행</option>
        <option value="down">하행</option>
      </select>
      <p>목표 정류장 번호: {{ targetStation }}</p>
      <p>CSV 파일 경로: {{ csvPath }}</p>
      <button @click="runDebuggingLogic">테스트 실행</button>
    </div>
    <div v-if="results.length > 0">
      <h2>결과:</h2>
      <ul>
        <li v-for="(result, index) in results" :key="index">
          정류장: {{ result.station }} - 승차 확률: {{ result.probability }}%
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse'

// 상행/하행 목표 정류장 번호 데이터
const busTargetStations = {
  '5000A': {
    up: 50, // 상행 종점
    down: 1 // 하행 종점
  },
  '5000B': {
    up: 44, // 상행 종점
    down: 2 // 하행 종점
  },
  6001: {
    up: 60, // 상행 종점
    down: 3 // 하행 종점
  },
  1112: {
    up: 35, // 상행 종점
    down: 5 // 하행 종점
  },
  M7731: {
    up: 25, // 상행 종점
    down: 10 // 하행 종점
  }
}

// CSV 파일에서 승차 인원 데이터를 불러오는 함수
async function loadPassengerData(filePath) {
  try {
    const response = await fetch(filePath)
    const text = await response.text()
    return Papa.parse(text, { header: true }).data
  } catch (error) {
    console.error(`[ERROR] CSV 파일 로드 실패 (${filePath}):`, error)
    return []
  }
}

// 필요한 함수들 정의
function poissonProb(k, sigma, lam) {
  return Array.from({ length: sigma - k }, (_, i) => k + i).reduce(
    (sum, i) => sum + (Math.exp(-lam) * Math.pow(lam, i)) / factorial(i),
    0
  )
}

function factorial(n) {
  return n === 0 ? 1 : n * factorial(n - 1)
}

function calculateBoardingProbability(routeId, targetStation, passengerData) {
  const currentBus = 38 // 예시 값
  const remainSeat = 60
  const timeSlot = '18시_승하차'
  const stationList = Object.keys(passengerData)
  const relevantStations = stationList.slice(currentBus, targetStation + 1)
  const timeInterval = 15
  const totalBus = 60 / timeInterval

  const probabilities = []

  for (const station of relevantStations) {
    const avgPass = parseFloat(passengerData[station][timeSlot]) || 0
    const totalPass = Math.max(0, avgPass * totalBus)
    const busesUntilNow = totalPass > 0 ? Math.floor(totalPass / remainSeat) : 0
    const targetPass = Math.max(0, totalPass - remainSeat)

    const prob =
      targetPass <= 0 ? 1 : poissonProb(targetPass, totalPass, remainSeat)
    probabilities.push({ station, probability: (prob * 100).toFixed(2) })
  }

  return probabilities
}

export default {
  data() {
    return {
      selectedRoute: '5000B', // 초기 노선
      selectedDayType: '평일', // 초기 요일 (평일, 토요일, 일요일)
      selectedDirection: 'up', // 초기 방향 (상행)
      targetStation: null, // 목표 정류장 번호
      csvPath: '', // CSV 파일 경로
      results: [] // 결과 저장
    }
  },
  methods: {
    setTargetStation() {
      this.targetStation =
        busTargetStations[this.selectedRoute][this.selectedDirection]
    },
    updateCsvPath() {
      // 선택된 노선과 요일에 따라 CSV 경로 설정
      this.csvPath = `/csv/${this.selectedRoute}/${this.selectedRoute}_${this.selectedDayType}.csv`
      console.log(`[INFO] CSV 파일 경로 설정: ${this.csvPath}`)
    },
    async runDebuggingLogic() {
      try {
        // CSV 데이터 로드
        const passengerData = await loadPassengerData(this.csvPath)

        // 승차 확률 계산
        this.results = calculateBoardingProbability(
          this.selectedRoute,
          this.targetStation,
          passengerData
        )

        console.log('[INFO] 계산 결과:', this.results)
      } catch (error) {
        console.error('[ERROR] 로직 실행 중 오류 발생:', error)
      }
    }
  },
  mounted() {
    this.setTargetStation()
    this.updateCsvPath()
  }
}
</script>

<style scoped>
.debugging-container {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
h1 {
  color: #333;
  text-align: center;
}
button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
</style>
