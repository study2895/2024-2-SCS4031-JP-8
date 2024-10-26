<template>
  <footer class="mt-12 bg-white border-t border-gray-200">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex items-center justify-between py-3">
        <h2 class="text-base font-semibold text-gray-800">버스미리</h2>
        <button
          @click="toggleExpand"
          class="text-gray-500 transition-colors duration-200 hover:text-orange-500"
        >
          <ChevronIcon :isExpanded="isExpanded" />
        </button>
      </div>

      <div
        :class="[
          'overflow-hidden transition-all duration-300',
          { 'max-h-80': isExpanded, 'max-h-0': !isExpanded }
        ]"
      >
        <div
          class="grid grid-cols-1 gap-4 py-3 border-t border-gray-200 md:grid-cols-2"
        >
          <div>
            <h3 class="mb-1 text-xs font-semibold text-gray-700">빠른 링크</h3>
            <ul class="space-y-1">
              <li>
                <a
                  href="#"
                  class="text-xs text-gray-600 transition-colors duration-200 hover:text-orange-500"
                  >노선도</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-xs text-gray-600 transition-colors duration-200 hover:text-orange-500"
                  >요금 정보</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-xs text-gray-600 transition-colors duration-200 hover:text-orange-500"
                  >공지사항</a
                >
              </li>
              <li>
                <a
                  href="#"
                  class="text-xs text-gray-600 transition-colors duration-200 hover:text-orange-500"
                  >고객 지원</a
                >
              </li>
            </ul>
          </div>
          <div>
            <h3 class="mb-1 text-xs font-semibold text-gray-700">연락처</h3>
            <p class="text-xs text-gray-600">고객센터: 1588-0000</p>
            <p class="text-xs text-gray-600">이메일: support@busmiri.com</p>
            <div class="flex mt-2 space-x-3">
              <a
                href="#"
                class="text-gray-400 transition-colors duration-200 hover:text-orange-500"
              >
                <FacebookIcon />
              </a>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-200 hover:text-orange-500"
              >
                <TwitterIcon />
              </a>
              <a
                href="#"
                class="text-gray-400 transition-colors duration-200 hover:text-orange-500"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="py-3 text-xs text-center border-t border-gray-200">
        <p class="text-gray-600">&copy; 2024 버스미리. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from 'vue'
import {
  ChevronIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon
} from '@/utils/icons'

const isExpanded = ref(false)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}
</script>
