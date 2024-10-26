<template>
  <div class="map_wrap">
    <div
      id="map"
      ref="mapRef"
      style="width: 100%; height: 100%; position: relative; overflow: hidden"
    ></div>

    <div id="menu_wrap" class="bg_white">
      <div class="option">
        <div>
          <form @submit.prevent="searchPlaces" class="form">
            키워드 :
            <input
              type="text"
              v-model="keyword"
              id="keyword"
              size="15"
              placeholder="키워드를 입력하세요"
            />
            <button type="submit">검색하기</button>
          </form>
        </div>
      </div>
      <hr />
      <ul id="placesList">
        <li
          v-for="(place, index) in places"
          :key="place.id"
          class="item"
          @mouseover="displayInfowindow(markers[index], place.place_name)"
          @mouseout="infowindow.close()"
          @click="handlePlaceClick(place.place_name)"
        >
          <span :class="`markerbg marker_${index + 1}`"></span>
          <div class="info">
            <h5>{{ place.place_name }}</h5>
            <span>{{ place.road_address_name || place.address_name }}</span>
            <span class="tel">{{ place.phone }}</span>
          </div>
        </li>
      </ul>
      <div id="pagination"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'MapComponent',
  setup() {
    const mapRef = ref(null)
    const keyword = ref('')
    const places = ref([])
    const markers = ref([])
    const map = ref(null)
    const ps = ref(null)
    const infowindow = ref(null)
    let presentPosition = null

    // Kakao Maps SDK 로드
    const loadKakaoMapsScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
          resolve()
        } else {
          const script = document.createElement('script')
          script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=fcbeceefd6c4a98ea42725b3305b990d&libraries=services`
          script.onload = () => {
            if (window.kakao && window.kakao.maps) {
              resolve()
            } else {
              reject(new Error('Kakao Maps SDK 로드 실패'))
            }
          }
          script.onerror = () => reject(new Error('Kakao Maps SDK 로드 에러'))
          document.head.appendChild(script)
        }
      })
    }

    const initMap = () => {
      const mapOption = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 5
      }

      map.value = new window.kakao.maps.Map(mapRef.value, mapOption)
      ps.value = new window.kakao.maps.services.Places()
      infowindow.value = new window.kakao.maps.InfoWindow({ zIndex: 1 })

      // 현재 위치 확인
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude
            const lon = position.coords.longitude
            const locPosition = new window.kakao.maps.LatLng(lat, lon)
            presentPosition = locPosition
            map.value.setCenter(locPosition)
          },
          () => {
            alert('현재 위치를 찾을 수 없습니다!')
          }
        )
      } else {
        alert('Geolocation을 사용할 수 없습니다.')
      }
    }

    const addMarker = (position, idx) => {
      const imageSrc =
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png'
      const imageSize = new window.kakao.maps.Size(36, 37)
      const imgOptions = {
        spriteSize: new window.kakao.maps.Size(36, 691),
        spriteOrigin: new window.kakao.maps.Point(0, idx * 46 + 10),
        offset: new window.kakao.maps.Point(13, 37)
      }
      const markerImage = new window.kakao.maps.MarkerImage(
        imageSrc,
        imageSize,
        imgOptions
      )
      const marker = new window.kakao.maps.Marker({
        position: position,
        image: markerImage
      })

      marker.setMap(map.value)
      markers.value.push(marker)
      return marker
    }

    const removeMarkers = () => {
      markers.value.forEach((marker) => marker.setMap(null))
      markers.value = []
    }

    const displayInfowindow = (marker, title) => {
      const content = `<div style="padding:5px;z-index:1;">${title}</div>`
      infowindow.value.setContent(content)
      infowindow.value.open(map.value, marker)
    }

    const removeAllChildNodes = (el) => {
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild)
      }
    }

    const searchDetailAddrFromCoords = (coords, callback) => {
      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.coord2Address(coords.getLng(), coords.getLat(), callback)
    }

    const searchPlaces = () => {
      const trimmedKeyword = keyword.value.trim()
      if (!trimmedKeyword) {
        alert('키워드를 입력해주세요!')
        return
      }
      ps.value.keywordSearch(trimmedKeyword, placesSearchCB)
    }

    const placesSearchCB = (data, status, pagination) => {
      if (status === window.kakao.maps.services.Status.OK) {
        displayPlaces(data)
        displayPagination(pagination)
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.')
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.')
      }
    }

    const displayPlaces = (placesData) => {
      const listEl = document.getElementById('placesList')
      const bounds = new window.kakao.maps.LatLngBounds()

      removeAllChildNodes(listEl)
      removeMarkers()

      places.value = placesData

      placesData.forEach((place, index) => {
        const placePosition = new window.kakao.maps.LatLng(place.y, place.x)
        const marker = addMarker(placePosition, index)
        bounds.extend(placePosition)

        const itemEl = document.createElement('li')
        let itemStr = `<span class="markerbg marker_${
          index + 1
        }"></span><div class="info"><h5>${place.place_name}</h5>`
        if (place.road_address_name) {
          itemStr += `<span>${place.road_address_name}</span><span class="jibun gray">${place.address_name}</span>`
        } else {
          itemStr += `<span>${place.address_name}</span>`
        }
        itemStr += `<span class="tel">${place.phone}</span></div>`

        itemEl.innerHTML = itemStr
        itemEl.className = 'item'

        // 마커 이벤트 등록
        window.kakao.maps.event.addListener(marker, 'mouseover', () => {
          displayInfowindow(marker, place.place_name)
        })
        window.kakao.maps.event.addListener(marker, 'mouseout', () => {
          infowindow.value.close()
        })

        // 리스트 항목 이벤트 등록
        itemEl.addEventListener('mouseover', () => {
          displayInfowindow(marker, place.place_name)
        })
        itemEl.addEventListener('mouseout', () => {
          infowindow.value.close()
        })

        // 클릭 시 카카오 맵으로 이동
        const handleClick = () => {
          searchDetailAddrFromCoords(presentPosition, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const detailAddr = result[0].road_address
                ? result[0].road_address.address_name
                : result[0].address.address_name
              window.location.href = `https://map.kakao.com/?sName=${encodeURIComponent(
                detailAddr
              )}&eName=${encodeURIComponent(place.place_name)}`
            }
          })
        }

        window.kakao.maps.event.addListener(marker, 'click', handleClick)
        itemEl.addEventListener('click', handleClick)

        listEl.appendChild(itemEl)
      })

      map.value.setBounds(bounds)
    }

    const displayPagination = (pagination) => {
      const paginationEl = document.getElementById('pagination')
      const fragment = document.createDocumentFragment()

      while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild)
      }

      for (let i = 1; i <= pagination.last; i++) {
        const el = document.createElement('a')
        el.href = '#'
        el.innerHTML = i

        if (i === pagination.current) {
          el.className = 'on'
        } else {
          el.onclick = () => {
            pagination.gotoPage(i)
          }
        }

        fragment.appendChild(el)
      }

      paginationEl.appendChild(fragment)
    }

    const handlePlaceClick = (placeName) => {
      searchDetailAddrFromCoords(presentPosition, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const detailAddr = result[0].road_address
            ? result[0].road_address.address_name
            : result[0].address.address_name
          window.location.href = `https://map.kakao.com/?sName=${encodeURIComponent(
            detailAddr
          )}&eName=${encodeURIComponent(placeName)}`
        }
      })
    }

    onMounted(() => {
      loadKakaoMapsScript()
        .then(() => {
          initMap()
        })
        .catch((error) => {
          console.error(error)
        })
    })

    return {
      mapRef,
      keyword,
      places,
      handlePlaceClick
    }
  }
}
</script>

<style scoped>
.map_wrap {
  position: relative;
  width: 100%;
  height: 100vh;
}

.bg_white {
  background-color: white;
  padding: 10px;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  border-radius: 8px;
}

.option {
  margin-bottom: 10px;
}

.form input {
  margin-right: 10px;
}

#menu_wrap {
  width: 300px;
}

#placesList {
  list-style: none;
  padding: 0;
}

#pagination {
  text-align: center;
  margin-top: 10px;
}

#pagination a {
  margin: 0 5px;
  text-decoration: none;
  color: #4a90e2;
  cursor: pointer;
}

#pagination a.on {
  font-weight: bold;
  text-decoration: underline;
}

.item {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.item:hover {
  background-color: #f0f0f0;
}

.markerbg {
  display: inline-block;
  width: 24px;
  height: 24px;
  background-color: #4a90e2;
  border-radius: 50%;
  margin-right: 8px;
}

.marker_1 {
  background-color: #1abc9c;
}
.marker_2 {
  background-color: #2ecc71;
}
.marker_3 {
  background-color: #3498db;
}
.marker_4 {
  background-color: #9b59b6;
}
.marker_5 {
  background-color: #e67e22;
}
/* 추가적인 마커 색상 정의 가능 */

.info {
  display: flex;
  flex-direction: column;
}

.info h5 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.info span {
  font-size: 14px;
  color: #555;
}

.info .tel {
  font-size: 14px;
  color: #555;
}
</style>
