import axios from 'axios'
import apiConfig from '../../apiConfig'

// API 키 설정 (여기에 발급받은 API 키를 입력하세요)
const apiKey = apiConfig.VUE_APP_ODSAY_API_KEY // 여기에 실제 API 키 입력
const lang = 0 // 언어 설정: 0은 한국어
const output = 'json' // 출력 포맷: json 또는 xml
const mapObject = '0:0@12018:1:-1:-1' // 경로 검색 시 받은 mapObject 값 (실제 값으로 변경 필요)

async function fetchRouteGraphicData() {
  try {
    // API 호출
    const response = await axios.get('https://api.odsay.com/v1/api/loadLane', {
      params: {
        apiKey: apiKey,
        lang: lang,
        output: output,
        mapObject: mapObject
      }
    })

    // API 응답 데이터 처리
    const result = response.data.result

    // 경로 데이터 출력
    result.lane.forEach((lane) => {
      console.log(`클래스: ${lane.class}`) // 1 (버스 노선), 2 (지하철 노선)
      console.log(`타입: ${lane.type}`) // 버스 및 지하철 노선 타입
      lane.section.forEach((section) => {
        section.graphPos.forEach((pos) => {
          console.log(`x좌표: ${pos.x}, y좌표: ${pos.y}`) // 좌표 출력
        })
      })
    })

    // 경계값 출력
    console.log(`경계 왼쪽 좌표: ${result.boundary.left}`)
    console.log(`경계 위쪽 좌표: ${result.boundary.top}`)
    console.log(`경계 오른쪽 좌표: ${result.boundary.right}`)
    console.log(`경계 아래쪽 좌표: ${result.boundary.bottom}`)
  } catch (error) {
    // 에러 발생 시 처리
    console.error('노선 그래픽 데이터를 불러오는 중 오류 발생:', error)
  }
}

// 경로 그래픽 데이터 조회 함수 호출
fetchRouteGraphicData()
