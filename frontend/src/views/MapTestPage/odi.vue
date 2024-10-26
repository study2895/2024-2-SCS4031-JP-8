<template>
  <div>
    <input v-model="sx" placeholder="출발지 X 좌표" />
    <input v-model="sy" placeholder="출발지 Y 좌표" />
    <input v-model="ex" placeholder="도착지 X 좌표" />
    <input v-model="ey" placeholder="도착지 Y 좌표" />
    <button @click="searchRoute">길찾기</button>

    <div id="map" style="width: 100%; height: 400px"></div>
  </div>
</template>

<script>
import apiConfig from '@/utils/API/apiConfig'
import axios from 'axios'
export default {
  data() {
    return {
      sx: '', // 출발지 X 좌표
      sy: '', // 출발지 Y 좌표
      ex: '', // 도착지 X 좌표
      ey: '', // 도착지 Y 좌표
      map: null // 네이버 지도 객체
    }
  },
  mounted() {
    this.initMap() // 컴포넌트가 마운트될 때 네이버 지도 초기화
  },
  methods: {
    initMap() {
      this.map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(37.3595704, 127.105399),
        zoom: 10
      })
    },
    searchRoute() {
      const apiKey = apiConfig.VUE_APP_ODSAY_API_KEY // ODSAY API 키
      const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${this.sx}&SY=${this.sy}&EX=${this.ex}&EY=${this.ey}&apiKey=${apiKey}`

      axios
        .get(url)
        .then((response) => {
          const pathInfo = response.data.result.path[0]
          this.displayRoute(pathInfo)
        })
        .catch((error) => {
          console.error('API 요청 오류:', error)
        })
    },
    displayRoute(pathInfo) {
      // 출발지와 도착지 마커 추가
      this.addMarker(this.sx, this.sy, '출발지')
      this.addMarker(this.ex, this.ey, '도착지')

      // 경로를 Polyline으로 지도에 표시
      pathInfo.subPath.forEach((subPath) => {
        if (subPath.trafficType === 1 || subPath.trafficType === 2) {
          const lineArray = subPath.passStopList.stations.map((station) => {
            return new naver.maps.LatLng(station.y, station.x)
          })

          const polyline = new naver.maps.Polyline({
            map: this.map,
            path: lineArray,
            strokeWeight: 3,
            strokeColor: '#003499' // 노선 색상
          })
        }
      })
    },
    addMarker(x, y, title) {
      new naver.maps.Marker({
        position: new naver.maps.LatLng(y, x),
        map: this.map,
        title
      })
    }
  }
}
</script>

<style>
input {
  margin: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 8px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #45a049;
}
</style>
