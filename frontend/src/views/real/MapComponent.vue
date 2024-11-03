<template>
  <div ref="mapContainer" style="width: 100%; height: 350px"></div>
</template>

<script>
export default {
  props: {
    coordinates: {
      type: Object,
      required: true,
      default: () => ({ x: 127.027619, y: 37.49794 }) // 기본 좌표 설정
    }
  },
  mounted() {
    this.loadKakaoMap()
  },
  methods: {
    loadKakaoMap() {
      if (!window.kakao || !window.kakao.maps) {
        const script = document.createElement('script')
        script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.VUE_APP_KAKAO_REST_KEY}&libraries=services`
        script.onload = this.initMap
        document.head.appendChild(script)
      } else {
        this.initMap()
      }
    },
    initMap() {
      const { x, y } = this.coordinates
      const mapContainer = this.$refs.mapContainer
      const mapOption = {
        center: new kakao.maps.LatLng(y, x),
        level: 3
      }
      const map = new kakao.maps.Map(mapContainer, mapOption)
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(y, x)
      })
      marker.setMap(map)
    }
  },
  watch: {
    coordinates: {
      handler() {
        this.initMap()
      },
      deep: true
    }
  }
}
</script>
