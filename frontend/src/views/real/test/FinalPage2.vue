<template>
  <div class="final-page-container">
    <h1>버스 승차 확률 계산 결과</h1>
    <p v-if="loading">결과를 계산 중입니다. 잠시만 기다려주세요...</p>
    <div v-if="results.length > 0">
      <h2>선별된 정류장</h2>
      <ul>
        <li v-for="(station, index) in results" :key="index">
          {{ station.name }} - 확률: {{ station.probability }}%
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { processFinalPageLogic } from '@/utils/finalLogic'
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      results: [], // 최종 결과 정류장 목록
      loading: true // 로딩 상태
    }
  },
  computed: {
    ...mapState('station', ['stationData']) // Vuex에서 정류장 데이터 가져오기
  },
  methods: {
    ...mapMutations('station', ['SET_FINAL_RESULTS']), // Vuex에 결과 저장
    async calculateResults() {
      try {
        // 파라미터 처리 및 로직 실행
        const { filteredStations } = await processFinalPageLogic(
          this.stationData
        )
        this.results = filteredStations

        // Vuex에 저장
        this.SET_FINAL_RESULTS(filteredStations)

        console.log('[INFO] 결과 계산 완료:', filteredStations)
      } catch (error) {
        console.error('[ERROR] 결과 계산 중 오류 발생:', error)
      } finally {
        this.loading = false
      }
    }
  },
  async mounted() {
    await this.calculateResults() // 페이지가 로드되면 로직 실행
  }
}
</script>

<style scoped>
.final-page-container {
  font-family: Arial, sans-serif;
  padding: 20px;
}
</style>
