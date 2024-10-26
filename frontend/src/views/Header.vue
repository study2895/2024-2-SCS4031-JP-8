<template>
  <header>
    <h1>버스미리</h1>
    <SlidingMenu />
  </header>
  <div class="header-content">
    <div class="route-toggle-container">
      <div
        class="route-toggle"
        :class="{ 'seoul-to-gyeonggi': !isGyeonggiToSeoul }"
      >
        <button
          @click="$emit('toggle-route', true)"
          :class="{ active: isGyeonggiToSeoul }"
        >
          경기 → 서울
        </button>
        <button
          @click="$emit('toggle-route', false)"
          :class="{ active: !isGyeonggiToSeoul }"
        >
          서울 → 경기
        </button>
        <div class="toggle-background"></div>
      </div>
    </div>
    <div class="search-bar-container">
      <form class="search-bar" @submit.prevent="submitSearch">
        <SearchIcon />
        <input v-model="searchQuery" type="text" placeholder="버스 번호 검색" />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { SearchIcon } from '@/utils/icons'
import { SlidingMenu } from '@/utils/components.js'

const props = defineProps({
  isGyeonggiToSeoul: {
    type: Boolean,
    required: true
  },
  initialSearchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['toggle-route', 'search'])
const searchQuery = ref(props.initialSearchQuery)

const submitSearch = () => {
  if (searchQuery.value.trim()) {
    emit('search', searchQuery.value)
  }
}
</script>

<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

:root {
  --header-padding: 16px;
  --toggle-background: #f9f6f6;
  --active-color: #f24e1e;
  --text-color: #5b5b5b;
  --border-color: #dbdbdb;
}

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Helvetica, Arial, sans-serif;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--header-padding) 0;
  background-color: #ffffff;
}

h1 {
  font-size: 18px;
  font-weight: 700;
}

.header-content {
  padding: 0;
}

.route-toggle-container {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.route-toggle {
  display: flex;
  width: 90%;
  background-color: var(--toggle-background);
  border-radius: 16px;
  padding: 2px;
  position: relative;
  overflow: hidden;
}

.route-toggle button {
  flex: 1;
  padding: 10px 0;
  border: none;
  background-color: transparent;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.route-toggle button.active {
  color: #ffffff;
}

.toggle-background {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background-color: var(--active-color);
  border-radius: 14px;
  transition: transform 0.3s ease;
}

.route-toggle.seoul-to-gyeonggi .toggle-background {
  transform: translateX(100%);
}

.search-bar-container {
  position: relative;
  padding-bottom: 12px;
}

.search-bar-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  height: 1px;
  background-color: var(--border-color);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--toggle-background);
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-icon {
  margin-right: 8px;
  cursor: pointer;
}

.search-bar input {
  border: none;
  background: transparent;
  flex: 1;
  font-size: 14px;
  color: var(--text-color);
  outline: none;
  transition: all 0.3s ease;
}

.search-bar input::placeholder {
  color: #adb5bd;
}

.search-bar:focus-within {
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(242, 78, 30, 0.2);
}

.search-bar:focus-within .search-icon path {
  stroke: var(--active-color);
}
</style>
