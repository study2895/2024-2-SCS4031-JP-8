<template>
  <div class="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-indigo-200">
    <div
      class="max-w-4xl mx-auto overflow-hidden shadow-xl bg-white/80 backdrop-blur-md rounded-xl"
    >
      <div class="p-6">
        <h2 class="mb-8 text-3xl font-bold text-center text-gray-800">
          네이버 지역 검색 api -> geolocation api로 좌표계 변환 -> odisay api로
          길찾기 -> 네이버 지도 api에 표시
        </h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-4">
            <div class="relative">
              <input
                v-model="startQuery"
                @input="debouncedSearchLocation('start')"
                placeholder="Enter start location"
                class="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin
                class="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                :size="18"
              />
              <button
                @click="searchLocation('start')"
                class="absolute p-1 text-white transform -translate-y-1/2 bg-blue-500 rounded-md right-2 top-1/2"
              >
                <Search :size="18" />
              </button>
            </div>
            <div
              v-if="startResults.length > 0"
              class="mt-2 overflow-y-auto bg-white rounded-md shadow-md max-h-60"
            >
              <div
                v-for="item in startResults"
                :key="item.mapx"
                @click="
                  () =>
                    console.log(formatWGS84(item.mapx), formatWGS84(item.mapy))
                "
                class="p-2 cursor-pointer hover:bg-gray-100"
              >
                {{ item.title.replace(/<\/?b>/g, '') }} - {{ item.roadAddress }}
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="relative">
              <input
                v-model="endQuery"
                @input="debouncedSearchLocation('end')"
                placeholder="Enter destination"
                class="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin
                class="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                :size="18"
              />
              <button
                @click="searchLocation('end')"
                class="absolute p-1 text-white transform -translate-y-1/2 bg-blue-500 rounded-md right-2 top-1/2"
              >
                <Search :size="18" />
              </button>
            </div>
            <div
              v-if="endResults.length > 0"
              class="mt-2 overflow-y-auto bg-white rounded-md shadow-md max-h-60"
            >
              <div
                v-for="item in endResults"
                :key="item.mapx"
                @click="
                  () =>
                    console.log(formatWGS84(item.mapx), formatWGS84(item.mapy))
                "
                class="p-2 cursor-pointer hover:bg-gray-100"
              >
                {{ item.title.replace(/<\/?b>/g, '') }} - {{ item.roadAddress }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-6 text-center">
          <button
            @click="searchRoute"
            class="px-8 py-3 text-white bg-blue-600 rounded-full hover:bg-blue-700"
            :disabled="isLoading"
          >
            <template v-if="isLoading">
              <svg
                class="w-5 h-5 mr-3 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Finding Route...
            </template>
            <template v-else>
              <Navigation class="inline-block mr-2" :size="18" />
              길 찾기
            </template>
          </button>
        </div>
      </div>
    </div>
    <div
      ref="mapRef"
      class="mt-8 h-[400px] rounded-xl overflow-hidden shadow-2xl"
    ></div>
  </div>
</template>

<script setup>
import apiConfig from '@/utils/API/apiConfig.js'
import {
  startQuery,
  endQuery,
  startResults,
  endResults,
  isLoading,
  mapRef,
  initMap,
  searchLocation,
  searchRoute,
  debouncedSearchLocation,
  formatWGS84
} from './MapLogic.js' // MapLogic import 경로 수정 필요

import { Search, MapPin, Navigation } from 'lucide-vue-next'
import { onMounted } from 'vue'

const naverClientId = apiConfig.VUE_APP_NAVER_CLIENT_ID

// 지도 초기화
onMounted(() => {
  if (typeof window.naver !== 'undefined') {
    initMap()
  } else {
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${naverClientId}` // 템플릿 리터럴 수정
    document.head.appendChild(script)
    script.onload = () => {
      initMap()
    }
  }
})
</script>

<style>
.custom-marker {
  background-color: #4a90e2;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 12px;
}
</style>
