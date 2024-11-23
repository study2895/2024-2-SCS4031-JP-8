import axios from 'axios'
import { calculatePoissonProbability } from '@/utils/poisson' // 포아송 관련 계산 함수
import { parse } from 'csv-parse/sync' // CSV 파싱

// 최종 페이지 로직 처리 함수
export async function processFinalPageLogic(stationData) {
  const { route, direction, stations, dateTime } = stationData

  // 1. 공공데이터포털 API 호출: 첫 번째 정류장의 실시간 정보 가져오기
  const realTimeData = await fetchRealTimeBusData(route, stations[0].id)

  // 2. 승차 인원 데이터 로드
  const passengerData = await loadPassengerData('/csv/int_passenger_flow.csv')

  // 3. 포아송 확률 계산
  const probabilities = calculatePoissonProbability({
    passengerData,
    timeSlot: `${dateTime.hour}시`,
    realTimeData,
    stations
  })

  // 4. 60% 이상의 정류장 필터링
  const filteredStations = probabilities
    .filter((station) => station.probability > 60)
    .map((station) => ({
      name: station.name,
      probability: station.probability
    }))

  return { filteredStations }
}

// 공공데이터포털 실시간 버스 정보 호출 함수
async function fetchRealTimeBusData(routeId, stationId) {
  const serviceKey =
    'EVTsGjdsoUlBtJTpdh/itgFJXzeeNK/BP4lN8my+i9AaoLGNln1kqRcyVP7CVRY8GsiXkX+OMl2HviEvq6hlfQ=='

  try {
    const response = await axios.get(
      'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalItem',
      {
        params: {
          serviceKey,
          stationId,
          routeId
        }
      }
    )
    const { item } = response.data?.response?.body?.items || {}
    return {
      firstBus: {
        predictTime: parseInt(item?.predictTime1, 10),
        remainSeats: parseInt(item?.remainSeatCnt1, 10) || 0
      },
      secondBus: {
        predictTime: parseInt(item?.predictTime2, 10),
        remainSeats: parseInt(item?.remainSeatCnt2, 10) || 0
      }
    }
  } catch (error) {
    console.error('[ERROR] 공공데이터포털 API 호출 실패:', error)
    return { firstBus: { predictTime: 0, remainSeats: 60 } } // 기본값 반환
  }
}

// 승차 인원 CSV 데이터 로드
async function loadPassengerData(filePath) {
  const response = await fetch(filePath)
  const csvData = await response.text()
  return parse(csvData, { columns: true })
}
