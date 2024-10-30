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
import { ref, onMounted } from 'vue'
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

    const directionText = (direction) => (direction === 'up' ? '상행' : '하행')

    // 버스 번호별 시간 조건을 확인
    const checkTimeRange = (busNo) => {
      const hour = parseInt(store.state.time.hour, 10)
      const minute = parseInt(store.state.time.minute, 10)
      const currentTime = hour * 60 + minute

      if (busNo === '5000') {
        return true // 5000번은 모든 시간대 표시
      } else if (busNo === '5000A') {
        return currentTime >= 300 && currentTime < 900 // 5:00 - 15:00
      } else if (busNo === '5000B') {
        return (
          (currentTime >= 725 && currentTime < 1440) ||
          (currentTime >= 0 && currentTime < 180)
        ) // 12:05 - 23:59, 0:00 - 3:00
      }
      return false
    }

    const searchTransitRoutes = async () => {
      loading.value = true
      try {
        const startX = store.state.departure.departure.coordinates?.x
        const startY = store.state.departure.departure.coordinates?.y
        const endX = store.state.destination.destination.coordinates?.x
        const endY = store.state.destination.destination.coordinates?.y

        if (!startX || !startY || !endX || !endY) {
          alert('출발지와 도착지의 위치를 먼저 설정해주세요.')
          return
        }

        console.log('API 호출 시작:', { startX, startY, endX, endY })
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
        const allRoutes = []

        // 전체 노선을 순회하여 버스 번호를 확인하고 시간대 조건을 체크
        paths.forEach((route) => {
          route.subPath.forEach((segment) => {
            if (segment.trafficType === 2) {
              segment.lane.forEach((lane) => {
                const busNo = lane.busNo
                if (routeOptions.includes(busNo)) {
                  console.log(
                    `버스 번호 ${busNo}가 발견됨. 시간 조건 확인 중...`
                  )

                  // 시간 조건에 맞는 경우만 추가
                  if (checkTimeRange(busNo)) {
                    console.log(
                      `조건에 맞는 버스 번호 - ${busNo}, 상행/하행 확인 중`
                    )
                    allRoutes.push({
                      busNo: busNo,
                      directionText: directionText(segment.direction),
                      stationID: segment.startID,
                      stationName: segment.startName
                    })
                  }
                }
              })
            }
          })
        })

        filteredRoutes.value = allRoutes
        providedRouteExists.value = allRoutes.length > 0
        console.log('조건에 맞는 모든 노선:', filteredRoutes.value)
      } catch (error) {
        console.error('API 호출 중 오류 발생:', error)
      } finally {
        loading.value = false
      }
    }

    const selectBusRoute = (route) => {
      router.push({
        path: '/next-page',
        query: {
          busNo: route.busNo,
          direction: route.directionText,
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
