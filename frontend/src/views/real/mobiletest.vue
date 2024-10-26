<template>
  <div class="background">
    <div class="mobile-container">
      <header>
        <div class="header-content">
          <h1>오늘 제주 날씨</h1>
          <p>20°C</p>
        </div>
        <div class="header-content">
          <h1>내가 다녀온 오름 보기</h1>
          <p>→</p>
        </div>
      </header>
      <section class="card-section">
        <div class="card">
          <h2>오름 추천</h2>
          <p>여행 계절에 맞는 오름</p>
          <span>→</span>
        </div>
        <div class="card">
          <h2>오름 추천</h2>
          <p>여행 계절에 맞는 오름</p>
          <span>→</span>
        </div>
        <div class="card">
          <h2>오름 추천</h2>
          <p>여행 계절에 맞는 오름</p>
          <span>→</span>
        </div>
      </section>
      <footer>
        <p>소중한 제주의 자연을 지켜요</p>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobilePage'
}
</script>

<style scoped>
* {
  font-family: 'Pretendard', sans-serif;
}
/* Background setup */
.background {
  background-color: #eaeaea; /* Modify to match the fixed background color */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

/* Mobile Container */
.mobile-container {
  width: 100%;
  max-width: 395px; /* Center width of 395px */
  margin: 0 auto;
  padding: 25px;
  background-color: white;
  overflow-y: auto; /* Makes the content scrollable */
  height: 100vh;
}

/* Header and Card Section */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
}

.header-content h1,
.card h2 {
  font-size: 18px;
}

.header-content p {
  font-size: 36px;
}

.card-section {
  display: flex;
  flex-direction: column;
}

.card {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 18px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card h2 {
  font-size: 16px;
}

footer {
  text-align: center;
  padding-top: 20px;
}
</style>
