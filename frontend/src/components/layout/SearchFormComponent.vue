<template>
  <div class="search-form">
    <div class="input-group">
      <label><i class="fas fa-map-marker-alt"></i></label>
      <input
        v-model="departureName"
        placeholder="출발지를 입력하세요"
        @focus="goToSearchDeparture"
        readonly
      />
      <button v-if="departureName" @click="clearDeparture" class="clear-button">
        ✕
      </button>
    </div>
    <div class="input-group">
      <label><i class="fas fa-flag-checkered"></i></label>
      <input
        v-model="destinationName"
        placeholder="도착지를 입력하세요"
        @focus="goToSearchDestination"
        readonly
      />
      <button
        v-if="destinationName"
        @click="clearDestination"
        class="clear-button"
      >
        ✕
      </button>
    </div>

    <!-- 최근 경로 -->
    <!-- <div v-if="recentRoutes.length > 0" class="recent-routes">
      <h3>최근 경로</h3>
      <ul>
        <li v-for="(route, index) in recentRoutes" :key="index">
          <span @click="applyRecentRoute(route)">
            {{ route.departureName }} ➔ {{ route.destinationName }}
          </span>
          <button @click="removeRecentRoute(index)">x</button>
        </li>
      </ul>
    </div> -->

    <div class="input-group">
      <label><i class="fas fa-clock"></i></label>
      <input :value="formattedTime" @click="openTimeModal" readonly />
      <button @click="setCurrentTime" class="realtime-button">실시간</button>
    </div>

    <div class="switch-button-container">
      <button @click="switchLocations" class="switch-button">
        출발지와 도착지 바꾸기
      </button>
    </div>

    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showTimeModal" class="modal">
          <div class="modal-content">
            <h3>출발 시각 설정</h3>
            <div class="horizontal-pickers">
              <div id="date-picker" class="picker scrollable">
                <button
                  v-for="(day, index) in dateOptions"
                  :key="index"
                  @click="tempSelectedDay = day.value"
                  :class="{ selected: tempSelectedDay === day.value }"
                >
                  {{ day.text }}
                </button>
              </div>
              <div class="time-picker">
                <div class="scrollable">
                  <div
                    v-for="hour in 12"
                    :key="hour"
                    class="time-option"
                    :class="{ selected: tempSelectedHour === hour }"
                    @click="tempSelectedHour = hour"
                  >
                    {{ hour }}
                  </div>
                </div>
                <span>시</span>
                <div class="scrollable">
                  <div
                    v-for="minute in 6"
                    :key="minute"
                    class="time-option"
                    :class="{
                      selected: tempSelectedMinute === (minute - 1) * 10
                    }"
                    @click="tempSelectedMinute = (minute - 1) * 10"
                  >
                    {{ (minute - 1) * 10 }}
                  </div>
                </div>
                <span>분</span>
              </div>
              <div class="meridiem-picker">
                <button
                  @click="tempSelectedMeridiem = 'AM'"
                  :class="{ selected: tempSelectedMeridiem === 'AM' }"
                >
                  오전
                </button>
                <button
                  @click="tempSelectedMeridiem = 'PM'"
                  :class="{ selected: tempSelectedMeridiem === 'PM' }"
                >
                  오후
                </button>
              </div>
            </div>
            <button @click="confirmTime" class="modal-button primary">
              설정
            </button>
            <button @click="closeTimeModal" class="modal-button secondary">
              닫기
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

const showTimeModal = ref(false)
const selectedMeridiem = ref('AM')
const selectedDay = ref('today')
const selectedHour = ref('')
const selectedMinute = ref('')

const tempSelectedMeridiem = ref('AM')
const tempSelectedDay = ref('today')
const tempSelectedHour = ref('')
const tempSelectedMinute = ref('')

const dateOptions = ref([])

const departureName = computed({
  get: () => store.state.departure.departure?.name || '',
  set: (value) => store.commit('departure/setDeparture', { name: value })
})
const destinationName = computed({
  get: () => store.state.destination.destination?.name || '',
  set: (value) => store.commit('destination/setDestination', { name: value })
})

const clearDeparture = () => {
  store.commit('departure/setDeparture', { name: '', coordinates: {} })
}
const clearDestination = () => {
  store.commit('destination/setDestination', { name: '', coordinates: {} })
}

const formattedTime = computed(() => {
  const dayText =
    selectedDay.value === 'today'
      ? '오늘'
      : selectedDay.value === 'tomorrow'
      ? '내일'
      : `${new Date().getMonth() + 1}월 ${selectedDay.value}일`
  const meridiemText = selectedMeridiem.value === 'AM' ? '오전' : '오후'
  return `${dayText} ${meridiemText} ${selectedHour.value}:${
    selectedMinute.value < 10
      ? '0' + selectedMinute.value
      : selectedMinute.value
  } 출발`
})

const setCurrentTime = () => {
  const now = new Date()
  selectedDay.value = 'today'
  selectedMeridiem.value = now.getHours() >= 12 ? 'PM' : 'AM'
  selectedHour.value = now.getHours() % 12 || 12
  selectedMinute.value = now.getMinutes()
}

// 모달을 열 때 기존의 선택 값을 임시 값에 복사
const openTimeModal = () => {
  tempSelectedDay.value = selectedDay.value
  tempSelectedMeridiem.value = selectedMeridiem.value
  tempSelectedHour.value = selectedHour.value
  tempSelectedMinute.value = selectedMinute.value
  showTimeModal.value = true
}

const switchLocations = () => {
  const tempDeparture = departureName.value
  departureName.value = destinationName.value
  destinationName.value = tempDeparture
}

const confirmTime = () => {
  selectedDay.value = tempSelectedDay.value
  selectedMeridiem.value = tempSelectedMeridiem.value
  selectedHour.value = tempSelectedHour.value
  selectedMinute.value = tempSelectedMinute.value

  const month = new Date().getMonth() + 1
  const day =
    selectedDay.value === 'today'
      ? new Date().getDate()
      : selectedDay.value === 'tomorrow'
      ? new Date().getDate() + 1
      : selectedDay.value
  const hour =
    selectedMeridiem.value === 'PM'
      ? selectedHour.value + 12
      : selectedHour.value
  const minute = selectedMinute.value
  store.commit('time/setTime', { month, day, hour, minute })
  showTimeModal.value = false
}

// 닫기 버튼 클릭 시 임시 값을 초기화하고 모달 닫기
const closeTimeModal = () => {
  showTimeModal.value = false
}

const generateDateOptions = () => {
  const now = new Date()
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  dateOptions.value = [
    { text: '오늘', value: 'today' },
    { text: '내일', value: 'tomorrow' }
  ]
  for (let i = 2; i <= endOfMonth - now.getDate(); i++) {
    const futureDate = new Date()
    futureDate.setDate(now.getDate() + i)
    dateOptions.value.push({
      text: `${futureDate.getMonth() + 1}월 ${futureDate.getDate()}일`,
      value: `${futureDate.getDate()}`
    })
  }
}

onMounted(() => {
  setCurrentTime()
  generateDateOptions()
})

const goToSearchDeparture = () => router.push({ path: '/search-departure' })
const goToSearchDestination = () => router.push({ path: '/search-destination' })
</script>

<style scoped>
@import '@fortawesome/fontawesome-free/css/all.css';

* {
  font-family: 'Pretendard', sans-serif;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group label i {
  font-size: 18px;
  color: #333;
}

.input-group input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

/* 실시간 버튼 스타일 */
.realtime-button {
  padding: 8px 10px;
  background-color: #e5c7c7;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.realtime-button:hover {
  background-color: #d8b4b4;
}

/* 출발지와 도착지 바꾸기 버튼 스타일 */
.switch-button-container {
  display: flex;
  justify-content: center;
}

.switch-button {
  padding: 10px 20px;
  background-color: #f3c1c1;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.switch-button:hover {
  background-color: #e5b1b1;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h3 {
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
}

.horizontal-pickers {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
  height: 150px;
  width: 30%;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 5px;
}

.picker button {
  width: 100%;
  margin: 3px 0;
  padding: 6px 8px;
  text-align: center;
  white-space: nowrap;
  background-color: transparent;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s, color 0.3s;
  font-size: 12px;
  color: #000;
}

.picker button:hover {
  background-color: #f0f0f0;
}

.picker button.selected {
  background-color: #ab6c6c;
  color: #fff;
  font-weight: bold;
}

.meridiem-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 20%;
}

.time-picker {
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
  width: 40%;
}

.scrollable {
  height: 100px;
  overflow-y: auto;
  text-align: center;
  width: 40px;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 5px;
  scrollbar-width: none; /* For Firefox */
  -ms-overflow-style: none; /* For Internet Explorer and Edge */
}

.scrollable::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.time-option {
  padding: 6px 0;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 5px;
}

.time-option:hover {
  background-color: #f0f0f0;
}

.time-option.selected {
  background-color: #ab6c6c;
  color: #fff;
  font-weight: bold;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background-color: #e5c7c7;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 12px;
}

button:hover {
  background-color: #d8b4b4;
}

button:active {
  transform: scale(0.98);
}

button.selected {
  background-color: #d8b4b4;
}

.modal-button {
  margin-top: 10px;
  width: 100%;
}

.meridiem-picker button {
  background-color: #f3f4f6;
  color: #4b5563;
}

.meridiem-picker button:hover {
  background-color: #e5e7eb;
}

.meridiem-picker button.selected {
  background-color: #e5c7c7;
  color: white;
}

.modal-button.primary {
  background-color: #e5c7c7;
  color: white;
}

.modal-button.primary:hover {
  background-color: #d8b4b4;
}

.modal-button.secondary {
  background-color: #f3f4f6;
  color: #4b5563;
}

.modal-button.secondary:hover {
  background-color: #e5e7eb;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 425px) {
  .modal-content {
    padding: 15px;
  }

  .picker {
    height: 120px;
  }

  .scrollable {
    height: 80px;
    width: 35px;
  }

  button {
    padding: 6px 12px;
  }
}

#date-picker {
  width: 30%;
}

.clear-button {
  background: none;
  border: none;
  font-size: 16px;
  color: #888;
  cursor: pointer;
}
.recent-routes h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.recent-routes ul {
  list-style: none;
  padding: 0;
}

.recent-routes li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  cursor: pointer;
}

.recent-routes li span:hover {
  text-decoration: underline;
}

.recent-routes li button {
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}
</style>
