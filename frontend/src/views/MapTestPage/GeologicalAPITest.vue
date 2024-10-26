<template>
  <div>
    <h2>내 위치 찾기</h2>
    <button @click="getLocation">위치 가져오기</button>
    <p v-if="location">위도: {{ location.latitude }}, 경도: {{ location.longitude }}</p>

    <div v-if="location" id="map" style="width: 100%; height: 400px;"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      location: null, // 위치 정보를 저장할 객체
      map: null, // 네이버 지도 객체
      marker: null // 마커 객체
    };
  },
  methods: {
    // 위치 가져오기
    getLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);
      } else {
        alert("이 브라우저는 Geolocation을 지원하지 않습니다.");
      }
    },

    // 위치를 성공적으로 가져왔을 때 실행되는 함수
    showPosition(position) {
      this.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      this.initMap(); // 네이버 지도 초기화
    },

    // 네이버 지도 초기화 및 마커 추가
    initMap() {
      if (typeof naver !== 'undefined') {
        this.map = new naver.maps.Map('map', {
          center: new naver.maps.LatLng(this.location.latitude, this.location.longitude),
          zoom: 15
        });

        // 마커 추가
        this.marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(this.location.latitude, this.location.longitude),
          map: this.map,
          title: "현재 위치"
        });
      } else {
        console.error("네이버 지도 API가 로드되지 않았습니다.");
      }
    },

    // 위치 가져오기 실패 시 실행되는 함수
    showError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("사용자가 위치 요청을 거부했습니다.");
          break;
        case error.POSITION_UNAVAILABLE:
          alert("위치 정보를 사용할 수 없습니다.");
          break;
        case error.TIMEOUT:
          alert("위치 요청 시간이 초과되었습니다.");
          break;
        case error.UNKNOWN_ERROR:
          alert("알 수 없는 오류가 발생했습니다.");
          break;
      }
    }
  }
};
</script>

<style scoped>
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

p {
  margin-top: 10px;
}
</style>
