<template>
  <div>
    <section class="bus-info">
      <h2>{{ busInfo.busNo }}번 버스</h2>
      <p>기점: {{ busInfo.busStartPoint }}</p>
      <p>종점: {{ busInfo.busEndPoint }}</p>
      <p>첫차: {{ busInfo.busFirstTime }}</p>
      <p>막차: {{ busInfo.busLastTime }}</p>
      <p>배차 간격: {{ busInfo.busInterval }}분</p>
    </section>

    <section class="bus-stops">
      <h3>정류장 목록</h3>
      <div v-for="(stop, index) in busStops" :key="index" class="bus-stop">
        <p>{{ stop.stationName }}</p>
        <span v-if="stop.arrivalInfo">도착 예정: {{ stop.arrivalInfo }}초</span>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      busInfo: {},
      busStops: []
    }
  },
  async created() {
    try {
      // Step 1: Bus Route Search API - 5000a 검색
      const routeResponse = await axios.get(
        'https://api.odsay.com/v1/api/searchBusLane',
        {
          params: {
            apiKey: 'x50yOL3HODnuPAvX0iFSRA',
            busNo: '5000a'
          }
        }
      )
      const yonginBus = routeResponse.data.result.lane.find(
        (lane) => lane.busCityName === '용인'
      )
      const { busID } = yonginBus

      // Step 2: Bus Route Information API - 버스 상세정보 조회
      const infoResponse = await axios.get(
        'https://api.odsay.com/v1/api/busLaneDetail',
        {
          params: {
            apiKey: 'x50yOL3HODnuPAvX0iFSRA',
            busID
          }
        }
      )
      this.busInfo = infoResponse.data.result

      // Step 3: 정류장 목록을 기본으로 나열하고 실시간 도착 정보가 있으면 추가
      const stops = infoResponse.data.result.station
      const realTimePromises = stops.map(async (stop) => {
        try {
          const realTimeResponse = await axios.get(
            'https://api.odsay.com/v1/api/realtimeStation',
            {
              params: {
                apiKey: 'x50yOL3HODnuPAvX0iFSRA',
                stationID: stop.stationID
              }
            }
          )

          const arrivalInfo =
            realTimeResponse.data.result.real[0]?.arrival1?.arrivalSec || null
          return {
            stationName: stop.stationName,
            arrivalInfo
          }
        } catch {
          // 실시간 정보가 없을 경우 arrivalInfo는 null로 설정
          return {
            stationName: stop.stationName,
            arrivalInfo: null
          }
        }
      })

      this.busStops = await Promise.all(realTimePromises)
    } catch (error) {
      console.error(error)
    }
  }
}
</script>

<style scoped>
.bus-info {
  /* 스타일 추가 */
}
.bus-stops {
  /* 스타일 추가 */
}
.bus-stop {
  border-bottom: 1px solid #ddd;
  padding: 8px 0;
}
</style>
