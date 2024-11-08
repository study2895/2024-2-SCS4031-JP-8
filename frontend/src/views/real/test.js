// 이전 페이지에서 다음 페이지로 데이터를 전달할 때
this.$router.push({
  path: '/next-page',
  query: {
    date: selectedDate,
    time: selectedTime,
    routeNumber: selectedRouteNumber,
    direction: selectedDirection,
    startX: startCoordinates.x,
    startY: startCoordinates.y
  }
})

// 프론트엔드의 config.js 또는 상수 파일
export const busIds = {
  '5000A': '123',
  '5000B': '456',
  6001: '789',
  1112: '1011'
}

// 가져와서 사용 시
const localBusId = busIds[routeNumber] // routeNumber는 전달받은 노선번호

import axios from 'axios'

async function fetchRouteData(date, time, routeNumber, direction) {
  try {
    const response = await axios.post(
      'https://your-backend-url/api/pathfinding',
      {
        date,
        time,
        routeNumber,
        direction
      }
    )
    return response.data // 백엔드에서 가져온 정류장 정보
  } catch (error) {
    console.error('Error fetching route data:', error)
  }
}

async function fetchStationData(stationName) {
  try {
    const response = await axios.get(
      'https://api.odsay.com/v1/api/searchStation',
      {
        params: {
          name: stationName,
          apiKey: 'YOUR_ODSAY_API_KEY'
        }
      }
    )
    return response.data // 고유번호와 좌표 포함 데이터
  } catch (error) {
    console.error('Error fetching station data:', error)
  }
}

// 평균 λ값을 바탕으로 Poisson 확률 계산
function poissonProbability(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)
}

function factorial(n) {
  return n ? n * factorial(n - 1) : 1
}

// 사용 예시
const probability = poissonProbability(4, 3) // 평균이 4명일 때 3명이 발생할 확률

function filterStationsByProbability(stations, threshold) {
  return stations.filter((station) => station.probability >= threshold)
}

// 사용 예시
const filteredStations = filterStationsByProbability(stationData, 0.5)

async function fetchRouteToStation(startX, startY, endX, endY) {
  try {
    const response = await axios.get(
      'https://api.odsay.com/v1/api/searchPubTransPathT',
      {
        params: {
          SX: startX,
          SY: startY,
          EX: endX,
          EY: endY,
          apiKey: 'YOUR_ODSAY_API_KEY'
        }
      }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching route to station:', error)
  }
}

// 경로 호출 예시
const routeToStation = await fetchRouteToStation(
  startX,
  startY,
  stationX,
  stationY
)

function sortStations(stations) {
  // 확률순, 동일 확률이면 통행시간순
  return stations.sort((a, b) => {
    if (a.probability === b.probability) {
      return a.travelTime - b.travelTime
    }
    return b.probability - a.probability
  })
}

// 사용 예시
const sortedStations = sortStations(filteredStations)

// 각 정류장 x,y 좌표와 최종 경로 정보를 전달
this.$router.push({
  path: '/final-path-page',
  query: {
    startX: startCoordinates.x,
    startY: startCoordinates.y,
    stations: JSON.stringify(stations),
    destinationX: destinationCoordinates.x,
    destinationY: destinationCoordinates.y
  }
})
