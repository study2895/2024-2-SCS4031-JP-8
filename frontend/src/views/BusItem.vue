<template>
  <div
    class="bus-item"
    :class="{ 'bus-item-active': isActive }"
    @click="$emit('select')"
  >
    <div class="bus-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="19"
        viewBox="0 0 16 19"
        fill="none"
      >
        <path
          d="M14 9H2V4H14M12.5 15C12.1022 15 11.7206 14.842 11.4393 14.5607C11.158 14.2794 11 13.8978 11 13.5C11 13.1022 11.158 12.7206 11.4393 12.4393C11.7206 12.158 12.1022 12 12.5 12C12.8978 12 13.2794 12.158 13.5607 12.4393C13.842 12.7206 14 13.1022 14 13.5C14 13.8978 13.842 14.2794 13.5607 14.5607C13.2794 14.842 12.8978 15 12.5 15ZM3.5 15C3.10218 15 2.72064 14.842 2.43934 14.5607C2.15804 14.2794 2 13.8978 2 13.5C2 13.1022 2.15804 12.7206 2.43934 12.4393C2.72064 12.158 3.10218 12 3.5 12C3.89782 12 4.27936 12.158 4.56066 12.4393C4.84196 12.7206 5 13.1022 5 13.5C5 13.8978 4.84196 14.2794 4.56066 14.5607C4.27936 14.842 3.89782 15 3.5 15ZM0 14C0 14.88 0.39 15.67 1 16.22V18C1 18.2652 1.10536 18.5196 1.29289 18.7071C1.48043 18.8946 1.73478 19 2 19H3C3.26522 19 3.51957 18.8946 3.70711 18.7071C3.89464 18.5196 4 18.2652 4 18V17H12V18C12 18.2652 12.1054 18.5196 12.2929 18.7071C12.4804 18.8946 12.7348 19 13 19H14C14.2652 19 14.5196 18.8946 14.7071 18.7071C14.8946 18.5196 15 18.2652 15 18V16.22C15.61 15.67 16 14.88 16 14V4C16 0.5 12.42 0 8 0C3.58 0 0 0.5 0 4V14Z"
          fill="#F24E1E"
        />
      </svg>
    </div>
    <div class="bus-info">
      <div class="bus-number">{{ number }}번</div>
      <div class="bus-route">{{ route }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  number: {
    type: String,
    required: true
  },
  route: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>

<style scoped>
.bus-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  animation: fadeIn 0.3s ease-out;
}

.bus-item:hover {
  background-color: #f9f6f6;
}

.bus-item-active {
  background-color: #fff0ed;
}

.bus-icon {
  margin-right: 12px;
}

.bus-info {
  flex: 1;
}

.bus-number {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.bus-route {
  font-size: 14px;
  color: #757575;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
