<template>
  <section class="recent-search">
    <h2>최근 검색</h2>
    <ul class="bus-list">
      <RecentSearchItem
        v-for="(bus, index) in recentSearches"
        :key="index"
        :bus="bus"
        @delete="$emit('delete', index)"
      />
    </ul>
  </section>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import RecentSearchItem from './RecentSearchItem.vue'

defineProps({
  recentSearches: {
    type: Array,
    required: true
  }
})

defineEmits(['delete'])
</script>

<style scoped>
.recent-search {
  margin-top: 24px;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #5b5b5b;
}

.bus-list {
  list-style-type: none;
  padding: 0;
}
</style>
