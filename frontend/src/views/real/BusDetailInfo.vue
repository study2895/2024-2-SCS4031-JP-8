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
        <div v-if="stop.arrivalInfo" class="arrival-details">
          <img src="@/assets/bus-icon.png" alt="버스 아이콘" class="bus-icon" />
          <p>
            첫번째 차량 번호: {{ stop.arrivalInfo.plateNo1 }} ({{
              stop.arrivalInfo.locationNo1
            }}번째 전)
          </p>
          <p>
            첫번째 차량 도착 예정 시간: {{ stop.arrivalInfo.predictTime1 }}분 후
          </p>
          <p>첫번째 차량 빈자리 수: {{ stop.arrivalInfo.remainSeatCnt1 }}</p>
          <p>
            두번째 차량 번호: {{ stop.arrivalInfo.plateNo2 }} ({{
              stop.arrivalInfo.locationNo2
            }}번째 전)
          </p>
          <p>
            두번째 차량 도착 예정 시간: {{ stop.arrivalInfo.predictTime2 }}분 후
          </p>
          <p>두번째 차량 빈자리 수: {{ stop.arrivalInfo.remainSeatCnt2 }}</p>
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
    async fetchArrivalInfo(stop) {
      try {
        console.log(`정류소 ${stop.stationName}에 대한 도착 정보 조회 중...`)
        const arrivalResponse = await axios.get(
          'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem',
          {
            params: {
              serviceKey:
                'EVTsGjdsoUlBtJTpdh/itgFJXzeeNK/BP4lN8my+i9AaoLGNln1kqRcyVP7CVRY8GsiXkX+OMl2HviEvq6hlfQ==',
              routeId: this.localBusID,
              stationId: stop.localStationID
            }
          }
        )
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(arrivalResponse.data, 'text/xml')

        const resultCode =
          xmlDoc.getElementsByTagName('resultCode')[0].textContent
        if (resultCode === '0') {
          const busArrivalItem =
            xmlDoc.getElementsByTagName('busArrivalItem')[0]
          stop.arrivalInfo = {
            locationNo1:
              busArrivalItem.getElementsByTagName('locationNo1')[0].textContent,
            locationNo2:
              busArrivalItem.getElementsByTagName('locationNo2')[0].textContent,
            plateNo1:
              busArrivalItem.getElementsByTagName('plateNo1')[0].textContent,
            plateNo2:
              busArrivalItem.getElementsByTagName('plateNo2')[0].textContent,
            predictTime1:
              busArrivalItem.getElementsByTagName('predictTime1')[0]
                .textContent,
            predictTime2:
              busArrivalItem.getElementsByTagName('predictTime2')[0]
                .textContent,
            remainSeatCnt1:
              busArrivalItem.getElementsByTagName('remainSeatCnt1')[0]
                .textContent,
            remainSeatCnt2:
              busArrivalItem.getElementsByTagName('remainSeatCnt2')[0]
                .textContent
          }
          console.log(
            `정류소 ${stop.stationName}에 도착 정보 추가됨:`,
            stop.arrivalInfo
          )
        } else {
          console.log(`정류소 ${stop.stationName}에 도착 정보가 없습니다.`)
          stop.arrivalInfo = null
        }
      } catch (error) {
        console.error(
          `도착 정보 조회 중 오류 발생 (${stop.stationName}):`,
          error
        )
      }
    },
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
      this.localBusID = yonginBus.localBusID
      const { busID } = yonginBus
      console.log('선택된 용인 버스:', yonginBus)

      console.log('버스 상세정보 조회 API 호출 시작')
      const infoResponse = await axios.get(
        'https://api.odsay.com/v1/api/busLaneDetail',
        {
          params: {
            apiKey: process.env.VUE_APP_ODSAY_API_KEY,
            busID
          }
        }
      )
      console.log('버스 상세정보 조회 API 결과:', infoResponse.data)

      this.busStops = infoResponse.data.result.station.map((stop) => ({
        stationName: stop.stationName,
        stationSeq: stop.idx,
        localStationID: stop.localStationID,
        arrivalInfo: null
      }))

      console.log('각 정류소에 대한 도착 정보 조회 시작')
      for (const stop of this.busStops) {
        await this.fetchArrivalInfo(stop)
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
.arrival-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
}
</style>
