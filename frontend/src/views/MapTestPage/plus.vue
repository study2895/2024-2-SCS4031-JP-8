<template>
  <div class="result-page">
    <div class="header">
      <h2>대중교통 경로 검색 결과</h2>
      <input type="text" v-model="fromLocation" placeholder="출발지" />
      <input type="text" v-model="toLocation" placeholder="도착지" />
    </div>

    <div class="filter-buttons">
      <button @click="filterByType('bus')">버스</button>
      <button @click="filterByType('subway')">지하철</button>
      <button @click="filterByType('busSubway')">버스+지하철</button>
      <button @click="resetFilter()">모든 경로</button>
    </div>

    <div class="sort-dropdown">
      <label for="sortCriteria">정렬 기준:</label>
      <select id="sortCriteria" v-model="sortCriteria" @change="sortRoutes">
        <option value="totalTime">최소 시간순</option>
        <option value="transitCount">최소 환승순</option>
        <option value="totalWalk">최소 도보순</option>
      </select>
    </div>

    <div v-if="loading" class="loading-spinner">로딩 중...</div>
    <div v-else class="route-list">
      <div
        v-for="(route, index) in filteredRoutes"
        :key="index"
        class="route-item"
      >
        <div class="route-header">
          <h3>총 소요 시간: {{ route.adjustedTotalTime }}분</h3>
          <p>총 요금: {{ route.info.payment }}원</p>
          <p>도보 거리: {{ route.info.totalWalk }}미터</p>
          <p>
            환승 횟수: 버스 {{ route.info.busTransitCount }}회, 지하철
            {{ route.info.subwayTransitCount }}회
          </p>
          <p>
            출발~도착 시간: {{ calculateTimeRange(route.adjustedTotalTime) }}
          </p>
        </div>

        <RouteBar :route="route" />

        <div class="route-details">
          <div
            v-for="(segment, idx) in route.subPath"
            :key="idx"
            class="segment"
          >
            <div v-if="segment.trafficType === 3" class="segment-info">
              <p>도보: {{ segment.distance }}미터</p>
            </div>

            <div v-else-if="segment.trafficType === 2" class="segment-info">
              <p>버스 번호: {{ segment.lane[0].busNo }}</p>
              <p>
                출발지: {{ segment.startName }} → 도착지: {{ segment.endName }}
              </p>
              <p>정류장 수: {{ segment.stationCount }}</p>
            </div>

            <div v-else-if="segment.trafficType === 1" class="segment-info">
              <p>지하철 노선: {{ segment.lane[0].name }}</p>
              <p>
                출발지: {{ segment.startName }} → 도착지: {{ segment.endName }}
              </p>
              <p>역 개수: {{ segment.stationCount }}</p>
            </div>
          </div>
        </div>

        <div class="arrival-info">
          <p>최종 도착지: {{ route.info.lastEndStation }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import apiConfig from '@/utils/API/apiConfig'
import RouteBar from './RouteBar.vue'

const fromLocation = ref('')
const toLocation = ref('')
const loading = ref(false)
const routes = ref([])
const filteredRoutes = ref([])
const sortCriteria = ref('totalTime')

// 실시간 도착 정보 API로부터 첫 번째 버스 도착 시간을 가져오는 함수
const fetchBusArrivalTime = async (stationID, busRouteID) => {
  try {
    const response = await axios.get(
      'https://api.odsay.com/v1/api/realtimeStation',
      {
        params: {
          lang: 1,
          stationID,
          routeIDs: busRouteID,
          apiKey: apiConfig.odsayApiKey
        }
      }
    )
    console.log('API response:', response.data) // API 응답 데이터 출력

    if (
      response.data &&
      response.data.result &&
      response.data.result.real &&
      response.data.result.real.length > 0
    ) {
      const arrivalSec = response.data.result.real[0]?.arrival1?.arrivalSec || 0
      return Math.floor(arrivalSec / 60) // 초를 분으로 변환
    } else {
      console.warn('실시간 버스 도착 정보가 없습니다.')
      return 0
    }
  } catch (error) {
    console.error('실시간 도착 정보 호출 오류:', error)
    return 0
  }
}

// 총 소요 시간을 실시간 도착 시간을 반영하여 계산하는 함수
const calculateAdjustedTotalTime = async (route) => {
  let adjustedTotalTime = route.info.totalTime

  if (route.info.busTransitCount > 0) {
    const firstBusSegment = route.subPath.find(
      (segment) => segment.trafficType === 2
    )
    if (firstBusSegment) {
      const busRouteID = firstBusSegment.lane[0].busID
      const stationID = firstBusSegment.startID
      const arrivalTimeInMinutes = await fetchBusArrivalTime(
        stationID,
        busRouteID
      )
      adjustedTotalTime += arrivalTimeInMinutes
    }
  }

  return adjustedTotalTime
}

// 경로 데이터 로드 후 실시간 도착 시간을 추가하여 새로운 경로 데이터 생성
const loadRoutesWithAdjustedTime = async () => {
  loading.value = true
  try {
    const response = await axios.get(
      'https://api.odsay.com/v1/api/searchPubTransPathT',
      {
        params: {
          SX: 126.926493082645,
          SY: 37.6134436427887,
          EX: 127.126936754911,
          EY: 37.5004198786564,
          apiKey: apiConfig.odsayApiKey
        }
      }
    )
    const rawRoutes = response.data.result?.path || []

    // 각 경로에 adjustedTotalTime 추가
    routes.value = await Promise.all(
      rawRoutes.map(async (route) => {
        const adjustedTime = await calculateAdjustedTotalTime(route)
        return {
          ...route,
          adjustedTotalTime: adjustedTime
        }
      })
    )
    filteredRoutes.value = routes.value
    sortRoutes()
  } catch (error) {
    console.error('API 호출 오류:', error)
  } finally {
    loading.value = false
  }
}

// 필터 및 정렬 로직
const filterByType = (type) => {
  if (type === 'bus') {
    filteredRoutes.value = routes.value.filter(
      (route) =>
        route.info.busTransitCount > 0 && route.info.subwayTransitCount === 0
    )
  } else if (type === 'subway') {
    filteredRoutes.value = routes.value.filter(
      (route) =>
        route.info.busTransitCount === 0 && route.info.subwayTransitCount > 0
    )
  } else if (type === 'busSubway') {
    filteredRoutes.value = routes.value.filter(
      (route) =>
        route.info.busTransitCount > 0 && route.info.subwayTransitCount > 0
    )
  }
  sortRoutes()
}

const sortRoutes = () => {
  if (sortCriteria.value === 'totalTime') {
    filteredRoutes.value.sort(
      (a, b) => a.adjustedTotalTime - b.adjustedTotalTime
    )
  } else if (sortCriteria.value === 'transitCount') {
    filteredRoutes.value.sort(
      (a, b) =>
        a.info.busTransitCount +
        a.info.subwayTransitCount -
        (b.info.busTransitCount + b.info.subwayTransitCount)
    )
  } else if (sortCriteria.value === 'totalWalk') {
    filteredRoutes.value.sort((a, b) => a.info.totalWalk - b.info.totalWalk)
  }
}

const resetFilter = () => {
  filteredRoutes.value = routes.value
  sortRoutes()
}

// 시간 포맷팅 함수
const formatTime = (date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`
}

// 출발 및 도착 시간 계산
const calculateTimeRange = (totalTime) => {
  const startTime = new Date()
  const endTime = new Date(startTime.getTime() + totalTime * 60000)
  return `${formatTime(startTime)} ~ ${formatTime(endTime)}`
}

// 마운트 시 실행
onMounted(() => {
  loadRoutesWithAdjustedTime()
})
</script>

<style scoped>
.result-page {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20px;
}

.filter-buttons {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.sort-dropdown {
  margin-bottom: 20px;
  text-align: center;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.route-item {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 10px;
}

.route-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.segment-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
}
</style>
