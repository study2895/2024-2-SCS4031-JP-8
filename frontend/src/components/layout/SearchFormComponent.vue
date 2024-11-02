<template>
  <div class="search-form">
    <div class="input-group">
      <label>출발지:</label>
      <input
        v-model="departureName"
        placeholder="출발지를 입력하세요"
        @focus="goToSearchDeparture"
        readonly
      />
    </div>
    <div class="input-group">
      <label>도착지:</label>
      <input
        v-model="destinationName"
        placeholder="도착지를 입력하세요"
        @focus="goToSearchDestination"
        readonly
      />
    </div>
    <div class="input-group">
      <label>출발 시각:</label>
      <input :value="formattedTime" @click="showTimeModal = true" readonly />
    </div>

    <!-- 출발 시각 설정 모달 -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showTimeModal" class="modal">
          <div class="modal-content">
            <h3>출발 시각 설정</h3>
            <div class="horizontal-pickers">
              <!-- 날짜 선택 -->
              <div id="date-picker" class="picker scrollable">
                <button
                  v-for="(day, index) in dateOptions"
                  :key="index"
                  @click="selectDay(day.value)"
                  :class="{ selected: selectedDay === day.value }"
                >
                  {{ day.text }}
                </button>
              </div>
              <!-- 시간과 분 선택 -->
              <div class="time-picker">
                <div class="scrollable">
                  <div
                    v-for="hour in 12"
                    :key="hour"
                    class="time-option"
                    :class="{ selected: selectedHour === hour }"
                    @click="selectedHour = hour"
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
                    :class="{ selected: selectedMinute === (minute - 1) * 10 }"
                    @click="selectedMinute = (minute - 1) * 10"
                  >
                    {{ (minute - 1) * 10 }}
                  </div>
                </div>
                <span>분</span>
              </div>
              <!-- 오전/오후 선택 -->
              <div class="meridiem-picker">
                <button
                  @click="selectMeridiem('AM')"
                  :class="{ selected: selectedMeridiem === 'AM' }"
                >
                  오전
                </button>
                <button
                  @click="selectMeridiem('PM')"
                  :class="{ selected: selectedMeridiem === 'PM' }"
                >
                  오후
                </button>
              </div>
            </div>
            <button @click="updateTime" class="modal-button primary">
              설정
            </button>
            <button
              @click="showTimeModal = false"
              class="modal-button secondary"
            >
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
const dateOptions = ref([])

// 출발지와 도착지 이름
const departureName = computed(
  () => store.state.departure.departure?.name || ''
)
const destinationName = computed(
  () => store.state.destination.destination?.name || ''
)

// 선택된 출발 시각을 포맷하여 표시
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

// 현재 시간을 기본값으로 설정
const setCurrentTime = () => {
  const now = new Date()
  selectedDay.value = 'today'
  selectedMeridiem.value = now.getHours() >= 12 ? 'PM' : 'AM'
  selectedHour.value = now.getHours() % 12 || 12
  selectedMinute.value = now.getMinutes()
}

// 날짜, 시간, 오전/오후 선택 처리 함수
const selectDay = (day) => (selectedDay.value = day)
const selectMeridiem = (meridiem) => (selectedMeridiem.value = meridiem)

// 시간을 Vuex에 저장하고 모달 닫기
const updateTime = () => {
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

// 날짜 옵션 생성
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

// 출발지와 도착지 검색 페이지로 이동하는 함수
const goToSearchDeparture = () => router.push({ name: 'SearchDeparturePage' })
const goToSearchDestination = () =>
  router.push({ name: 'SearchDestinationPage' })
</script>

<style scoped>
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
  flex-direction: column;
  gap: 5px;
}

.input-group label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.input-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
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
  background-color: #000;
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
  background-color: #000;
  color: #fff;
  font-weight: bold;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background-color: #3182f6;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 12px;
}

button:hover {
  background-color: #1c64f2;
}

button:active {
  transform: scale(0.98);
}

button.selected {
  background-color: #1c64f2;
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
  background-color: #3182f6;
  color: white;
}

.modal-button.primary {
  background-color: #3182f6;
  color: white;
}

.modal-button.primary:hover {
  background-color: #1c64f2;
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
</style>
