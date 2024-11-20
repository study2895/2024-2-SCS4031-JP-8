<template>
  <div class="debugging-container">
    <h1>버스 승차 확률 테스트</h1>
    <div>
      <label for="route-select">버스 노선 선택:</label>
      <select
        v-model="selectedRoute"
        id="route-select"
        @change="setTargetStation"
      >
        <option value="5000A">5000A</option>
        <option value="5000B">5000B</option>
        <option value="6001">6001</option>
        <option value="1112">1112</option>
        <option value="M7731">M7731</option>
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
import fs from 'fs'
import math from 'mathjs'
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
function loadPassengerData(filePath) {
  const data = fs.readFileSync(filePath, 'utf8')
  const records = Papa.parse(data, { header: true }).data
  const passengerData = {}
  records.forEach((record) => {
    passengerData[record['정류장명']] = record
  })
  return passengerData
}

// 필요한 함수들 정의
function poissonProb(k, sigma, lam) {
  return Array.from({ length: sigma - k }, (_, i) => k + i).reduce(
    (sum, i) => sum + (math.exp(-lam) * Math.pow(lam, i)) / math.factorial(i),
    0
  )
}

// 버스 위치 정보를 가져오는 함수
function getBusLocation(routeId) {
  // 이 함수는 실제 API나 다른 데이터 소스에서 버스 위치 정보를 가져와야 합니다.
  // 앞의 버스 위치, 뒤의 버스 위치에서 10분 이내이면 합치는 코드 API로 받아오기
  // 여기서는 예시로 임의의 값을 반환합니다.
  return [38, 13] // 현재 정류장 인덱스, 다음 정류장 인덱스
}

// 승차 확률 계산 함수
function calculateBoardingProbability(
  routeId,
  targetStation,
  currentTime,
  passengerData
) {
  const [currentBus, nextBus] = getBusLocation(routeId)

  let remainSeat = 60
  const timeSlot = '18시_승하차' // `f"{currentTime.hour}시_승하차"`로 변경 가능

  const stationList = Object.keys(passengerData)
  const relevantStations = stationList.slice(currentBus, targetStation + 1)

  const timeInterval = 15
  const totalBus = 60 / timeInterval

  const probabilities = []

  for (const station of relevantStations) {
    const stationIndex = relevantStations.indexOf(station)

    let avgPass = parseFloat(passengerData[station][timeSlot])

    if (Array.isArray(avgPass)) {
      avgPass = avgPass[0]
    }
    if (isNaN(avgPass)) {
      avgPass = 0
    }

    const totalPass = Math.max(0, avgPass * totalBus)
    const busArrivalTime = 19 + stationIndex * 10

    let busesUntilNow = Math.floor(busArrivalTime / timeInterval)
    if (busArrivalTime < 30) {
      busesUntilNow = totalBus - busesUntilNow
    }

    const passPerTime = busesUntilNow > 0 ? totalPass / busesUntilNow : 0

    const targetPass = Math.floor(totalPass - remainSeat)
    const prob =
      targetPass <= 0 ? 1 : poissonProb(targetPass, totalPass, passPerTime)
    probabilities.push({ station, probability: (prob * 100).toFixed(2) })

    if (remainSeat > 0) {
      remainSeat -= avgPass
      remainSeat = Math.max(0, remainSeat)
    }
  }

  return probabilities
}

export default {
  data() {
    return {
      selectedRoute: '5000B', // 초기 선택된 노선
      selectedDirection: 'up', // 초기 방향 (상행)
      targetStation: null, // 목표 정류장 번호
      results: [] // 계산 결과 저장
    }
  },
  methods: {
    setTargetStation() {
      // 노선과 방향에 따라 목표 정류장 번호 설정
      this.targetStation =
        busTargetStations[this.selectedRoute][this.selectedDirection]
      console.log(
        `선택된 노선: ${this.selectedRoute}, 방향: ${this.selectedDirection}, 목표 정류장: ${this.targetStation}`
      )
    },
    async runDebuggingLogic() {
      try {
        console.log('[INFO] Debugging logic 실행 중...')
        const passengerData = loadPassengerData('int_passenger_flow.csv')

        // 승차 확률 계산
        this.results = calculateBoardingProbability(
          this.selectedRoute,
          this.targetStation,
          new Date(),
          passengerData
        )

        console.log('[INFO] Debugging logic 결과:', this.results)
      } catch (error) {
        console.error('[ERROR] Debugging logic 실행 중 오류 발생:', error)
      }
    }
  },
  mounted() {
    this.setTargetStation() // 초기 목표 정류장 설정
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
