import { getBusRouteList } from './API/gyeonggiBusAPI'

export function performSearch(
  query,
  isGyeonggiToSeoul,
  recentSearches,
  router,
  store
) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getBusRouteList(query)
      console.log('API 결과: ', result)

      const busInfo = {
        number: query,
        description: `${result.regionName} - ${result.routeTypeName}`
      }

      // Vuex에 검색 결과 저장
      store.dispatch('search/setResults', result)

      // 최근 검색 저장
      recentSearches.unshift(busInfo)
      recentSearches = recentSearches.slice(0, 5) // 최대 5개 기록 저장
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches))

      // 검색 결과 페이지로 라우팅
      router.push({
        name: 'BusSearchResults',
        query: {
          q: query,
          direction: isGyeonggiToSeoul
            ? 'gyeonggi-to-seoul'
            : 'seoul-to-gyeonggi'
        }
      })

      resolve(result)
    } catch (error) {
      console.error('Error fetching bus route data:', error)
      reject(error)
    }
  })
}
