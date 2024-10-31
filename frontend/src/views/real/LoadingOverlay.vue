<!-- src/components/LoadingOverlay.vue -->
<template>
  <div v-if="isVisible" class="loading-overlay">
    <div class="loading-spinner">
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      default: '잠시만 기다려 주세요...'
    }
  }
}
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  color: #fff;
  font-size: 18px;
  text-align: center;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
}
</style>
