import { ref } from 'vue'
import axios from 'axios'
import { debounce } from 'lodash'
import apiConfig from '@/utils/API/apiConfig'

export const startQuery = ref('')
export const endQuery = ref('')
export const startResults = ref([])
export const endResults = ref([])
export const sx = ref('')
export const sy = ref('')
export const ex = ref('')
export const ey = ref('')
export const map = ref(null)
export const isLoading = ref(false)
export const mapRef = ref(null)

// 지도 초기화 함수
export const initMap = () => {
  map.value = new window.naver.maps.Map(mapRef.value, {
    center: new window.naver.maps.LatLng(37.5666103, 126.9783882), // 서울 좌표
    zoom: 16
  })
}

// 좌표를 소수점으로 변환하는 함수
export const formatWGS84 = (coordinate) => {
  const result = (coordinate / 1e7).toFixed(20) // 소수점 20자리로 변환
  console.log(`변환된 좌표 값: ${result}`) // 변환된 값을 로그로 출력
  return result
}

// 위치 검색 함수 (debouncedSearchLocation에서 사용됨)
export const searchLocation = async (type) => {
  const query = type === 'start' ? startQuery.value : endQuery.value
  isLoading.value = true

  try {
    const response = await axios.get('http://localhost:5000/api/search', {
      params: { query }
    })

    if (type === 'start') {
      startResults.value = response.data.items
    } else {
      endResults.value = response.data.items
    }
  } catch (error) {
    console.error('API 요청 오류:', error)
  }

  isLoading.value = false
}

// 디바운스 적용된 검색 함수
export const debouncedSearchLocation = debounce((type) => {
  searchLocation(type)
}, 300) // 300ms 딜레이 적용

// 경로 검색 (오디세이 API)
export const searchRoute = async () => {
  console.log('경로 검색 시작')
  console.log('출발지 좌표:', { sx: sx.value, sy: sy.value })
  console.log('도착지 좌표:', { ex: ex.value, ey: ey.value })

  isLoading.value = true
  const apiKey = apiConfig.VUE_APP_ODSAY_API_KEY // 실제 Odisay API 키로 대체해야 함
  const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${sx.value}&SY=${sy.value}&EX=${ex.value}&EY=${ey.value}&apiKey=${apiKey}`

  try {
    const response = await axios.get(url)
    console.log('API 응답:', response.data)
    const pathInfo = response.data.result?.path?.[0]

    if (!pathInfo) {
      console.error('경로 정보를 찾을 수 없습니다.')
    } else {
      displayRoute(pathInfo)
    }
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error)
  }
  isLoading.value = false
}

// 지도에 경로 표시
export const displayRoute = (pathInfo) => {
  if (!map.value) return

  map.value.removeAllOverlays()

  addMarker(sx.value, sy.value, '출발지')
  addMarker(ex.value, ey.value, '도착지')

  pathInfo.subPath.forEach((subPath) => {
    if (subPath.trafficType === 1 || subPath.trafficType === 2) {
      const lineArray = subPath.passStopList.stations.map((station) => {
        return new window.naver.maps.LatLng(station.y, station.x)
      })

      new window.naver.maps.Polyline({
        map: map.value,
        path: lineArray,
        strokeWeight: 5,
        strokeColor: '#4a90e2',
        strokeOpacity: 0.8
      })
    }
  })

  const bounds = new window.naver.maps.LatLngBounds(
    new window.naver.maps.LatLng(sy.value, sx.value),
    new window.naver.maps.LatLng(ey.value, ex.value)
  )
  map.value.fitBounds(bounds)
}

// 지도에 마커 추가
export const addMarker = (x, y, title) => {
  new window.naver.maps.Marker({
    position: new window.naver.maps.LatLng(y, x),
    map: map.value,
    title,
    icon: {
      content: `<div class="custom-marker">${title}</div>`,
      anchor: new window.naver.maps.Point(15, 15)
    }
  })
}
