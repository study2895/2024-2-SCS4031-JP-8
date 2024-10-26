<template>
  <li>
    <div class="bus-info">
      <BusIcon />
      <span class="bus-number">{{ bus.number }}번</span>
      <span class="bus-description">{{ bus.description }}</span>
    </div>
    <span class="bus-status" @click="$emit('delete')">삭제</span>
  </li>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import BusIcon from '@/assets/Icons/BusIcon.vue'

defineProps({
  bus: {
    type: Object,
    required: true
  }
})

defineEmits(['delete'])
</script>

<style scoped>
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f5;
}

.bus-info {
  display: flex;
  align-items: center;
}

.bus-icon {
  margin-right: 8px;
}

.bus-number {
  font-weight: 700;
  font-size: 14px;
  margin-right: 8px;
  color: #5b5b5b;
}

.bus-description {
  font-size: 12px;
  color: #8b8b8b;
}

.bus-status {
  color: #f24e1e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
</style>
