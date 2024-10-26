<template>
  <section class="favorites-section">
    <h2>즐겨찾기</h2>
    <ul class="bus-list">
      <FavoriteItem
        v-for="(favorite, index) in favorites"
        :key="index"
        :favorite="favorite"
      />
    </ul>
  </section>
</template>

<script setup>
import { defineProps } from 'vue'
import FavoriteItem from './FavoriteItem.vue'

defineProps({
  favorites: {
    type: Array,
    required: true
  }
})
</script>

<style scoped>
.favorites-section {
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
