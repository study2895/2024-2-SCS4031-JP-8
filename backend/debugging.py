import pandas as pd
import math
from datetime import datetime

# 승차인원 데이터 불러오기
passenger_data = pd.read_csv('int_passenger_flow.csv', index_col='정류장명')

# 필요한 함수들 정의
def poisson_prob(k, sigma, lam):
    return sum(math.exp(-lam) * (lam ** i) / math.factorial(i) for i in range(k, int(sigma)))

def get_bus_location(route_id):
    # 이 함수는 실제 API나 다른 데이터 소스에서 버스 위치 정보를 가져와야 합니다.
    # 여기서는 예시로 임의의 값을 반환합니다.
    return 15, 13  # 현재 정류장 인덱스, 다음 정류장 인덱스

def calculate_boarding_probability(route_id, target_station, current_time, passenger_data):
    current_bus, next_bus = get_bus_location(route_id)
    
    remain_seat = 31
    time_slot = f"{current_time.hour}시"
    
    station_list = passenger_data.index.tolist()
    relevant_stations = station_list[current_bus:target_station+1]
    already_pass = station_list[current_bus-1] if current_bus > 0 else None
    
    time_interval = 10
    total_bus = 60 / time_interval
    
    probabilities = []
    
    for station in relevant_stations:
        station_index = relevant_stations.index(station)
        
        if station_index == 0 and already_pass:
            avg_pass = passenger_data.loc[station, f"{time_slot}_승차"] - passenger_data.loc[already_pass, f"{time_slot}_승차"]
        elif station_index > 0:
            prev_station = relevant_stations[station_index-1]
            avg_pass = passenger_data.loc[station, f"{time_slot}_승차"] - passenger_data.loc[prev_station, f"{time_slot}_승차"]
        else:
            avg_pass = passenger_data.loc[station, f"{time_slot}_승차"]
        
        if pd.isna(avg_pass):
            avg_pass = 0
        else:
            avg_pass = float(avg_pass)
        
        total_pass = max(0, avg_pass * total_bus)
        bus_arrival_time = station_index * time_interval
        
        buses_until_now = int(bus_arrival_time / time_interval)
        if bus_arrival_time < 30:
            buses_until_now = total_bus - buses_until_now
        
        pass_per_time = total_pass / buses_until_now if buses_until_now > 0 else 0
        
        if remain_seat > 0:
            remain_seat -= avg_pass
            remain_seat = max(0, remain_seat)
        
        target_pass = max(1, int(total_pass - remain_seat))
        
        prob = poisson_prob(target_pass, total_pass, pass_per_time)
        probabilities.append((station, prob))
    
    return probabilities

# 예시 실행
route_id = "5000B"
target_station = 22
current_time = datetime.now()

result = calculate_boarding_probability(route_id, target_station, current_time, passenger_data)

print("승차 확률:")
for station, prob in result:
    print(f"{station}: {prob:.2%}")