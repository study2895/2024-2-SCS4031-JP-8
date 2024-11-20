<template>
  <div class="debugging-container">
    <h1>버스 승차 확률 테스트</h1>
    <div>
      <p>선택된 노선: {{ selectedRoute }}</p>
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
import { calculateBoardingProbability, loadPassengerData } from './debugging.js'

export default {
  data() {
    return {
      selectedRoute: '5000B', // 테스트할 버스 노선 ID
      targetStation: 44, // 목표 정류장 번호
      results: [] // 결과 저장
    }
  },
  methods: {
    runDebuggingLogic() {
      try {
        console.log('[INFO] Debugging logic 실행 중...')
        const currentTime = new Date()

        // 승차 인원 데이터 불러오기
        const passengerData = loadPassengerData('int_passenger_flow.csv')

        // 승차 확률 계산
        const probabilities = calculateBoardingProbability(
          this.selectedRoute,
          this.targetStation,
          currentTime,
          passengerData
        )

        // 결과 저장 및 출력
        this.results = probabilities.map(([station, prob]) => ({
          station,
          probability: (prob * 100).toFixed(2)
        }))

        console.log('[INFO] Debugging logic 결과:', this.results)
      } catch (error) {
        console.error('[ERROR] Debugging logic 실행 중 오류 발생:', error)
      }
    }
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
