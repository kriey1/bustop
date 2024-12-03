import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';

import * as Location from 'expo-location';
import axios from 'axios';

function TestScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [busStops, setBusStops] = useState([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 권한이 필요합니다.');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      console.log("현재 위치:", loc.coords); // 현재 위치를 콘솔에 출력
    })();
  }, []);

  // 두 지점 사이의 거리를 계산하는 함수 추가
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // 지구의 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // API를 통해 근처 버스 정류장 정보를 가져오는 함수
  const fetchNearbyBusStops = async () => {
    if (!location) return;
    try {
      // 위도와 경도를 고정된 소수점 자릿수로 포맷팅
      const formattedLat = location.latitude.toFixed(6);
      const formattedLong = location.longitude.toFixed(6);
      
      const url = `http://192.168.0.47:8080/getNearbyBusStops`;
      console.log("API 요청 좌표:", formattedLat, formattedLong);
      
      const response = await axios.get(url, {
        params: {
          gpsLati: formattedLat,
          gpsLong: formattedLong,
          pageNo: 1,  // 문자열에서 숫자로 변경
          numOfRows: 10  // 문자열에서 숫자로 변경
        }
      });

      const data = response.data;
      if (data && data.response && data.response.body && data.response.body.items) {
        const items = data.response.body.items.item || [];
        
        // 각 정류장까지의 거리 계산
        const stopsWithDistance = items.map(stop => ({
          ...stop,
          distance: calculateDistance(
            location.latitude,
            location.longitude,
            parseFloat(stop.gpslati),
            parseFloat(stop.gpslong)
          )
        }));

        // 거리순으로 정렬하고 가장 가까운 정류장만 선택
        const nearestStop = stopsWithDistance.sort((a, b) => a.distance - b.distance)[0];
        setBusStops(nearestStop ? [nearestStop] : []);
      } else {
        console.error("응답 형식 오류:", data);
        setBusStops([]);
      }
    } catch (error) {
      console.error("버스 정류장 조회 오류:", error);
    }
  };

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>현재 위치를 불러오는 중입니다...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>

      <Button
        title="Go to home Page"
        onPress={() => navigation.navigate('Home')}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default TestScreen;