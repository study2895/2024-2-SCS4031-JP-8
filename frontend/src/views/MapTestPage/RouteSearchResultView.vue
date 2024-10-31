<template>
  <div class="result-page">
    <!-- <div class="header">
      <h2>대중교통 경로 검색 결과</h2>
      <input type="text" v-model="fromLocation" placeholder="출발지" />
      <input type="text" v-model="toLocation" placeholder="도착지" />
    </div> -->

    <div class="filter-buttons">
      <button @click="filterByType('bus')">버스</button>
      <button @click="filterByType('subway')">지하철</button>
      <button @click="filterByType('busSubway')">버스+지하철</button>
      <button @click="resetFilter()">모든 경로</button>
    </div>

    <!-- 정렬 드롭다운 메뉴 -->
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
          <h3>총 소요 시간: {{ route.info.totalTime }}분</h3>
          <p>총 요금: {{ route.info.payment }}원</p>
          <p>도보 거리: {{ route.info.totalWalk }}미터</p>
          <p>
            환승 횟수: 버스 {{ route.info.busTransitCount }}회, 지하철
            {{ route.info.subwayTransitCount }}회
          </p>
          <p>출발~도착 시간: {{ calculateTimeRange(route.info.totalTime) }}</p>
        </div>

        <!-- RouteBar 컴포넌트에 전체 경로를 전달 -->
        <RouteBar :route="route" />

        <div class="route-details">
          <div
            v-for="(segment, idx) in route.subPath"
            :key="idx"
            class="segment"
          >
            <!-- 도보 정보 -->
            <div v-if="segment.trafficType === 3" class="segment-info">
              <p>도보: {{ segment.distance }}미터</p>
            </div>

            <!-- 버스 정보 -->
            <div v-else-if="segment.trafficType === 2" class="segment-info">
              <p>버스 번호: {{ segment.lane[0].busNo }}</p>
              <p>
                출발지: {{ segment.startName }} → 도착지: {{ segment.endName }}
              </p>
              <p>정류장 수: {{ segment.stationCount }}</p>
            </div>

            <!-- 지하철 정보 -->
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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import apiConfig from '@/utils/API/apiConfig'
import RouteBar from './RouteBar.vue'

const fromLocation = ref('')
const toLocation = ref('')
const loading = ref(false)
const routes = ref([])
const filteredRoutes = ref([])
const sortCriteria = ref('totalTime')

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

// 대중교통 경로 검색
const searchTransitRoutes = async () => {
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
    console.log('API Response Data:', response.data.result)
    routes.value = response.data.result?.path || []
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
    filteredRoutes.value.sort((a, b) => a.info.totalTime - b.info.totalTime)
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

onMounted(() => {
  searchTransitRoutes()
})
</script>

<style scoped>
.result-page {
  padding: 20px;
  max-width: 425px; /* 425px 이하에서는 화면 너비를 채움 */
  margin: 0 auto;
  background-color: #ffffff; /* 중앙 모바일 영역 흰색 */
}

body {
  background-color: #eaeaea; /* 425px 바깥 여백 부분 회색 */
  display: flex;
  justify-content: center;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: center;
  padding-bottom: 20px;
}

.header h2 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.filter-buttons {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  gap: 5px;
}

.filter-buttons button {
  flex: 1;
  padding: 10px;
  font-size: 14px;
  background-color: #e0e0e0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.sort-dropdown {
  margin-bottom: 20px;
  text-align: center;
}

.sort-dropdown label {
  font-size: 14px;
  color: #333;
}

.sort-dropdown select {
  margin-left: 10px;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #888;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.route-item {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.route-header {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.route-header h3 {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.route-header p {
  font-size: 14px;
  color: #555;
}

.segment-info {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  font-size: 14px;
}

.arrival-info {
  margin-top: 10px;
  font-size: 14px;
  color: #555;
  font-weight: bold;
  text-align: center;
}
</style>
