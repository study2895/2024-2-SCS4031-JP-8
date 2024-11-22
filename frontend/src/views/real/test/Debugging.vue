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
import axios from 'axios'

// 상행/하행 목표 정류장 번호 데이터
const busTargetStations = {
  '5000A': { up: 57, down: 28 },
  '5000B': { up: 78, down: 41 },
  6001: { up: 41, down: 18 },
  1112: { up: 51, down: 24 },
  M7731: { up: 25, down: 10 }
}

// CSV 파일에서 승차 인원 데이터를 불러오는 함수
async function loadPassengerData(filePath) {
  try {
    const response = await fetch(filePath)
    const text = await response.text()
    const data = Papa.parse(text, { header: true }).data
    const passengerData = {}
    data.forEach((row) => {
      passengerData[row['정류장명']] = row
    })
    return passengerData
  } catch (error) {
    console.error(`[ERROR] CSV 파일 로드 실패 (${filePath}):`, error)
    return {}
  }
}

// 포아송 확률 계산 함수
function poissonProb(k, sigma, lam) {
  return Array.from({ length: Math.ceil(sigma) - k }, (_, i) => k + i).reduce(
    (sum, i) => sum + (Math.exp(-lam) * Math.pow(lam, i)) / factorial(i),
    0
  )
}

// 팩토리얼 계산 함수
function factorial(n) {
  return n === 0 ? 1 : n * factorial(n - 1)
}

// API 호출을 통해 실시간 여석 정보 가져오기
async function getRealTimeSeats(routeId, stationId) {
  const serviceKey = 'YOUR_SERVICE_KEY' // API 키 입력
  try {
    const response = await axios.get(
      'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem',
      {
        params: {
          serviceKey: serviceKey,
          stationId: stationId,
          routeId: routeId
        }
      }
    )

    const result = response.data.response.body.items.item

    if (!result) {
      console.warn('[WARN] API 응답에 차량 정보가 없습니다.')
      return 0
    }

    const firstBus = {
      predictTime: parseInt(result.predictTime1, 10),
      remainSeats: parseInt(result.remainSeatCnt1, 10)
    }

    const secondBus = {
      predictTime: parseInt(result.predictTime2, 10),
      remainSeats: parseInt(result.remainSeatCnt2, 10)
    }

    let totalRemainSeats = firstBus.remainSeats

    if (
      !isNaN(firstBus.predictTime) &&
      !isNaN(secondBus.predictTime) &&
      firstBus.predictTime <= 10 &&
      secondBus.predictTime <= 10
    ) {
      totalRemainSeats += secondBus.remainSeats
    }

    return totalRemainSeats > 0 ? totalRemainSeats : 0
  } catch (error) {
    console.error('[ERROR] API 호출 중 오류 발생:', error)
    return 0
  }
}

// 승차 확률 계산 함수
async function calculateBoardingProbability({
  routeId,
  targetStation,
  currentTime,
  passengerData,
  stationId,
  useRealTime
}) {
  let remainSeat = 60

  if (useRealTime) {
    remainSeat = await getRealTimeSeats(routeId, stationId)
  }

  const timeSlot = `${currentTime.getHours()}시_승하차`
  const stationList = Object.keys(passengerData)
  const relevantStations = stationList.slice(0, targetStation + 1)
  const timeInterval = 15
  const totalBus = 60 / timeInterval

  const probabilities = []

  for (const station of relevantStations) {
    const stationIndex = relevantStations.indexOf(station)
    const avgPass = parseFloat(passengerData[station]?.[timeSlot] || 0)

    const totalPass = Math.max(0, avgPass * totalBus)
    const busArrivalTime = 19 + stationIndex * 10

    const busesUntilNow = Math.floor(busArrivalTime / timeInterval)
    const passPerTime = busesUntilNow > 0 ? totalPass / busesUntilNow : 0

    const targetPass = Math.max(0, totalPass - remainSeat)

    const prob =
      targetPass <= 0 ? 1 : poissonProb(targetPass, totalPass, passPerTime)
    probabilities.push({ station, probability: (prob * 100).toFixed(2) })
  }

  return probabilities
}

export default {
  data() {
    return {
      selectedRoute: '5000B',
      selectedDayType: '평일',
      selectedDirection: 'up',
      targetStation: null,
      csvPath: '',
      results: [],
      stationId: '193372', // 임시 정류소 ID
      useRealTime: false // 실시간 여부 설정
    }
  },
  methods: {
    setTargetStation() {
      this.targetStation =
        busTargetStations[this.selectedRoute][this.selectedDirection]
    },
    updateCsvPath() {
      this.csvPath = `/csv/${this.selectedRoute}/${this.selectedRoute}_${this.selectedDayType}.csv`
    },
    async runDebuggingLogic() {
      try {
        const passengerData = await loadPassengerData(this.csvPath)
        const currentTime = new Date()
        const useRealTime =
          currentTime.getHours() === this.selectedHour &&
          currentTime.getMinutes() === this.selectedMinute

        this.results = await calculateBoardingProbability({
          routeId: this.selectedRoute,
          targetStation: this.targetStation,
          currentTime,
          passengerData,
          stationId: this.stationId,
          useRealTime
        })
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
/* 스타일은 동일 */
</style>

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
