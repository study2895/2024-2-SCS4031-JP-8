window.onload = function() {  // 현재 날짜와 시간 기본값으로 설정
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById("dateInput").value = `${year}-${month}-${day}`;
    document.getElementById("timeInput").value = `${hours}:${minutes}`;
  };
  
  const stationMap = { // 정류장 이름, 정류장ID
    "명동입구": "101000148",
    "기흥역": "228000682",
    "순천향대학병원": "102000069",
  };
  
  function search() {
    const selectedDate = document.getElementById("dateInput").value;
    const selectedTime = document.getElementById("timeInput").value;
    const stationName = document.getElementById("stationInput").value;
  
    const stationId = stationMap[stationName];
    const inputDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const currentTime = new Date();
    const timeDifference = Math.abs(currentTime - inputDateTime) / (1000 * 60); // 분 오차 설정
  
    const routeIdMap = {
      "228000338": "5000a",  // 5000a routeId
      "228000174": "5000b"   // 5000b routeId
    };
  
    if (timeDifference <= 2) {  // 오차가 2분 아래일 경우 api호출
      const xhr = new XMLHttpRequest();
      const baseUrl = 'http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList';
      const serviceKey = 'QOd8Z4cLC51gkfhr9IhrXCwkVtMmCp2dq%2FeOf7fe603S%2B2fx%2Fe%2BVrWsvm33LZEfg2wi1xwVCGzdTk7yE3rTxtw%3D%3D';
      const queryParams = `?serviceKey=${serviceKey}&stationId=${stationId}`;
  
      xhr.open('GET', baseUrl + queryParams, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            const responseXML = xhr.responseXML;
            const routes = responseXML.getElementsByTagName("busArrivalList");
  
            let found = false;
            for (let i = 0; i < routes.length; i++) {
              const routeId = routes[i].getElementsByTagName("routeId")[0]?.textContent;
  
              // routeId가 routeIdMap에 있는지 확인하고 매핑된 버스 번호 가져오기
              const busNumber = routeIdMap[routeId];
  
              if (busNumber) { // 매핑된 버스 번호가 있으면 출력
                const remainSeatCnt1 = routes[i].getElementsByTagName("remainSeatCnt1")[0]?.textContent;
                const predictTime1 = routes[i].getElementsByTagName("predictTime1")[0]?.textContent;
  
                document.getElementById("result").innerText = 
                  `버스 번호: ${busNumber}, 잔여 좌석: ${remainSeatCnt1}, 예상 도착 시간: ${predictTime1}분 후`;
                found = true;
                break;
              }
            }
            if (!found) {
              document.getElementById("result").innerText = "현재 운행시간이 아닙니다.";
            }
          } else {
            document.getElementById("result").innerText = "API 요청 실패: " + xhr.status;
          }
        }
      };
      xhr.send();
    } else {
      document.getElementById("result").innerText = "시간 차이가 2분을 초과하여 DB에서 정보를 가져옵니다.";
    }
  }
  