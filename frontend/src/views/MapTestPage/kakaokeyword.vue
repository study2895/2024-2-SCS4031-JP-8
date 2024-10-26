<template>
  <div class="background">
    <div class="mobile-container">
      <header>
        <div class="header-content">
          <h1>키워드로 장소 검색</h1>
        </div>
      </header>

      <section class="search-section">
        <input
          type="text"
          v-model="keyword"
          placeholder="검색어를 입력하세요"
          @keyup.enter="searchPlaces"
        />
        <button @click="searchPlaces">검색하기</button>
      </section>

      <section class="result-section">
        <ul v-if="places && places.length > 0">
          <li v-for="(place, index) in places" :key="index" class="place-card">
            <h3>{{ place.place_name }}</h3>
            <p>카테고리: {{ place.category_name }}</p>
            <p>주소: {{ place.address_name || '지번 정보 없음' }}</p>
            <p>
              도로명 주소: {{ place.road_address_name || '도로명 정보 없음' }}
            </p>
            <p>전화번호: {{ place.phone || '전화번호 없음' }}</p>
            <p>좌표: (X: {{ place.x }}, Y: {{ place.y }})</p>
            <p>
              <a :href="place.place_url" target="_blank">상세 페이지로 이동</a>
            </p>
          </li>
        </ul>
        <p v-else>검색 결과가 없습니다.</p>
      </section>

      <footer>
        <p>소중한 제주의 자연을 지켜요</p>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      keyword: '',
      places: [] // 검색 결과를 저장할 배열
    }
  },
  methods: {
    async searchPlaces() {
      if (!this.keyword.trim()) {
        alert('키워드를 입력해주세요!')
        return
      }

      try {
        // 카카오 API 요청
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
            this.keyword
          )}`,
          {
            headers: {
              Authorization: `KakaoAK 2372890c7cae057635e6427bc7d7918f` // API 키 직접 삽입
            }
          }
        )

        // 응답이 정상적인지 확인
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // API 응답에서 검색 결과를 places 배열에 저장
        this.places = data.documents
      } catch (error) {
        console.error('검색 중 오류가 발생했습니다.', error)
        alert('검색 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    }
  }
}
</script>

<style scoped>
* {
  font-family: 'Pretendard', sans-serif;
}

/* Background setup */
.background {
  background-color: #eaeaea;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

/* Mobile Container */
.mobile-container {
  width: 100%;
  max-width: 395px;
  margin: 0 auto;
  padding: 25px;
  background-color: white;
  overflow-y: auto;
  height: 100vh;
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
}

.header-content h1 {
  font-size: 18px;
}

/* Search Section */
.search-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.search-section input {
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.search-section button {
  padding: 10px;
  background-color: #eaeaea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.search-section button:hover {
  background-color: #969696;
}

/* Result Section */
.result-section {
  display: flex;
  flex-direction: column;
}

.place-card {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 15px;
}

.place-card h3 {
  font-size: 16px;
}

.place-card p {
  font-size: 14px;
  margin: 5px 0;
}

/* Footer */
footer {
  text-align: center;
  padding-top: 20px;
}
</style>
