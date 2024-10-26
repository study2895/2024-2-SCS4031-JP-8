<template>
  <div class="page-background">
    <div class="page-content">
      <Header
        :isGyeonggiToSeoul="isGyeonggiToSeoul"
        :initialSearchQuery="searchQuery"
        @toggle-route="toggleRoute"
        @search="performSearch"
      />
      <div class="search-results">
        <div class="result-header">
          <span>{{ isGyeonggiToSeoul ? '경기' : '서울' }}</span>
        </div>
        <BusItem
          v-for="(bus, index) in filteredBuses"
          :key="index"
          :number="bus.routeName"
          :route="bus.regionName"
          :isActive="selectedBus === bus.routeId"
          @select="selectBus(bus.routeId)"
        />
      </div>
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Header from './Header.vue'
import Footer from './Footer.vue'
import BusItem from './BusItem.vue'
import { getBusRouteList } from '@/utils/API/gyeonggiBusAPI.js'

const route = useRoute()
const router = useRouter()
const store = useStore()

const isGyeonggiToSeoul = ref(true)
const searchQuery = ref('')

const selectedBus = ref(null)

// Vuex에서 검색 결과를 가져오기
const buses = computed(() => store.state.search.results)

// 페이지가 마운트될 때 query에서 검색어 및 방향 정보를 설정
onMounted(() => {
  searchQuery.value = route.query.q || ''
  isGyeonggiToSeoul.value = route.query.direction === 'gyeonggi-to-seoul'
})

// API를 호출하고 검색 결과를 Vuex에 저장하는 함수
const performSearch = async (query) => {
  searchQuery.value = query

  try {
    const result = await getBusRouteList(query)

    // Vuex에 검색 결과를 저장
    store.dispatch('search/setResults', result)

    // 검색 결과 페이지로 이동하면서 검색 결과 전달
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
}

// 경로를 토글하는 함수
const toggleRoute = (value) => {
  isGyeonggiToSeoul.value = value
}

// 버스를 선택하는 함수
const selectBus = (bus) => {
  selectedBus.value = bus.routeId

  // 로컬 스토리지에 저장
  let favorites = JSON.parse(localStorage.getItem('favorites')) || []

  // 중복된 아이템은 추가하지 않도록 확인
  if (!favorites.some((fav) => fav.routeId === bus.routeId)) {
    favorites.push(bus)
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }
}

// 필터링된 버스를 계산하는 함수
const filteredBuses = computed(() => {
  // 검색어가 없으면 모든 버스를 반환, 있으면 필터링
  if (searchQuery.value.trim() === '') {
    return buses.value
  }
  return buses.value.filter((bus) => bus.routeName.includes(searchQuery.value))
})
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
  min-width: 320px;
  background-color: #ffffff;
  color: #5b5b5b;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
  position: relative;
  overflow: hidden;
}

.search-results {
  margin-top: 0;
}

.result-header {
  background-color: #f9f6f6;
  margin-left: -24px;
  margin-right: -24px;
  padding: 4px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #5b5b5b;
  margin-bottom: 12px;
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
