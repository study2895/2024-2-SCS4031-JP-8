<template>
  <div class="bus-info">
    <h1>
      {{ selectedBusRoute }}번 버스 도착 정보 ({{
        selectedDirection === 'up' ? '상행' : '하행'
      }})
    </h1>
    <div
      v-for="station in stationData"
      :key="station.stationID"
      class="station-info"
    >
      <p>정류장명: {{ station.stationName }}</p>
      <p>정류장 ID: {{ station.stationID }}</p>
      <p>정류장 순번: {{ station.idx }}</p>
      <p v-if="station.realtimeData">
        <strong>실시간 도착 정보:</strong>
        <span>도착 예정: {{ station.realtimeData.predictTime1 }}분 후</span>
        <span>빈자리 수: {{ station.realtimeData.remainSeatCnt1 }}</span>
      </p>
      <p v-else>
        <strong>예측 여석 정보:</strong> {{ station.predictedSeats }}
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import csvData from '@/path/to/your/csvFile' // CSV 파일 경로 설정
import { processStationData } from '@/path/to/your/externalLogic' // 외부 로직 파일 import

// 버스 노선 정보 사전 데이터
const busRouteData = {
  '5000A': {
    busID: 11151,
    localBusID: 228000388,
    busLocalBlID: 228000388,
    routeId: 228000388,
    region: '용인'
  },
  '5000B': {
    busID: 11011,
    localBusID: 228000174,
    busLocalBlID: 228000174,
    routeId: 228000174,
    region: '용인'
  },
  1112: {
    busID: 10052,
    localBusID: 234000016,
    busLocalBlID: 234000016,
    routeId: 234000016,
    region: '수원'
  },
  6001: {
    busID: 16017,
    localBusID: 233000131,
    busLocalBlID: 233000131,
    routeId: 233000131,
    region: '화성'
  }
}

export default {
  data() {
    return {
      stationData: [], // 정류장 정보를 저장할 배열
      selectedBusRoute: '5000B', // 예시로 설정된 버스 노선
      selectedHour: 18, // 임의로 설정된 시간
      selectedMinute: 25, // 임의로 설정된 분
      selectedDirection: 'up' // 상행(up) 또는 하행(down) 선택
    }
  },
  methods: {
    async fetchBusRouteDetails() {
      const busID = busRouteData[this.selectedBusRoute].busID // 사전 데이터에서 busID 가져오기
      console.log(`[INFO] Fetching bus route details for busID: ${busID}`)

      try {
        // Odyssey API를 통해 정류장 데이터를 가져옴
        const response = await axios.get(
          `https://api.odsay.com/v1/api/busLaneDetail`,
          {
            params: {
              apiKey: process.env.VUE_APP_ODSAY_API_KEY, // 발급받은 API 키 입력
              busID: busID,
              lang: 0,
              output: 'json'
            }
          }
        )

        console.log(
          `[INFO] Bus route details fetched successfully. Data:`,
          response.data
        )

        this.stationData = response.data.result.station.map((station) => {
          const predictedSeats = this.getCsvSeatPrediction(
            station.stationName,
            this.selectedHour
          )
          console.log(
            `[INFO] Station: ${station.stationName}, ID: ${station.stationID}, idx: ${station.idx}, Predicted Seats: ${predictedSeats}`
          )

          return {
            stationID: station.stationID,
            idx: station.idx,
            stationName: station.stationName,
            realtimeData: null,
            predictedSeats
          }
        })

        await this.fetchRealTimeData()

        // stationData를 외부 로직으로 넘김
        this.stationData.forEach((station) => {
          console.log(`[INFO] Sending station data to external logic:`, station)
          processStationData(
            station.stationID,
            station.idx,
            station.realtimeData || station.predictedSeats
          )
        })
      } catch (error) {
        console.error('[ERROR] Failed to fetch bus route details:', error)
      }
    },

    async fetchRealTimeData() {
      const routeId = busRouteData[this.selectedBusRoute].routeId // 사전 데이터에서 routeId 가져오기
      const now = new Date()
      console.log(
        `[INFO] Checking real-time data availability at ${now.getHours()}:${now.getMinutes()}`
      )

      if (
        now.getHours() === this.selectedHour &&
        now.getMinutes() === this.selectedMinute
      ) {
        console.log(`[INFO] Fetching real-time data for routeId: ${routeId}`)

        for (let station of this.stationData) {
          try {
            const response = await axios.get(
              'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem',
              {
                params: {
                  serviceKey: process.env.VUE_APP_ODSAY_API_KEY, // 발급받은 공공데이터포털 서비스 키
                  stationId: station.stationID,
                  routeId: routeId
                }
              }
            )

            const realTimeData = response.data.response.body.items.item[0]
            console.log(
              `[INFO] Real-time data fetched for station ID: ${station.stationID}`,
              realTimeData
            )

            // 첫 번째 차량의 도착 정보와 빈자리 수 저장
            station.realtimeData = {
              predictTime1: realTimeData.predictTime1,
              remainSeatCnt1: realTimeData.remainSeatCnt1
            }
          } catch (error) {
            console.error(
              `[ERROR] Failed to fetch real-time data for station ID: ${station.stationID}`,
              error
            )
          }
        }
      } else {
        console.log(
          `[INFO] Current time does not match selected time for real-time data.`
        )
      }
    },

    getCsvSeatPrediction(stationName, hour) {
      // CSV 파일에서 예측 데이터를 가져오는 함수 (상행/하행에 따라 다른 구간 선택)
      const stationRows = csvData.filter(
        (row) => row['정류장명'] === stationName
      )

      // 상행/하행에 따라 43열부터 끝까지(상행) 또는 1열부터 42열까지(하행) 구분
      const targetRows =
        this.selectedDirection === 'up'
          ? stationRows.slice(42) // 상행 구간 (43열부터)
          : stationRows.slice(0, 42) // 하행 구간 (1열부터 42열까지)

      console.log(
        `[INFO] CSV data loaded for station ${stationName}. Direction: ${this.selectedDirection}, Rows Count: ${targetRows.length}`
      )

      // 순번(idx 역할) 계산하여 외부 로직에 넘길 데이터로 저장
      return targetRows.map((row, index) => {
        const seatPrediction = row[`${hour}시`] || '데이터 없음'
        console.log(
          `[INFO] CSV Row ${index + 1}, Seat Prediction: ${seatPrediction}`
        )

        return {
          seatPrediction,
          idx: index + 1 // CSV 파일의 순번 (0부터 시작하므로 +1)
        }
      })
    }
  },
  async mounted() {
    console.log(`[INFO] Component mounted. Fetching bus route details...`)
    await this.fetchBusRouteDetails()
  }
}
</script>
