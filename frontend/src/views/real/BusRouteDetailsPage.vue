<template>
  <div>
    <h1>Bus Route Details</h1>
    <p>Showing stops for Bus 5005</p>
    <ul>
      <li v-for="stop in stops" :key="stop.id">
        {{ stop.name }} (Seats: {{ stop.seatsAvailable }}, Crowdedness:
        {{ stop.crowdedness }})
        <button @click="goToDetailedRoute(stop)">Find Route</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stops: [
        { id: 1, name: 'Stop 1', seatsAvailable: 20, crowdedness: 'Low' }, // 임시 데이터
        { id: 2, name: 'Stop 2', seatsAvailable: 15, crowdedness: 'Medium' }, // 임시 데이터
        { id: 3, name: 'Stop 3', seatsAvailable: 5, crowdedness: 'High' } // 임시 데이터
      ]
    }
  },
  methods: {
    goToDetailedRoute(stop) {
      this.$router.push({
        path: '/detailed-route',
        query: {
          departure: this.$route.query.departure,
          destination: this.$route.query.destination,
          stop: stop.name
        }
      })
    }
  }
}
</script>
