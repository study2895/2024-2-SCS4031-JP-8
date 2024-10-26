<template>
  <div class="page-background">
    <div class="page-content">
      <Header
        :isGyeonggiToSeoul="isGyeonggiToSeoul"
        :initialSearchQuery="searchQuery"
        @toggle-route="toggleRoute"
        @search="performSearch"
      />
      <div class="content">
        <section class="section">
          <h2 class="section-title">최근 검색</h2>
          <ul v-if="recentSearches.length" class="list">
            <li
              v-for="(search, index) in recentSearches"
              :key="index"
              class="list-item"
            >
              <span>{{ search.number }} - {{ search.description }}</span>
              <button @click="deleteRecentSearch(index)" class="delete-button">
                삭제
              </button>
            </li>
          </ul>
          <div v-else class="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="empty-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p>최근 검색 내역이 없습니다.</p>
          </div>
        </section>
        <section class="section">
          <h2 class="section-title">즐겨찾기</h2>
          <ul v-if="favorites.length" class="list">
            <li
              v-for="(favorite, index) in favorites"
              :key="index"
              class="list-item"
            >
              {{ favorite.number }} - {{ favorite.description }}
            </li>
          </ul>
          <div v-else class="empty-state">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="empty-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p>즐겨찾기 항목이 없습니다.</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex' // Vuex store 가져오기
import {
  Header,
  Footer,
  RecentSearch,
  FavoritesList
} from '@/utils/components.js'
import { getBusRouteList } from '@/utils/API/gyeonggiBusAPI.js' // API 함수 불러오기

const router = useRouter()
const store = useStore() // Vuex store 가져오기

const isGyeonggiToSeoul = ref(true)
const searchQuery = ref('')
const recentSearches = ref([]) // 최근 검색 항목을 관리
const favorites = ref([]) // 즐겨찾기 항목을 관리

// 디바운스 함수 정의
function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// 페이지가 로드될 때 로컬 스토리지에서 즐겨찾기 목록을 불러옴
onMounted(() => {
  // 로컬 스토리지에서 'recentSearches' 항목 불러오기
  const savedRecentSearches =
    JSON.parse(localStorage.getItem('recentSearches')) || []
  recentSearches.value = savedRecentSearches

  // 로컬 스토리지에서 'favorites' 항목 불러오기
  const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
  favorites.value = savedFavorites
})

// 경로를 토글하는 함수
const toggleRoute = (value) => {
  isGyeonggiToSeoul.value = value
}

// 검색어를 입력하고 API에서 데이터를 가져오는 함수
// performSearch 함수 수정
const performSearch = debounce(async (query) => {
  console.log('검색된 키워드:', query)
  searchQuery.value = query

  try {
    // API 호출
    const result = await getBusRouteList(query)
    console.log('API 결과: ', result)

    // result에서 필요한 데이터 추출 (예: bus number, regionName, routeTypeName)
    const busInfo = {
      number: query, // 검색된 버스 번호
      description: `${result.regionName} - ${result.routeTypeName}` // 예시로 regionName과 routeTypeName을 연결
    }

    // Vuex에 검색 결과 저장
    store.dispatch('search/setResults', result)

    // 최근 검색 저장
    recentSearches.value.unshift(busInfo)
    recentSearches.value = recentSearches.value.slice(0, 5) // 최대 5개 기록 저장
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
    console.log('저장된 최근 검색:', recentSearches.value)

    // 검색 결과 페이지로 라우팅
    router.push({
      name: 'BusSearchResults',
      query: {
        q: query,
        direction: isGyeonggiToSeoul.value
          ? 'gyeonggi-to-seoul'
          : 'seoul-to-gyeonggi'
      }
    })
  } catch (error) {
    console.error('Error fetching bus route data:', error)
  }
}, 500) // 500ms 후에 API 호출

// 최근 검색을 삭제하는 함수
const deleteRecentSearch = (index) => {
  recentSearches.value.splice(index, 1)
  localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value))
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Helvetica, Arial, sans-serif;
}

.page-background {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 0 16px;
}

.page-content {
  max-width: 414px;
  width: 100%;
  background-color: #ffffff;
  color: #5b5b5b;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
  position: relative;
  overflow: hidden;
}

.content {
  padding: 24px 0;
}

.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.list {
  list-style-type: none;
  padding: 0;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.delete-button {
  background-color: transparent;
  border: none;
  color: #f24e1e;
  font-size: 14px;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  background-color: #f9f6f6; /* 배경색 변경 */
  border-radius: 8px;
}

.empty-icon {
  width: 32px;
  height: 32px;
  color: #ccc;
  margin-bottom: 12px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
}

@media (max-width: 414px) {
  .page-background {
    padding: 0;
  }

  .page-content {
    box-shadow: none;
  }
}
</style>
