<template>
  <div class="bus-info">
    <h1>{{ busNo }}번 버스 노선 상세 정보</h1>
    <div
      v-for="station in filteredStations"
      :key="station.stationID"
      class="station"
    >
      <p>정류장명: {{ station.stationName }}</p>
      <p>정류장 ID: {{ station.stationID }}</p>
      <p>정류장 순번: {{ station.idx }}</p>
    </div>
  </div>
</template>

<script>
import { fetchBusRouteDetails } from './busApi'
import { sanitizeStationName } from './stringsUtils'

export default {
  data() {
    return {
      busNo: null,
      direction: null,
      stationID: null,
      filteredStations: []
    }
  },
  async mounted() {
    // 이전 페이지에서 전달받은 쿼리 정보 가져오기
    const query = this.$route.query
    this.busNo = query.busNo
    this.direction = query.direction
    this.stationID = query.stationID

    try {
      // API 호출
      const busData = await fetchBusRouteDetails(this.busNo)

      // 상행/하행 필터링 및 순번 변환
      const directionCode = this.direction === 'up' ? 2 : 1
      const stations = busData.station
        .filter(
          (station) =>
            station.stationDirection === directionCode &&
            station.nonstopStation === 0
        )
        .map((station, index) => ({
          ...station,
          idx: index + 1 // 순번 변환
        }))

      // 현재 정류장 기준으로 5개 전 정류장까지 포함
      const currentIndex = stations.findIndex(
        (station) => station.stationID == this.stationID
      )
      this.filteredStations = stations.slice(
        Math.max(0, currentIndex - 5),
        currentIndex + 1
      )

      console.log('[INFO] 필터링된 정류장 데이터:', this.filteredStations)
    } catch (error) {
      console.error('[ERROR] 버스 노선 상세 조회 실패:', error)
    }
  }
}
</script>

<style scoped>
.bus-info {
  font-family: Arial, sans-serif;
  padding: 20px;
}
.station {
  margin-bottom: 10px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}
</style>
