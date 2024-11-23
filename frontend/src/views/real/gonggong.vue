<template>
  <div class="app">
    <h1>버스 도착 정보 조회</h1>
    <div v-if="busInfo.length > 0">
      <div v-for="(info, index) in busInfo" :key="index" class="bus-info-card">
        <h2>정류소명: {{ info.stNm }} (ID: {{ info.stId }})</h2>
        <p>노선명: {{ info.rtNm }} | 노선 ID: {{ info.busRouteId }}</p>
        <p>정류소 순번: {{ info.staOrd }}</p>
        <p>첫 번째 도착 예정: {{ info.arrmsg1 }}</p>
        <p>두 번째 도착 예정: {{ info.arrmsg2 }}</p>
        <p>혼잡도 (첫 번째): {{ getCongestion(info.brdrde_Num1) }}</p>
        <p>혼잡도 (두 번째): {{ getCongestion(info.brdrde_Num2) }}</p>
        <p>차량유형 (첫 번째): {{ getBusType(info.busType1) }}</p>
        <p>차량유형 (두 번째): {{ getBusType(info.busType2) }}</p>
        <p>우회여부: {{ info.deTourAt === '00' ? '정상' : '우회' }}</p>
      </div>
    </div>
    <div v-else>
      <p>도착 정보를 불러오는 중입니다...</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      busInfo: [],
      busRouteId: '107000007' // 임시 노선 ID
    }
  },
  mounted() {
    this.fetchBusInfo()
  },
  methods: {
    async fetchBusInfo() {
      const url = `http://localhost:3000/api/bus-info?busRouteId=${this.busRouteId}`

      try {
        const response = await fetch(url)
        const data = await response.text()

        console.log('API에서 받은 원본 데이터:', data)

        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(data, 'text/xml')

        // XML 구조 전체 출력
        console.log('XML Document Root Element:', xmlDoc.documentElement)

        const serviceResult = xmlDoc.getElementsByTagName('ServiceResult')[0]
        if (!serviceResult) {
          console.error('ServiceResult 요소를 찾을 수 없습니다.')
          return
        }

        const msgBody = serviceResult.getElementsByTagName('msgBody')[0]
        if (!msgBody) {
          console.error('msgBody 요소를 찾을 수 없습니다.')
          return
        }

        const items = msgBody.getElementsByTagName('itemList')
        console.log('itemList 요소:', items)

        this.busInfo = Array.from(items).map((item) => {
          const parsedItem = {
            stNm: item.querySelector('stNm')?.textContent || '',
            stId: item.querySelector('stId')?.textContent || '',
            rtNm: item.querySelector('rtNm')?.textContent || '',
            busRouteId: item.querySelector('busRouteId')?.textContent || '',
            staOrd: item.querySelector('staOrd')?.textContent || '',
            arrmsg1: item.querySelector('arrmsg1')?.textContent || '정보 없음',
            arrmsg2: item.querySelector('arrmsg2')?.textContent || '정보 없음',
            brdrde_Num1:
              item.querySelector('brdrde_Num1')?.textContent || '정보 없음',
            brdrde_Num2:
              item.querySelector('brdrde_Num2')?.textContent || '정보 없음',
            busType1:
              item.querySelector('busType1')?.textContent || '정보 없음',
            busType2:
              item.querySelector('busType2')?.textContent || '정보 없음',
            deTourAt: item.querySelector('deTourAt')?.textContent || '정보 없음'
          }
          console.log('파싱된 itemList 항목:', parsedItem)
          return parsedItem
        })

        console.log('최종 busInfo 데이터:', this.busInfo)
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error)
      }
    },
    getCongestion(congestionCode) {
      const congestionLevels = {
        0: '데이터 없음',
        3: '여유',
        4: '보통',
        5: '혼잡'
      }
      return congestionLevels[congestionCode] || '알 수 없음'
    },
    getBusType(typeCode) {
      const busTypes = {
        0: '일반버스',
        1: '저상버스',
        2: '굴절버스'
      }
      return busTypes[typeCode] || '알 수 없음'
    }
  }
}
</script>

<style scoped>
.app {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
.bus-info-card {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.bus-info-card h2 {
  font-size: 18px;
  margin: 0 0 10px;
}
.bus-info-card p {
  margin: 4px 0;
  font-size: 14px;
}
</style>
