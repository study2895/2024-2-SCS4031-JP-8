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

      <!-- 최근 검색 목록 -->
      <div
        v-if="recentSearches.length > 0 && !keyword.trim()"
        class="recent-searches"
      >
        <h3>최근 검색</h3>
        <ul>
          <li v-for="(search, index) in recentSearches" :key="index">
            <span @click="applyRecentSearch(search.query)"
              >{{ search.query }} - {{ search.date }}</span
            >
            <button @click="removeRecentSearch(index)">x</button>
          </li>
        </ul>
      </div>

      <ul v-if="places.length > 0" class="place-list">
        <li
          v-for="(place, index) in places"
          :key="index"
          @click="selectPlace(place)"
          class="place-item"
        >
          <h3>{{ place.place_name }}</h3>
          <p>{{ place.address_name }}</p>
          <p>{{ place.category_name }}</p>
          <p>{{ place.phone || '정보 없음' }}</p>
        </li>
      </ul>
      <p v-else class="no-results">검색 결과가 없습니다.</p>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      keyword: '',
      places: [],
      recentSearches: []
    }
  },
  methods: {
    ...mapMutations('destination', ['setDestination']),
    async searchPlaces() {
      if (!this.keyword.trim()) {
        alert('키워드를 입력해주세요!')
        return
      }

      this.addRecentSearch(this.keyword) // 최근 검색 저장
      try {
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
            this.keyword
          )}`,
          {
            headers: {
              Authorization: `KakaoAK 2372890c7cae057635e6427bc7d7918f`
            }
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        this.places = data.documents
      } catch (error) {
        console.error('검색 중 오류가 발생했습니다.', error)
        alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    },
    clearKeyword() {
      this.keyword = ''
      this.places = []
    },
    addRecentSearch(query) {
      const date = new Date().toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric'
      })
      const existingIndex = this.recentSearches.findIndex(
        (item) => item.query === query
      )

      if (existingIndex !== -1) {
        this.recentSearches[existingIndex].date = date
        this.recentSearches.unshift(
          this.recentSearches.splice(existingIndex, 1)[0]
        )
      } else {
        if (this.recentSearches.length >= 3) {
          this.recentSearches.pop()
        }
        this.recentSearches.unshift({ query, date })
      }

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
    selectPlace(place) {
      this.setDestination({
        name: place.place_name,
        coordinates: { x: place.x, y: place.y }
      })
      this.$router.push('/')
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

.recent-searches h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.recent-searches ul {
  list-style: none;
  padding: 0;
}

.recent-searches li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.recent-searches li span {
  color: #333;
  flex: 1;
  cursor: pointer;
}

.recent-searches li span:hover {
  text-decoration: underline;
}

.recent-searches li button {
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
</style>
