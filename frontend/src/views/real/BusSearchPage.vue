<template>
  <div class="result-page">
    <div class="header">
      <h2>대중교통 경로 검색 결과</h2>
      <p>출발지: {{ fromLocation }}</p>
      <p>도착지: {{ toLocation }}</p>
    </div>
    <h3>길찾기 구간 중 현재 제공하는 광역버스 노선이에요.</h3>
    <div v-if="providedRouteExists" class="route-info">
      <ul>
        <li @click="selectBusRoute">버스 번호: 5005 ({{ directionText }})</li>
      </ul>
    </div>

    <div v-if="loading" class="loading-spinner">로딩 중...</div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import apiConfig from '@/utils/API/apiConfig'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const store = useStore()
    const router = useRouter()

    const fromLocation = store.state.departure.departure.name
    const toLocation = store.state.destination.destination.name
    const loading = ref(false)
    const providedRouteExists = ref(false)
    const busInfo = ref({
      busNo: '5005',
      direction: '',
      stationID: null,
      stationName: ''
    })
    const directionText = computed(() =>
      busInfo.value.direction === 'up' ? '상행' : '하행'
    )

    const searchTransitRoutes = async () => {
      loading.value = true
      try {
        const startX = store.state.departure.departure.coordinates?.x
        const startY = store.state.departure.departure.coordinates?.y
        const endX = store.state.destination.destination.coordinates?.x
        const endY = store.state.destination.destination.coordinates?.y

        if (!startX || !startY || !endX || !endY) {
          console.error('출발지와 도착지의 x, y 좌표가 설정되지 않았습니다.')
          alert('출발지와 도착지의 위치를 먼저 설정해주세요.')
          return
        }

        console.log('출발지와 도착지 좌표로 Odyssey API 호출 시작:', {
          startX,
          startY,
          endX,
          endY
        })

        const response = await axios.get(
          'https://api.odsay.com/v1/api/searchPubTransPathT',
          {
            params: {
              SX: startX,
              SY: startY,
              EX: endX,
              EY: endY,
              apiKey: apiConfig.odsayApiKey
            }
          }
        )

        const paths = response.data.result.path || []

        const filteredRoutes = paths.filter((route) =>
          route.subPath.some(
            (segment) =>
              segment.trafficType === 2 && segment.lane[0].busNo === '5005'
          )
        )

        if (filteredRoutes.length > 0) {
          providedRouteExists.value = true
          const optimalRoute = filteredRoutes.sort(
            (a, b) => a.info.transitCount - b.info.transitCount
          )[0]

          console.log('환승이 가장 적은 경로 선택:', optimalRoute)

          const first5005Segment = optimalRoute.subPath.find(
            (segment) =>
              segment.trafficType === 2 && segment.lane[0].busNo === '5005'
          )
          busInfo.value.stationID = first5005Segment.startID
          busInfo.value.stationName = first5005Segment.startName

          console.log(
            `5005번 탑승 정류장 이름: ${busInfo.value.stationName}, ID: ${busInfo.value.stationID}`
          )

          const stationDetailResponse = await axios.get(
            'https://api.odsay.com/v1/api/busLaneDetail',
            {
              params: {
                busID: first5005Segment.lane[0].busID,
                apiKey: apiConfig.odsayApiKey
              }
            }
          )

          const stations = stationDetailResponse.data.result.station || []
          const targetStation = stations.find(
            (station) => station.stationID === busInfo.value.stationID
          )

          busInfo.value.direction =
            targetStation.stationDirection === 2 ? 'up' : 'down'
          console.log(
            `선택된 정류장의 상행/하행 정보: ${directionText.value}, 정류장 이름: ${busInfo.value.stationName}`
          )
        } else {
          console.log('5005번이 포함된 경로가 없습니다.')
        }
      } catch (error) {
        console.error('API 호출 중 오류 발생:', error)
      } finally {
        loading.value = false
        console.log('API 호출이 완료되었습니다.')
      }
    }

    const selectBusRoute = () => {
      console.log('다음 페이지로 전달되는 정보:', {
        busNo: busInfo.value.busNo,
        direction: busInfo.value.direction,
        stationID: busInfo.value.stationID,
        stationName: busInfo.value.stationName,
        fromLocation: fromLocation.value,
        toLocation: toLocation.value,
        startX: store.state.departure.departure.coordinates?.x,
        startY: store.state.departure.departure.coordinates?.y,
        endX: store.state.destination.destination.coordinates?.x,
        endY: store.state.destination.destination.coordinates?.y,
        month: store.state.time.month,
        day: store.state.time.day,
        hour: store.state.time.hour,
        minute: store.state.time.minute
      })

      router.push({
        path: '/next-page',
        query: {
          busNo: busInfo.value.busNo,
          direction: busInfo.value.direction,
          stationID: busInfo.value.stationID,
          stationName: busInfo.value.stationName,
          fromLocation: fromLocation.value,
          toLocation: toLocation.value,
          startX: store.state.departure.departure.coordinates?.x,
          startY: store.state.departure.departure.coordinates?.y,
          endX: store.state.destination.destination.coordinates?.x,
          endY: store.state.destination.destination.coordinates?.y,
          month: store.state.time.month,
          day: store.state.time.day,
          hour: store.state.time.hour,
          minute: store.state.time.minute
        }
      })
    }

    onMounted(() => {
      searchTransitRoutes()
    })

    return {
      fromLocation,
      toLocation,
      loading,
      providedRouteExists,
      directionText,
      selectBusRoute
    }
  }
}
</script>

<style scoped>
.result-page {
  padding: 20px;
}
.route-info {
  background-color: #f0f0f0;
  padding: 10px;
  margin-bottom: 15px;
}
.loading-spinner {
  font-size: 18px;
  color: #555;
}
</style>
