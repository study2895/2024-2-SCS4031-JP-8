<template>
  <li
    class="favorite-item"
    :class="{ 'favorite-item-simple': favorite.simple }"
  >
    <div class="bus-info">
      <BusIcon />
      <div class="bus-details">
        <div class="bus-number">
          {{ favorite.number }}번
          <span class="bus-description">{{ favorite.description }}</span>
        </div>
      </div>
    </div>
    <div v-if="!favorite.simple" class="favorite-content">
      <div class="stop-info">
        <span class="recommendation">추천</span>
        <span class="stop-name">
          {{ favorite.stopName }}
          <span class="stop-number">{{ favorite.stopNumber }}</span>
        </span>
      </div>
      <div class="arrival-info">
        <div
          v-for="(arrival, arrivalIndex) in favorite.arrivals"
          :key="arrivalIndex"
          class="arrival-row"
        >
          <div class="bus-type">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="19"
              viewBox="0 0 16 19"
              fill="none"
              class="bus-icon"
            >
              <path
                d="M14 9H2V4H14M12.5 15C12.1022 15 11.7206 14.842 11.4393 14.5607C11.158 14.2794 11 13.8978 11 13.5C11 13.1022 11.158 12.7206 11.4393 12.4393C11.7206 12.158 12.1022 12 12.5 12C12.8978 12 13.2794 12.158 13.5607 12.4393C13.842 12.7206 14 13.1022 14 13.5C14 13.8978 13.842 14.2794 13.5607 14.5607C13.2794 14.842 12.8978 15 12.5 15ZM3.5 15C3.10218 15 2.72064 14.842 2.43934 14.5607C2.15804 14.2794 2 13.8978 2 13.5C2 13.1022 2.15804 12.7206 2.43934 12.4393C2.72064 12.158 3.10218 12 3.5 12C3.89782 12 4.27936 12.158 4.56066 12.4393C4.84196 12.7206 5 13.1022 5 13.5C5 13.8978 4.84196 14.2794 4.56066 14.5607C4.27936 14.842 3.89782 15 3.5 15ZM0 14C0 14.88 0.39 15.67 1 16.22V18C1 18.2652 1.10536 18.5196 1.29289 18.7071C1.48043 18.8946 1.73478 19 2 19H3C3.26522 19 3.51957 18.8946 3.70711 18.7071C3.89464 18.5196 4 18.2652 4 18V17H12V18C12 18.2652 12.1054 18.5196 12.2929 18.7071C12.4804 18.8946 12.7348 19 13 19H14C14.2652 19 14.5196 18.8946 14.7071 18.7071C14.8946 18.5196 15 18.2652 15 18V16.22C15.61 15.67 16 14.88 16 14V4C16 0.5 12.42 0 8 0C3.58 0 0 0.5 0 4V14Z"
                fill="#F24E1E"
              />
            </svg>
            <span>{{ arrival.busNumber }}</span>
          </div>
          <span class="arrival-time">{{ arrival.arrivalInfo }}</span>
        </div>
      </div>
    </div>
    <div v-if="!favorite.simple" class="additional-info">
      <div class="occupancy">예측 혼잡도 : {{ favorite.occupancy }}%</div>
      <div class="travel-time">
        통행시간 {{ favorite.travelTime }}분 | 예상 대기시간
        {{ favorite.waitTime }}분
      </div>
    </div>
  </li>
</template>

<script setup>
import { defineProps } from 'vue'
import BusIcon from '@/assets/Icons/BusIcon.vue'

defineProps({
  favorite: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.favorite-item {
  background-color: #f9f6f6;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.favorite-item > * {
  margin-bottom: 12px;
}

.favorite-item > *:last-child {
  margin-bottom: 0;
}

.bus-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.bus-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.bus-details {
  display: flex;
  flex-direction: column;
}

.bus-number {
  font-weight: 700;
  font-size: 16px;
  display: flex;
  align-items: center;
  color: #333333;
}

.bus-description {
  font-size: 12px;
  color: #666666;
  font-weight: normal;
  margin-left: 8px;
}

.favorite-content {
  text-align: left;
  padding: 0;
}

.stop-info {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.recommendation {
  font-size: 12px;
  font-weight: 600;
  color: #1e53f2;
  margin-bottom: 4px;
}

.stop-name {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
}

.stop-number {
  font-size: 12px;
  color: #666666;
  font-weight: 400;
  margin-left: 4px;
}

.arrival-info {
  margin-bottom: 16px;
}

.arrival-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.bus-type {
  font-weight: 600;
  display: flex;
  align-items: center;
  color: #333333;
}

.bus-type svg {
  margin-right: 6px;
}

.arrival-time {
  color: #333333;
}

.additional-info {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.occupancy {
  font-size: 14px;
  font-weight: 600;
  color: #f24e1e;
  margin-bottom: 6px;
}

.travel-time {
  font-size: 12px;
  color: #666666;
}

.favorite-item-simple {
  padding: 12px 16px;
}

.favorite-item-simple .bus-info {
  margin-bottom: 0;
}
</style>
