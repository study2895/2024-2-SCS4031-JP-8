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
        <!-- 버스 위치 정보가 있을 때 표시 -->
        <div v-if="stop.busInfo" class="bus-details">
          <img src="@/assets/bus-icon.png" alt="버스 아이콘" class="bus-icon" />
          <p>차량번호: {{ stop.busInfo.plateNo }}</p>
          <p>차종: {{ getPlateType(stop.busInfo.plateType) }}</p>
          <p>
            빈자리:
            {{
              stop.busInfo.remainSeatCnt >= 0
                ? stop.busInfo.remainSeatCnt
                : '정보없음'
            }}
          </p>
        </div>
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
      busStops: [],
      localBusID: null
    }
  },
  methods: {
    getPlateType(type) {
      const types = [
        '정보없음',
        '소형승합차',
        '중형승합차',
        '대형승합차',
        '2층버스'
      ]
      return types[type] || '정보없음'
    }
  },
  async created() {
    try {
      // Step 1: Bus Route Search API - 5000a 검색
      console.log('버스 노선 검색 API 호출 시작')
      const routeResponse = await axios.get(
        'https://api.odsay.com/v1/api/searchBusLane',
        {
          params: {
            apiKey: process.env.VUE_APP_ODSAY_API_KEY, // .env 파일에서 API 키 가져오기
            busNo: '1004'
          }
        }
      )
      console.log('버스 노선 검색 API 결과:', routeResponse.data)

      const yonginBus = routeResponse.data.result.lane.find(
        (lane) => lane.busCityName === '김포'
      )
      this.localBusID = yonginBus.localBusID
      const { busID } = yonginBus
      console.log('선택된 용인 버스:', yonginBus)

      // Step 2: Bus Route Information API - 버스 상세정보 조회
      console.log('버스 상세정보 조회 API 호출 시작')
      const infoResponse = await axios.get(
        'https://api.odsay.com/v1/api/busLaneDetail',
        {
          params: {
            apiKey: process.env.VUE_APP_ODSAY_API_KEY, // .env 파일에서 API 키 가져오기
            busID
          }
        }
      )
      console.log('버스 상세정보 조회 API 결과:', infoResponse.data)
      const stops = infoResponse.data.result.station
      console.log('정류장 목록:', stops)

      this.busStops = stops.map((stop) => ({
        stationName: stop.stationName,
        stationSeq: stop.idx, // 정류장 순번 저장
        busInfo: null // 초기값
      }))

      // Step 3: 경기도 버스 위치 정보 API - 정류장 순번 맞춰 버스 정보 추가
      console.log('경기도 버스 위치 정보 API 호출 시작')
      const gyeonggiBusResponse = await axios.get(
        'http://apis.data.go.kr/6410000/buslocationservice/getBusLocationList',
        {
          params: {
            serviceKey:
              'EVTsGjdsoUlBtJTpdh%2FitgFJXzeeNK%2FBP4lN8my%2Bi9AaoLGNln1kqRcyVP7CVRY8GsiXkX%2BOMl2HviEvq6hlfQ%3D%3D',
            routeId: this.localBusID
          }
        }
      )
      console.log('경기도 버스 위치 정보 API 결과:', gyeonggiBusResponse.data)

      if (gyeonggiBusResponse.data.response?.msgBody?.busLocationList) {
        const busLocations =
          gyeonggiBusResponse.data.response.msgBody.busLocationList
        console.log('버스 위치 목록:', busLocations)

        busLocations.forEach((bus) => {
          const matchedStop = this.busStops.find(
            (stop) => stop.stationSeq === parseInt(bus.stationSeq)
          )
          if (matchedStop) {
            matchedStop.busInfo = {
              plateNo: bus.plateNo,
              plateType: bus.plateType,
              remainSeatCnt: bus.remainSeatCnt
            }
            console.log(
              `정류장 ${matchedStop.stationName}에 버스 위치 정보 추가됨:`,
              matchedStop.busInfo
            )
          }
        })
      } else {
        console.log('지원하지 않는 노선입니다.')
      }
    } catch (error) {
      console.error('API 호출 중 오류 발생:', error)
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
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.bus-icon {
  width: 20px;
  height: 20px;
  margin-left: 5px;
}
.bus-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
}
</style>
