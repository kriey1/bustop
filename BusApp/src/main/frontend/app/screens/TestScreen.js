import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

  // API를 통해 근처 버스 정류장 정보를 가져오는 함수
  const fetchNearbyBusStops = async () => {
    if (!location) return;
    try {
      const url = `http://10.20.36.139:8080/getNearbyBusStops?gpsLati=${location.latitude}&gpsLong=${location.longitude}`;
      http://localhost:8080/getNearbyBusStops?gpsLati=36.799402&gpsLong=127.074885
      console.log("API URL:", url); // API URL을 콘솔에 출력
      
      const response = await axios.get(url, {
        params: {
          gpsLati: location.latitude,
          gpsLong: location.longitude,
          pageNo: "1",
          numOfRows: "10"
        }
      });

      const data = response.data;
      if (data && data.response && data.response.body && data.response.body.items) {
        setBusStops(data.response.body.items.item || []);
      } else {
        console.error("Unexpected response format:", data);
        setBusStops([]);
      }
    } catch (error) {
      console.error("Error fetching bus stops:", error);
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
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="현재 위치"
        />

        {busStops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(stop.gpslati),
              longitude: parseFloat(stop.gpslong),
            }}
            title={stop.nodenm}
          />
        ))}
      </MapView>

      <TouchableOpacity style={styles.fetchButton} onPress={fetchNearbyBusStops}>
        <Text style={styles.fetchButtonText}>주변 버스 정류장 검색</Text>
      </TouchableOpacity>

      {busStops.length > 0 && (
        <ScrollView style={styles.busStopsList}>
          {busStops.map((stop, index) => (
            <View key={index} style={styles.busStopItem}>
              <Text>정류장 이름: {stop.nodenm}</Text>
              <Text>위도: {stop.gpslati}</Text>
              <Text>경도: {stop.gpslong}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  fetchButton: {
    position: 'absolute',
    bottom: 100,
    left: '5%',
    right: '5%',
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  fetchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  busStopsList: {
    position: 'absolute',
    bottom: 10,
    left: '5%',
    right: '5%',
    maxHeight: 150,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  busStopItem: {
    marginBottom: 5,
  },
});

export default TestScreen;
