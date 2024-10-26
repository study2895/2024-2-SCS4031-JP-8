<template>
  <div class="sliding-menu-container">
    <!-- 메뉴 버튼 -->
    <button @click="toggleMenu" class="menu-button" aria-label="메뉴 열기">
      <MenuIcon />
    </button>

    <!-- 오버레이 및 메뉴 -->
    <Transition name="fade">
      <div v-if="isMenuOpen" class="overlay" @click="closeMenu"></div>
    </Transition>

    <Transition name="slide">
      <div v-if="isMenuOpen" class="menu">
        <div class="menu-header">
          <h2>메뉴</h2>
          <button
            @click="closeMenu"
            class="close-button"
            aria-label="메뉴 닫기"
          >
            <CloseIcon />
          </button>
        </div>
        <div class="menu-content">
          <h3>자동 새로고침 간격(수정중)</h3>
          <ul>
            <li>
              <button
                :class="{ active: selectedInterval === 15 }"
                @click="setInterval(15)"
              >
                15초
              </button>
            </li>
            <li>
              <button
                :class="{ active: selectedInterval === 30 }"
                @click="setInterval(30)"
              >
                30초
              </button>
            </li>
            <li>
              <button
                :class="{ active: selectedInterval === 45 }"
                @click="setInterval(45)"
              >
                45초
              </button>
            </li>
            <li>
              <button
                :class="{ active: selectedInterval === 60 }"
                @click="setInterval(60)"
              >
                60초
              </button>
            </li>
          </ul>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MenuIcon, CloseIcon } from '@/utils/icons'

const isMenuOpen = ref(false)
const selectedInterval = ref(60)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const setInterval = (interval) => {
  selectedInterval.value = interval
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.sliding-menu-container {
  position: relative;
  height: 100%;
}

.menu-button,
.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

.menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background-color: #ffffff;
  z-index: 999;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Helvetica, Arial, sans-serif;
  overflow-y: auto;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 1;
}

.menu-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.menu-content {
  padding: 16px;
  background-color: #ffffff;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.menu-content h3 {
  font-size: 13px;
  font-weight: 400;
  color: #666;
  margin: 0 0 12px 0;
}

.menu-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.menu-content ul li {
  margin-bottom: 8px;
}

.menu-content ul li button {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 4px;
}

.menu-content ul li button:hover {
  background-color: #f5f5f5;
}

.menu-content ul li button.active {
  font-weight: 600;
  color: #f24e1e;
  background-color: #fff0ed;
}

/* 트랜지션 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
