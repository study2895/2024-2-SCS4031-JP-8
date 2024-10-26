const express = require('express')
const path = require('path')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT || 8000 // 배포 환경의 포트를 사용하거나 기본 포트 8000을 사용

app.use(cors())

// 네이버 지역 검색 API
app.get('/api/search', async (req, res) => {
  const query = req.query.query
  const URL = 'https://openapi.naver.com/v1/search/local.json'
  const clientId = 'qn6oN_8vmRm9rGqvyxGH'
  const clientSecret = 'GBV7mIqujK'

  try {
    const response = await axios.get(URL, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      },
      params: {
        query: query,
        display: 5,
        start: 1,
        sort: 'random'
      }
    })
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ message: 'API 요청 중 오류 발생', error })
  }
})

// 정적 파일 제공 (배포 환경)
app.use(express.static(path.join(__dirname, 'dist')))

// 모든 경로에 대해 index.html 반환 (Vue 라우팅 대응)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
})
