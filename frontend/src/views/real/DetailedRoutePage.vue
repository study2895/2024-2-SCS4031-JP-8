<template>
  <div>
    <h1>Detailed Route</h1>
    <p>Route from {{ departure }} to {{ stop }}</p>
    <p>Route from {{ stop }} to {{ destination }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    departure() {
      return this.$route.query.departure
    },
    destination() {
      return this.$route.query.destination
    },
    stop() {
      return this.$route.query.stop
    }
  }
}
</script>
