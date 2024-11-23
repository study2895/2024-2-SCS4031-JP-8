export function calculatePoissonProbability({
  passengerData,
  timeSlot,
  realTimeData,
  stations
}) {
  const { firstBus, secondBus } = realTimeData
  const remainSeats =
    firstBus.predictTime <= 10 && secondBus.predictTime <= 10
      ? firstBus.remainSeats + secondBus.remainSeats
      : firstBus.remainSeats

  const probabilities = stations.map((station, index) => {
    const avgPass = parseFloat(passengerData[station.name]?.[timeSlot] || 0)
    const totalPass = avgPass * (60 / 15) // 총 승차 인원
    const prob =
      totalPass - remainSeats <= 0
        ? 1
        : poissonFormula(totalPass - remainSeats, totalPass)
    return { name: station.name, probability: (prob * 100).toFixed(2) }
  })

  return probabilities
}

function poissonFormula(k, lambda) {
  const factorial = (n) => (n === 0 ? 1 : n * factorial(n - 1))
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k)
}
