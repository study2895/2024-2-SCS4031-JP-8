import axios from 'axios'
import apiConfig from '../../apiConfig'

// API 호출 함수 (도시간 길찾기)
const fetchIntercityRouteData = async (startX, startY, endX, endY) => {
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
      SearchType: 1, // 도시간 검색 설정
      OPT: 0 // 경로 검색 정렬 방식 (0: 추천 경로)
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
    console.log('버스 결과 개수:', result.busCount) // 고속/시외버스 결과 개수
    console.log('열차 결과 개수:', result.trainCount) // 열차 결과 개수
    console.log('항공 결과 개수:', result.airCount) // 항공 결과 개수
    console.log('복합 이용 결과 개수:', result.mixedCount) // 복합 이용 결과 개수

    // 각 경로의 세부 사항
    result.path.forEach((path, index) => {
      console.log(`경로 ${index + 1}:`)
      console.log('총 소요 시간:', path.info.totalTime) // 총 소요 시간
      console.log('총 요금:', path.info.totalPayment) // 총 요금
      console.log('이용 시외교통 수:', path.info.transitCount) // 환승 횟수
      console.log('출발지:', path.info.firstStartStation) // 최초 출발지
      console.log('도착지:', path.info.lastEndStation) // 최종 도착지

      path.subPath.forEach((subPath, idx) => {
        console.log(`  구간 ${idx + 1}:`)
        console.log('이동 수단 종류:', subPath.trafficType) // 4: 열차, 5: 고속버스, 6: 시외버스, 7: 항공
        if (subPath.trafficType === 4) {
          console.log('열차 종류:', subPath.trainType) // KTX, 새마을, 무궁화 등
        } else if (subPath.trafficType === 5) {
          console.log('고속버스/시외버스:', subPath.lane[0].busNo) // 버스 번호
        }
        console.log('출발지:', subPath.startName) // 출발 역/터미널
        console.log('도착지:', subPath.endName) // 도착 역/터미널
        console.log('이동 거리:', subPath.distance) // 이동 거리
        console.log('이동 시간:', subPath.sectionTime) // 이동 시간
        console.log('요금:', subPath.payment) // 해당 구간 요금
      })
    })
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error)
  }
}

// 예시 호출 (서울 좌표 -> 부산 좌표)
fetchIntercityRouteData(126.926493082645, 37.6134436427887, 129.0756, 35.1796)
