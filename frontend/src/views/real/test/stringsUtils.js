// 정류장명에서 공백과 특수문자 제거
export function sanitizeStationName(stationName) {
  return stationName.replace(/[.,\s]/g, '')
}
