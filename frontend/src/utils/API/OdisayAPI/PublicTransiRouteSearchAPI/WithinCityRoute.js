import axios from 'axios'
import apiConfig from '../../apiConfig'

// API 호출 함수
const fetchTransitRouteData = async (startX, startY, endX, endY) => {
  try {
    const apiKey = apiConfig.VUE_APP_ODSAY_API_KEY // 실제 API 키로 대체하세요
    const url = 'https://api.odsay.com/v1/api/searchPubTransPathT'

    // 요청 파라미터 설정
    const params = {
      apiKey: apiKey,
      SX: startX, // 출발지 X 좌표 (경도)
      SY: startY, // 출발지 Y 좌표 (위도)
      EX: endX, // 도착지 X 좌표 (경도)
      EY: endY, // 도착지 Y 좌표 (위도)
      lang: 0, // 결과 언어 선택 (0: 국문)
      output: 'json', // 결과 형식 (json 또는 xml)
      OPT: 0, // 경로 검색 정렬 방식 (0: 추천 경로)
      SearchType: 0, // 도시간/도시내 검색 선택 (0: 도시내)
      SearchPathType: 0 // 경로 수단 지정 (0: 모두)
    }

    // API 요청
    const response = await axios.get(url, { params })

    // 데이터 가져오기
    const result = response.data.result

    if (!result) {
      throw new Error('경로 데이터를 불러오지 못했습니다.')
    }

    // 모든 필수 데이터 출력
    console.log('Search Type:', result.searchType) // 0: 도시내, 1: 도시간 직통, 2: 도시간 환승
    console.log('총 소요 시간:', result.path[0].info.totalTime) // 총 소요 시간
    console.log('총 요금:', result.path[0].info.payment) // 총 요금
    console.log('버스 환승 횟수:', result.path[0].info.busTransitCount) // 버스 환승 횟수
    console.log('지하철 환승 횟수:', result.path[0].info.subwayTransitCount) // 지하철 환승 횟수
    console.log('총 도보 거리:', result.path[0].info.totalWalk) // 총 도보 거리
    console.log('경로 거리:', result.path[0].info.trafficDistance) // 총 경로 거리 (도보 제외)

    // 각 경로의 세부 사항
    result.path[0].subPath.forEach((subPath, index) => {
      console.log(`경로 ${index + 1}:`)
      console.log('이동 수단 종류:', subPath.trafficType) // 1: 지하철, 2: 버스, 3: 도보
      if (subPath.trafficType === 1) {
        console.log('지하철 노선:', subPath.lane[0].name) // 지하철 노선명
      } else if (subPath.trafficType === 2) {
        console.log('버스 번호:', subPath.lane[0].busNo) // 버스 번호
      }
      console.log('출발지:', subPath.startName) // 출발 정류장/역명
      console.log('도착지:', subPath.endName) // 도착 정류장/역명
      console.log('정류장/역 개수:', subPath.stationCount) // 경유 정류장/역 개수
      console.log('이동 거리:', subPath.distance) // 이동 거리
    })
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error)
  }
}

// 예시 호출 (서울 좌표)
fetchTransitRouteData(
  126.926493082645,
  37.6134436427887,
  127.126936754911,
  37.5004198786564
)
