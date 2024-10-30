<template>
  <div class="background">
    <div class="mobile-container">
      <header class="header">
        <h2>대중교통 경로 검색 결과</h2>
        <p>출발지: {{ fromLocation }}</p>
        <p>도착지: {{ toLocation }}</p>
      </header>
      <h3 class="highlight-text">
        길찾기 구간 중 현재 제공하는 광역버스 노선이에요.
      </h3>
      <div v-if="providedRouteExists" class="route-info">
        <ul>
          <li
            v-for="route in filteredRoutes"
            :key="`${route.busNo}-${route.stationID}`"
            @click="selectBusRoute(route)"
          >
            버스 번호: {{ route.busNo }} ({{ route.directionText }})
          </li>
        </ul>
      </div>
      <div v-if="loading" class="loading-spinner">로딩 중...</div>
    </div>
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
    const filteredRoutes = ref([])

    const time = {
      hour: store.state.time.hour,
      minute: store.state.time.minute
    }

    const directionText = (direction) => (direction === 'up' ? '상행' : '하행')

    const checkTimeRange = (busNo) => {
      const currentTime = time.hour * 60 + time.minute
      if (busNo === '5000A') {
        return currentTime >= 300 && currentTime < 900 // 오전 5시~오후 3시
      } else if (busNo === '5000B') {
        return (currentTime >= 725 && currentTime < 1440) || currentTime < 180 // 오후 12시 05분~자정 및 자정~새벽 3시
      }
      return true
    }

    const searchTransitRoutes = async () => {
      loading.value = true
      console.log('API 호출 시작: 출발지와 도착지 좌표 확인')
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

        console.log('Odyssey API 호출 중:', { startX, startY, endX, endY })

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
        const routeOptions = ['5000', '5000A', '5000B']
        console.log('경로 결과를 가져왔습니다:', paths)

        const allRoutes = paths.flatMap((route) =>
          route.subPath
            .filter(
              (segment) =>
                segment.trafficType === 2 &&
                routeOptions.includes(segment.lane[0].busNo) &&
                checkTimeRange(segment.lane[0].busNo)
            )
            .map((segment) => {
              console.log(
                `조건을 만족하는 경로 발견: 버스 번호 - ${segment.lane[0].busNo}`
              )
              return {
                busNo: segment.lane[0].busNo,
                directionText: directionText(segment.direction),
                stationID: segment.startID,
                stationName: segment.startName
              }
            })
        )

        filteredRoutes.value = allRoutes
        providedRouteExists.value = allRoutes.length > 0
        console.log('조건에 맞는 모든 노선:', filteredRoutes.value)
      } catch (error) {
        console.error('API 호출 중 오류 발생:', error)
      } finally {
        loading.value = false
        console.log('API 호출 완료')
      }
    }

    const selectBusRoute = (route) => {
      console.log('다음 페이지로 전달되는 정보:', {
        busNo: route.busNo,
        direction: route.direction,
        stationID: route.stationID,
        stationName: route.stationName,
        fromLocation,
        toLocation,
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
          busNo: route.busNo,
          direction: route.direction,
          stationID: route.stationID,
          stationName: route.stationName,
          fromLocation,
          toLocation,
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
      filteredRoutes,
      selectBusRoute
    }
  }
}
</script>

<style scoped>
.background {
  background-color: #eaeaea;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.mobile-container {
  width: 100%;
  max-width: 425px;
  margin: 0 auto;
  padding: 25px;
  background-color: white;
  height: 100vh;
  overflow-y: auto;
}
.header {
  text-align: center;
  margin-bottom: 15px;
}
h2 {
  font-size: 18px;
  font-weight: bold;
  color: #625858;
}
.highlight-text {
  font-size: 16px;
  font-weight: bold;
  color: #e5c7c7;
  margin-top: 20px;
  text-align: center;
}
.route-info {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  cursor: pointer;
}
.route-info ul {
  list-style: none;
  padding: 0;
}
.route-info li {
  font-size: 16px;
  color: #625858;
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
  background-color: #eaeaea;
  text-align: center;
}
.loading-spinner {
  font-size: 18px;
  color: #555;
  text-align: center;
  margin-top: 20px;
}
</style>
