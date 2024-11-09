<template>
  <div>
    <section v-if="busInfo && busInfo.busNo" class="bus-info">
      <h2>{{ busInfo.busNo }}번 버스</h2>
      <p>기점: {{ busInfo.busStartPoint }}</p>
      <p>종점: {{ busInfo.busEndPoint }}</p>
      <p>첫차: {{ busInfo.busFirstTime }}</p>
      <p>막차: {{ busInfo.busLastTime }}</p>
      <p>평일 배차 간격: {{ busInfo.bus_Interval_Week }}분</p>
      <p>토요일 배차 간격: {{ busInfo.bus_Interval_Sat }}분</p>
      <p>일요일 배차 간격: {{ busInfo.bus_Interval_Sun }}분</p>
      <p>버스 회사: {{ busInfo.busCompanyNameKor }}</p>
    </section>

    <section v-if="busStops.length" class="bus-stops">
      <h3>정류장 목록</h3>
      <div v-for="(stop, index) in busStops" :key="index" class="bus-stop">
        <p>{{ stop.stationName }}</p>
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
    },
    parseXML(xmlData) {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlData, 'application/xml')
      const busLocationList = Array.from(
        xmlDoc.getElementsByTagName('busLocationList')
      )
      return busLocationList.map((bus) => ({
        stationId: bus.getElementsByTagName('stationId')[0].textContent,
        plateNo: bus.getElementsByTagName('plateNo')[0].textContent,
        plateType: bus.getElementsByTagName('plateType')[0].textContent,
        remainSeatCnt: bus.getElementsByTagName('remainSeatCnt')[0].textContent
      }))
    }
  },
  async created() {
    try {
      // Step 1: Bus Route Search API - 5000A 검색
      console.log('버스 노선 검색 API 호출 시작')
      const routeResponse = await axios.get(
        'https://api.odsay.com/v1/api/searchBusLane',
        {
          params: {
            apiKey: process.env.VUE_APP_ODSAY_API_KEY,
            busNo: '5000A'
          }
        }
      )
      console.log('버스 노선 검색 API 결과:', routeResponse.data)

      const yonginBus = routeResponse.data.result.lane.find(
        (lane) => lane.busCityName === '용인'
      )
      if (yonginBus) {
        this.localBusID = yonginBus.localBusID
        this.busInfo = {
          busNo: yonginBus.busNo,
          busStartPoint: yonginBus.startPoint,
          busEndPoint: yonginBus.endPoint,
          busFirstTime: yonginBus.firstTime,
          busLastTime: yonginBus.lastTime,
          bus_Interval_Week: yonginBus.bus_Interval_Week,
          bus_Interval_Sat: yonginBus.bus_Interval_Sat,
          bus_Interval_Sun: yonginBus.bus_Interval_Sun,
          busCompanyNameKor: yonginBus.busCompanyNameKor
        }
        console.log('선택된 용인 버스 정보:', this.busInfo)
      }

      // Step 2: Bus Route Information API - 정류장 목록 조회
      console.log('버스 상세정보 조회 API 호출 시작')
      const infoResponse = await axios.get(
        'https://api.odsay.com/v1/api/busLaneDetail',
        {
          params: {
            apiKey: process.env.VUE_APP_ODSAY_API_KEY,
            busID: yonginBus.busID
          }
        }
      )
      console.log('버스 상세정보 조회 API 결과:', infoResponse.data)
      const stops = infoResponse.data.result.station || []
      this.busStops = stops.map((stop) => ({
        stationName: stop.stationName,
        localStationID: stop.localStationID, // localStationID 저장
        stationId: stop.stationID, // stationId 저장
        busInfo: null
      }))
      console.log('정류장 목록:', this.busStops)

      // Step 3: Gyeonggi-do Bus Location Information API - 경기도 버스 위치 정보 조회
      console.log('경기도 버스 위치 정보 API 호출 시작')
      const gyeonggiBusResponse = await axios.get(
        'http://apis.data.go.kr/6410000/buslocationservice/getBusLocationList',
        {
          params: {
            serviceKey:
              'EVTsGjdsoUlBtJTpdh/itgFJXzeeNK/BP4lN8my+i9AaoLGNln1kqRcyVP7CVRY8GsiXkX+OMl2HviEvq6hlfQ==',
            routeId: this.localBusID
          }
        }
      )

      // DOMParser로 XML을 객체로 파싱
      const busLocations = this.parseXML(gyeonggiBusResponse.data)
      console.log('경기도 버스 위치 정보 (DOMParser 파싱 후):', busLocations)

      busLocations.forEach((bus) => {
        const matchedStop = this.busStops.find(
          (stop) => stop.localStationID === bus.stationId // localStationID와 stationId 매칭
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
