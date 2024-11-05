<template>
  <div class="background">
    <div class="mobile-container">
      <header class="header">
        <img
          :src="require('@/assets/Icons/MainLogo.svg')"
          alt="Logo"
          style="margin-right: -170px"
        />

        <h1>만차 버스 길찾기</h1>
        <SlidingMenu />
      </header>
      <SearchFormComponent />
      <button
        class="search-button"
        :disabled="!canSearch"
        @click="searchRoutes"
        style="color: #625858"
      >
        길 찾기
      </button>

      <!-- 내 위치 다시 불러오기 버튼 -->
      <button class="location-button" @click="getLocation">
        내 위치 다시 불러오기
      </button>

      <!-- 네이버 지도 -->
      <div class="map-container" ref="mapContainer"></div>
      <Footer />
    </div>
  </div>
</template>

<script>
import SearchFormComponent from '@/components/layout/SearchFormComponent.vue'
import { mapState, mapActions } from 'vuex'
import SlidingMenu from '../SlidingMenu.vue'
import Footer from '../Footer.vue'
import MainLogo from '@/assets/Icons/MainLogo.svg'

export default {
  components: {
    SearchFormComponent,
    SlidingMenu,
    Footer
  },
  data() {
    return {
      location: {
        latitude: 37.51347, // 기본 위치 (서울)
        longitude: 127.041722
      }
    }
  },
  computed: {
    ...mapState('departure', {
      departureName: (state) => state.departure?.name || '출발지를 입력하세요',
      departureCoordinates: (state) => state.departure?.coordinates || {}
    }),
    ...mapState('destination', {
      destinationName: (state) =>
        state.destination?.name || '도착지를 입력하세요',
      destinationCoordinates: (state) => state.destination?.coordinates || {}
    }),
    ...mapState('time', {
      month: (state) => state.month,
      day: (state) => state.day,
      hour: (state) => state.hour,
      minute: (state) => state.minute
    }),
    canSearch() {
      return (
        this.departureName !== '출발지를 입력하세요' &&
        this.destinationName !== '도착지를 입력하세요' &&
        this.month &&
        this.day &&
        this.hour &&
        this.minute
      )
    }
  },
  methods: {
    ...mapActions('departure', ['updateDeparture']),
    ...mapActions('destination', ['updateDestination']),
    ...mapActions('time', ['updateTime']),
    searchRoutes() {
      console.log('출발지 좌표:', this.departureCoordinates)
      console.log('도착지 좌표:', this.destinationCoordinates)

      const { x: startX, y: startY } = this.departureCoordinates
      const { x: endX, y: endY } = this.destinationCoordinates

      if (!startX || !startY || !endX || !endY) {
        console.error('출발지와 도착지의 x, y 좌표가 설정되지 않았습니다.')
        alert('출발지와 도착지의 위치를 먼저 설정해주세요.')
        return
      }

      this.$router.push({
        path: '/bus-search',
        query: {
          startX,
          startY,
          endX,
          endY,
          month: this.$store.state.time.month,
          day: this.$store.state.time.day,
          hour: this.$store.state.time.hour,
          minute: this.$store.state.time.minute
        }
      })
    },
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.showPosition,
          this.showError
        )
      } else {
        alert('이 브라우저는 Geolocation을 지원하지 않습니다.')
        this.initMap() // Geolocation이 없을 때 기본 위치로 초기화
      }
    },
    showPosition(position) {
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
      this.initMap()
    },
    showError(error) {
      alert('위치를 불러오지 못했습니다. 기본 위치로 설정합니다.')
      this.initMap() // 오류 발생 시 기본 위치로 지도 초기화
    },
    initMap() {
      this.$nextTick(() => {
        const mapContainer = this.$refs.mapContainer

        if (mapContainer) {
          const map = new naver.maps.Map(mapContainer, {
            center: new naver.maps.LatLng(
              this.location.latitude,
              this.location.longitude
            ),
            zoom: 16,
            zoomControl: true, // 확대/축소 버튼 추가
            scaleControl: false,
            logoControl: false,
            mapDataControl: false,
            minZoom: 6
          })

          // 위치에 마커 추가
          new naver.maps.Marker({
            position: new naver.maps.LatLng(
              this.location.latitude,
              this.location.longitude
            ),
            map: map
          })
        } else {
          console.error('지도 컨테이너를 찾을 수 없습니다.')
        }
      })
    }
  },
  mounted() {
    this.getLocation() // 컴포넌트가 마운트되면 위치 요청
  }
}
</script>

<style scoped>
* {
  font-family: 'Pretendard', sans-serif;
}

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
  margin-bottom: 30px;
}

h1 {
  font-size: 17px;
  font-weight: bold;
  color: #333;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.search-button {
  width: 100%;
  padding: 14px;
  background-color: #e5c7c7;
  color: #625858;
  font-size: 16px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.search-button:hover:not(:disabled) {
  background-color: #d8b4b4;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-button:disabled {
  background-color: #ccc;
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

.location-button {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background-color: #f0f0f0;
  color: #444;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.map-container {
  width: 100%;
  height: 300px;
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
