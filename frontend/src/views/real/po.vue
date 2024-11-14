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
import Papa from 'papaparse' // papaparse를 import
import { processStationData } from './externalLogic.js' // 외부 로직 파일 import

////////////////////
// 날짜 받아와서 요일로 바꾸고 요일에 따른 평일, 토요일, 일요일 구분해야하고
// 순번 정리
// 상행 하행 정리

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

// 정류장명에서 문장 부호와 공백을 제거하는 함수
function sanitizeStationName(stationName) {
  return stationName.replace(/[.,\s]/g, '')
}

export default {
  data() {
    return {
      stationData: [], // 정류장 정보를 저장할 배열
      selectedBusRoute: '5000B', // 예시로 설정된 버스 노선
      selectedHour: 18, // 임의로 설정된 시간
      selectedMinute: 25, // 임의로 설정된 분
      selectedDirection: 'up', // 상행(up) 또는 하행(down) 선택
      csvData: [] // CSV 데이터를 저장할 배열
    }
  },
  methods: {
    async loadCsvData() {
      console.log('[INFO] Loading CSV data...')
      return new Promise((resolve, reject) => {
        Papa.parse('/csv/sarima_predictions_all_stations_weekday.csv', {
          download: true,
          header: true,
          complete: (result) => {
            this.csvData = result.data
            console.log('[INFO] CSV 데이터가 로드되었습니다:', this.csvData)
            resolve()
          },
          error: (error) => {
            console.error('[ERROR] CSV 파일을 로드하는 중 오류 발생:', error)
            reject(error)
          }
        })
      })
    },
    async fetchBusRouteDetails() {
      const busID = busRouteData[this.selectedBusRoute].busID
      console.log(`[INFO] Fetching bus route details for busID: ${busID}`)

      try {
        const response = await axios.get(
          `https://api.odsay.com/v1/api/busLaneDetail`,
          {
            params: {
              apiKey: process.env.VUE_APP_ODSAY_API_KEY,
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

        this.stationData = response.data.result.station
          .filter((station) => station.nonstopStation === 0)
          .map((station) => {
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
      const routeId = busRouteData[this.selectedBusRoute].routeId
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
                  serviceKey:
                    'EVTsGjdsoUlBtJTpdh/itgFJXzeeNK/BP4lN8my+i9AaoLGNln1kqRcyVP7CVRY8GsiXkX+OMl2HviEvq6hlfQ==',
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
      const hourKey = `${hour}시` // 시간에 해당하는 컬럼명 생성
      const stationRows = this.csvData.filter(
        (row) =>
          row['정류장명'].replace(/\s+/g, '').replace(/[.()]/g, '') ===
          stationName.replace(/\s+/g, '').replace(/[.()]/g, '')
      )

      console.log('[DEBUG] Station Rows for', stationName, ':', stationRows) // 불러온 CSV 데이터 확인

      if (stationRows.length === 0) {
        console.warn(`[WARN] No data found for station: ${stationName}`)
        return '데이터 없음'
      }

      // 지정된 시간대 데이터를 추출
      const targetRows = stationRows.map((row) => row[hourKey])

      console.log('[DEBUG] Target Rows by Hour:', targetRows) // 시간대별로 추출된 데이터 확인

      const seatPrediction =
        targetRows[0] !== undefined ? targetRows[0] : '데이터 없음'
      console.log(
        `[INFO] Seat Prediction for ${stationName} at ${hour}시:`,
        seatPrediction
      )
      return seatPrediction
    }
  },
  async mounted() {
    console.log(`[INFO] Component mounted. Fetching bus route details...`)
    await this.loadCsvData()
    await this.fetchBusRouteDetails()
  }
}
</script>
