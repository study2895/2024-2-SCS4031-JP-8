// const express = require('express')
// const path = require('path')
// const app = express()

// // 빌드된 정적 파일 제공
// app.use(express.static(path.join(__dirname, 'dist')))

// // 모든 요청에 대해 index.html 반환
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'))
// })

// // 포트 설정
// const PORT = process.env.PORT || 8000 // Koyeb가 제공하는 포트 사용
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`)
// })

const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
const PORT = 5000

app.use(cors())

//네이버 지역 검색 API
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

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
})
