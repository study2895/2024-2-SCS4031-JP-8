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
      <p>정류장 순번: {{ stationSequence }}</p>
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

const busTargetStations = {
  '5000A': { up: 57, down: 28 },
  '5000B': { up: 78, down: 41 },
  6001: { up: 41, down: 18 },
  1112: { up: 51, down: 24 },
  M7731: { up: 25, down: 10 }
}

async function loadPassengerData(filePath) {
  try {
    console.log(`[INFO] Loading passenger data from: ${filePath}`)
    const response = await fetch(filePath)
    const text = await response.text()
    const data = Papa.parse(text, { header: true }).data
    const passengerData = {}
    data.forEach((row) => {
      passengerData[row['정류장명']] = row
    })
    console.log('[INFO] Passenger data successfully loaded.')
    return passengerData
  } catch (error) {
    console.error(`[ERROR] Failed to load CSV file (${filePath}):`, error)
    return {}
  }
}

function poissonProb(k, sigma, lam) {
  console.log(
    `[DEBUG] Calculating Poisson probability for k=${k}, sigma=${sigma}, lam=${lam}`
  )
  const result = Array.from(
    { length: Math.ceil(sigma) - k },
    (_, i) => k + i
  ).reduce(
    (sum, i) => sum + (Math.exp(-lam) * Math.pow(lam, i)) / factorial(i),
    0
  )
  console.log(`[DEBUG] Poisson probability calculated: ${result}`)
  return result
}

function factorial(n) {
  return n === 0 ? 1 : n * factorial(n - 1)
}

async function getRealTimeSeats(routeId, stationId) {
  const serviceKey =
    'EVTsGjdsoUlBtJTpdh/itgFJXzeeNK/BP4lN8my+i9AaoLGNln1kqRcyVP7CVRY8GsiXkX+OMl2HviEvq6hlfQ=='
  console.log(
    `[INFO] Fetching real-time seats for routeId: ${routeId}, stationId: ${stationId}`
  )

  try {
    const response = await axios.get(
      'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem',
      {
        params: {
          serviceKey: serviceKey,
          stationId: stationId,
          routeId: routeId
          // staOrder: 19 // 정류소 순번 (필요시 추가)
        }
      }
    )

    console.log('[DEBUG] API 응답 데이터:', response.data)

    const result = response.data?.response?.body?.items?.item

    if (!result) {
      console.warn('[WARN] API 응답에 데이터가 없습니다.')
      console.log('[DEBUG] 전체 응답:', response.data)
      return 60 // 기본 여석
    }

    const firstBus = {
      predictTime: parseInt(result.predictTime1, 10),
      remainSeats:
        result.remainSeatCnt1 === -1 ? 0 : parseInt(result.remainSeatCnt1, 10)
    }

    const secondBus = {
      predictTime: parseInt(result.predictTime2, 10),
      remainSeats:
        result.remainSeatCnt2 === -1 ? 0 : parseInt(result.remainSeatCnt2, 10)
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

    console.log(`[INFO] Total remaining seats calculated: ${totalRemainSeats}`)
    return totalRemainSeats > 0 ? totalRemainSeats : 0
  } catch (error) {
    console.error('[ERROR] API 호출 실패:', error)
    return 60 // 기본 여석
  }
}

async function calculateBoardingProbability({
  routeId,
  targetStation,
  currentTime,
  passengerData,
  stationId,
  stationSequence
}) {
  console.log(
    `[INFO] Starting probability calculation for stationSequence: ${stationSequence}`
  )
  const remainSeat = await getRealTimeSeats(routeId, stationId)

  const timeSlot = `${currentTime.getHours()}시`
  console.log(`[INFO] Calculating probabilities for timeSlot: ${timeSlot}`)

  const stationList = Object.keys(passengerData)
  if (stationList.length === 0) {
    console.warn('[WARN] Passenger data is empty or malformed.')
    return []
  }
  console.log('[DEBUG] Loaded station list:', stationList)

  const relevantStations = stationList.slice(0, targetStation + 1)
  console.log('[DEBUG] Relevant stations:', relevantStations)

  const timeInterval = 15
  const totalBus = 60 / timeInterval

  const probabilities = []

  for (const station of relevantStations) {
    if (!passengerData.hasOwnProperty(station)) {
      console.warn(`[WARN] Station '${station}' not found in passenger data.`)
      continue // 해당 정류장을 건너뜀
    }

    console.log(`[INFO] Processing station: ${station}`)
    const stationIndex = relevantStations.indexOf(station)

    let avgPass = parseFloat(passengerData[station]?.[timeSlot] || 0)

    if (isNaN(avgPass)) {
      console.warn(
        `[WARN] Average passengers for station ${station} is NaN. Setting to 0.`
      )
      avgPass = 0
    }

    const totalPass = Math.max(0, avgPass * totalBus)
    const busArrivalTime = 19 + stationIndex * 10

    const busesUntilNow = Math.floor(busArrivalTime / timeInterval)
    const passPerTime = busesUntilNow > 0 ? totalPass / busesUntilNow : 0

    const targetPass = Math.max(0, totalPass - remainSeat)

    const prob =
      targetPass <= 0 ? 1 : poissonProb(targetPass, totalPass, passPerTime)

    probabilities.push({ station, probability: (prob * 100).toFixed(2) })
    console.log(
      `[INFO] Probability for station ${station}: ${(prob * 100).toFixed(2)}%`
    )
  }

  console.log(`[INFO] Probability calculation completed.`)
  return probabilities
}

export default {
  data() {
    return {
      selectedRoute: '5000B',
      selectedDayType: '평일',
      selectedDirection: 'up',
      targetStation: null,
      stationSequence: 0,
      csvPath: '',
      results: [],
      stationId: '193372'
    }
  },
  methods: {
    setTargetStation() {
      this.targetStation =
        busTargetStations[this.selectedRoute][this.selectedDirection]
      this.stationSequence =
        this.selectedDirection === 'up'
          ? busTargetStations[this.selectedRoute].up
          : 0
      console.log(`[INFO] Target station set to: ${this.targetStation}`)
      console.log(`[INFO] Station sequence set to: ${this.stationSequence}`)
    },
    updateCsvPath() {
      this.csvPath = `/csv/${this.selectedRoute}/passengers/${this.selectedRoute}_${this.selectedDayType}.csv`
      console.log(`[INFO] CSV path updated to: ${this.csvPath}`)
    },
    async runDebuggingLogic() {
      console.log('[INFO] Running debugging logic...')
      try {
        const passengerData = await loadPassengerData(this.csvPath)
        const currentTime = new Date()

        this.results = await calculateBoardingProbability({
          routeId: this.selectedRoute,
          targetStation: this.targetStation,
          currentTime,
          passengerData,
          stationId: this.stationId,
          stationSequence: this.stationSequence
        })
        console.log('[INFO] Debugging logic completed successfully.')
      } catch (error) {
        console.error('[ERROR] Logic execution failed:', error)
      }
    }
  },
  mounted() {
    console.log('[INFO] Component mounted. Initializing...')
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
