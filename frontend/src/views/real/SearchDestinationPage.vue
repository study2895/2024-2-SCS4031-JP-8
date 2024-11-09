<template>
  <div class="background">
    <div class="mobile-container">
      <header>
        <h1>도착지 검색</h1>
      </header>
      <div class="input-group">
        <input
          v-model="keyword"
          placeholder="도착지를 검색하세요"
          @keyup.enter="searchPlaces"
        />
        <button v-if="keyword" class="clear-button" @click="clearKeyword">
          ✕
        </button>
        <button @click="searchPlaces">검색하기</button>
      </div>

      <!-- '내 위치' 버튼 -->
      <button @click="setCurrentLocation" class="location-button">
        내 위치
      </button>

      <!-- 장소명/정류장 선택 버튼 -->
      <div class="search-type-toggle">
        <button
          :class="{ active: searchType === 'place' }"
          @click="setSearchType('place')"
        >
          장소명
        </button>
        <button
          :class="{ active: searchType === 'station' }"
          @click="setSearchType('station')"
        >
          정류장
        </button>
      </div>

      <!-- 최근 검색 목록 -->
      <!-- 최근 검색 목록에 "(장소)" 표시 추가 -->
      <div
        v-if="recentSearches.length > 0 && !keyword.trim()"
        class="recent-searches"
      >
        <h3>최근 검색</h3>
        <ul>
          <li v-for="(search, index) in recentSearches" :key="index">
            <span @click="applyRecentSearch(search.query)">
              {{ search.query }} - {{ search.date }}
              {{ search.type === 'place' ? '(장소)' : '' }}
            </span>
            <button @click="removeRecentSearch(index)">x</button>
          </li>
        </ul>
      </div>

      <!-- 즐겨찾기 목록 -->
      <div v-if="favorites.length > 0" class="favorites">
        <h3>즐겨찾기</h3>
        <ul>
          <li v-for="(favorite, index) in favorites" :key="index">
            <span @click="applyRecentSearch(favorite.query)">
              {{ favorite.query }} - {{ favorite.date }}
            </span>
            <button @click="removeFavorite(index)">★</button>
          </li>
        </ul>
      </div>

      <!-- 검색 결과 목록 -->
      <ul v-if="filteredPlaces.length > 0" class="place-list">
        <li
          v-for="(place, index) in filteredPlaces"
          :key="index"
          class="place-item"
          @click="selectPlace(place)"
        >
          <h3>{{ place.place_name }}</h3>
          <p>{{ place.address_name }}</p>
          <p>{{ place.category_name }}</p>
          <p>{{ place.phone || '정보 없음' }}</p>
          <button @click.stop="toggleMap(index, place)">지도</button>
          <button @click.stop="toggleFavorite(place)">
            {{ isFavorite(place) ? '★' : '☆' }}
          </button>

          <!-- 지도 표시 영역 -->
          <div
            v-if="mapVisibleIndex === index"
            class="mini-map"
            :ref="'map' + index"
          ></div>
        </li>
      </ul>
      <p v-else class="no-results">검색 결과가 없습니다.</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { mapMutations } from 'vuex'
import { useRouter } from 'vue-router'

export default {
  data() {
    return {
      keyword: '',
      places: [],
      stations: [], // 오디세이 API 결과용
      searchType: 'place', // 기본값을 'place'로 설정
      recentSearches: [],
      favorites: [],
      mapVisibleIndex: null
    }
  },
  computed: {
    filteredPlaces() {
      return this.searchType === 'place' ? this.places : this.stations
    }
  },
  methods: {
    ...mapMutations('destination', ['setDestination']),
    setSearchType(type) {
      this.searchType = type
      console.log('searchType이 변경되었습니다:', this.searchType)
      this.searchPlaces() // searchType 변경 후 자동으로 검색 실행
    },
    searchPlaces() {
      if (!this.keyword.trim()) {
        alert('키워드를 입력해주세요!')
        return
      }

      this.addRecentSearch(this.keyword)
      console.log('현재 searchType:', this.searchType)

      if (this.searchType === 'place') {
        console.log('카카오 API 호출 시작')
        fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
            this.keyword
          )}`,
          {
            headers: {
              Authorization: `KakaoAK ${process.env.VUE_APP_KAKAO_REST_KEY}`
            }
          }
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
          })
          .then((data) => {
            this.places = data.documents
            this.stations = [] // 오디세이 결과 초기화
          })
          .catch((error) => {
            console.error('카카오 API 검색 중 오류가 발생했습니다.', error)
            alert('카카오 API 검색 중 오류가 발생했습니다. 다시 시도해주세요.')
          })
      } else if (this.searchType === 'station') {
        console.log('오디세이 API 호출 시작')
        fetch(
          `https://api.odsay.com/v1/api/searchStation?stationName=${encodeURIComponent(
            this.keyword
          )}&apiKey=${process.env.VUE_APP_ODSAY_API_KEY}`
        )
          .then((response) => {
            if (!response.ok) {
              throw new Error(`ODsay API error! status: ${response.status}`)
            }
            return response.json()
          })
          .then((odsayData) => {
            console.log('ODsay API 응답:', odsayData)

            if (odsayData.result && Array.isArray(odsayData.result.station)) {
              this.stations = odsayData.result.station.map((station) => ({
                place_name: station.stationName,
                address_name: `${station.do} ${station.gu} ${station.dong}`,
                category_name: '대중교통 정류장',
                phone: '정보 없음',
                x: station.x,
                y: station.y
              }))
              this.places = [] // 카카오 결과 초기화
            } else {
              console.warn('ODsay API 응답에서 station 데이터가 없습니다.')
            }
          })
          .catch((error) => {
            console.error('ODsay API 검색 중 오류가 발생했습니다.', error)
            alert('ODsay API 검색 중 오류가 발생했습니다. 다시 시도해주세요.')
          })
      }
    },
    clearKeyword() {
      this.keyword = ''
      this.places = []
      this.stations = []
    },
    addRecentSearch(query, type = 'search') {
      const date = new Date().toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric'
      })
      const newSearch = { query, date, type }

      const existingIndex = this.recentSearches.findIndex(
        (item) => item.query === query
      )
      if (existingIndex !== -1) {
        this.recentSearches.splice(existingIndex, 1)
      } else if (this.recentSearches.length >= 3) {
        this.recentSearches.pop()
      }
      this.recentSearches.unshift(newSearch)
      localStorage.setItem(
        'recentSearches',
        JSON.stringify(this.recentSearches)
      )
    },
    loadRecentSearches() {
      const storedSearches = localStorage.getItem('recentSearches')
      if (storedSearches) {
        this.recentSearches = JSON.parse(storedSearches)
      }
      const storedFavorites = localStorage.getItem('favorites')
      if (storedFavorites) {
        this.favorites = JSON.parse(storedFavorites)
      }
    },
    applyRecentSearch(query) {
      this.keyword = query
      this.searchPlaces()
    },
    removeRecentSearch(index) {
      this.recentSearches.splice(index, 1)
      localStorage.setItem(
        'recentSearches',
        JSON.stringify(this.recentSearches)
      )
    },
    toggleFavorite(place) {
      const favoriteIndex = this.favorites.findIndex(
        (fav) => fav.place_name === place.place_name
      )
      if (favoriteIndex === -1) {
        this.favorites.push({
          query: place.place_name,
          date: new Date().toLocaleDateString('ko-KR', {
            month: 'numeric',
            day: 'numeric'
          }),
          x: place.x,
          y: place.y
        })
      } else {
        this.favorites.splice(favoriteIndex, 1)
      }
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    },
    removeFavorite(index) {
      this.favorites.splice(index, 1)
      localStorage.setItem('favorites', JSON.stringify(this.favorites))
    },
    isFavorite(place) {
      return this.favorites.some((fav) => fav.query === place.place_name)
    },
    toggleMap(index, place) {
      if (this.mapVisibleIndex === index) {
        this.mapVisibleIndex = null
      } else {
        this.mapVisibleIndex = index
        this.$nextTick(() => {
          this.showMap(index, place.x, place.y)
        })
      }
    },
    showMap(index, x, y) {
      const mapContainer = this.$refs[`map${index}`][0]
      const map = new naver.maps.Map(mapContainer, {
        center: new naver.maps.LatLng(y, x),
        zoom: 15
      })

      new naver.maps.Marker({
        position: new naver.maps.LatLng(y, x),
        map: map
      })
    },
    selectPlace(place) {
      // 선택한 장소를 최근 검색에 "(장소)"로 표시
      this.addRecentSearch(place.place_name, 'place')
      this.setDestination({
        name: place.place_name,
        coordinates: { x: place.x, y: place.y }
      })
      this.$router.push('/')
    },
    setCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.setDestination({
              name: '내 위치',
              coordinates: {
                x: position.coords.longitude,
                y: position.coords.latitude
              }
            })
            this.$router.push('/') // 위치 설정 후 메인 페이지로 이동
          },
          (error) => {
            alert('위치를 불러오지 못했습니다.')
          }
        )
      } else {
        alert('이 브라우저는 Geolocation을 지원하지 않습니다.')
      }
    }
  },
  mounted() {
    this.loadRecentSearches()
  }
}
</script>

<style scoped>
* {
  font-family: 'Pretendard', sans-serif;
}

/* 버튼 스타일 */
.search-type-toggle {
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.search-type-toggle button {
  flex: 1;
  padding: 10px;
  border: none;
  cursor: pointer;
  background-color: #f0f0f0;
  font-size: 14px;
  color: #444;
}

.search-type-toggle .active {
  background-color: #e5c7c7;
  color: white;
}

.location-button {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  background-color: #f0f0f0;
  color: #444;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.location-button:hover {
  background-color: #e5e5e5;
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
  overflow-y: auto;
  height: 100vh;
  box-sizing: border-box;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

.clear-button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
}

button {
  padding: 12px 20px;
  background-color: #e5c7c7;
  color: white;
  font-size: 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  height: 48px;
}

button:hover {
  background-color: #ce9595;
}

.recent-searches h3,
.favorites h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.recent-searches ul,
.favorites ul {
  list-style: none;
  padding: 0;
}

.recent-searches li,
.favorites li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  cursor: pointer;
}

.recent-searches li span,
.favorites li span {
  color: #333;
  flex: 1;
}

.recent-searches li span:hover,
.favorites li span:hover {
  text-decoration: underline;
}

.recent-searches li button,
.favorites li button {
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.place-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.place-item {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
}

.place-item h3 {
  font-size: 16px;
  margin: 0 0 5px;
}

.place-item p {
  font-size: 14px;
  margin: 0;
}

.no-results {
  text-align: center;
  font-size: 14px;
  color: #888;
}

/* 지도 표시 스타일 */
.mini-map {
  width: 100%;
  height: 200px;
  margin-top: 10px;
}
</style>
