<script>
import axios from 'axios'

export default {
  data() {
    return {
      searchResults: [],
      query: ''
    }
  },

  methods: {
    // Express 서버를 통한 API 호출
    searchLocal() {
      const URL = 'http://localhost:5000/api/search' // Express 서버 URL

      console.log('검색어:', this.query)

      axios
        .get(URL, {
          params: {
            query: this.query // 사용자 입력 값
          }
        })
        .then((response) => {
          console.log('API 응답:', response)
          this.searchResults = response.data.items.map((item) => {
            return {
              ...item,
              title: item.title.replace(/<\/?b>/g, ''), // <b> 태그 제거
              description: item.description.replace(/<\/?b>/g, '') // <b> 태그 제거
            }
          })
          console.log('검색 결과:', this.searchResults)
        })
        .catch((error) => {
          console.error('API 요청 중 오류 발생:', error)
        })
    }
  }
}
</script>

<template>
  <div class="container">
    <input v-model="query" placeholder="검색어를 입력하세요" />
    <button @click="searchLocal">검색</button>

    <div v-if="searchResults.length > 0" class="results-container">
      <h3>검색 결과:</h3>
      <ul class="result-list">
        <li v-for="item in searchResults" :key="item.title" class="result-item">
          <strong>{{ item.title }}</strong
          ><br />
          카테고리: {{ item.category }}<br />
          주소: {{ item.address }} ({{ item.roadAddress }})<br />
          설명: {{ item.description }}<br />
          <a :href="item.link" target="_blank">자세히 보기</a><br />
          좌표: X {{ item.mapx }}, Y {{ item.mapy }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 60%;
  margin: 0 auto;
}

input {
  padding: 10px;
  margin-right: 10px;
  width: 70%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 15px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.results-container {
  margin-top: 20px;
}

.result-list {
  list-style-type: none;
  padding: 0;
}

.result-item {
  background-color: #f9f9f9;
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.result-item strong {
  font-size: 18px;
  color: #333;
}

.result-item a {
  color: #4caf50;
  text-decoration: none;
}

.result-item a:hover {
  text-decoration: underline;
}
</style>
