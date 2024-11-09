import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

function TestScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchText, setSearchText] = useState(''); // 검색 입력 상태
  const [destinationCoords, setDestinationCoords] = useState(null); // 도착지 좌표

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('위치 권한이 필요합니다.');
        return;
      }

      // 현재 위치 가져오기
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  // 목적지 검색 함수
  const searchDestination = async () => {
    const apiKey = '2E98KPZpX52m9sP7J4ES574buetOtyM38Kzwap9K';

    try {
      const response = await axios.get(
        `https://apis.openapi.sk.com/tmap/pois`,
        {
          params: {
            version: 1,
            searchKeyword: searchText,
            resCoordType: 'WGS84GEO',
            searchType: 'all',
            appKey: apiKey,
          },
        }
      );

      const pois = response.data?.searchPoiInfo?.pois?.poi;
      if (pois && pois.length > 0) {
        const destinationPoi = pois[0];
        setDestinationCoords({
          x: destinationPoi.frontLon,
          y: destinationPoi.frontLat,
          name: destinationPoi.name,
        });

        // TestFindDestinationScreen으로 이동
        navigation.navigate('TestFindDestination', { coords: destinationPoi });
      } else {
        console.log("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error('Error searching destination:', error);
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
        {/* 현재 위치 마커 */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="현재 위치"
        />

        {/* 목적지 마커 */}
        {destinationCoords && (
          <Marker
            coordinate={{
              latitude: parseFloat(destinationCoords.y),
              longitude: parseFloat(destinationCoords.x),
            }}
            title={destinationCoords.name}
          />
        )}
      </MapView>

      {/* 검색 입력과 버튼 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="목적지 검색"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => navigation.navigate('TestFindDestination')}>
          <Text style={styles.searchButtonText}>검색</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TestFindDestination')}>
          <Text style={styles.touchText}>목적지 검색</Text>
        </TouchableOpacity>
      </View>

      {/* 도착지 좌표 표시 */}
      {destinationCoords && (
        <View style={styles.coordsContainer}>
          <Text>도착지 이름: {destinationCoords.name}</Text>
          <Text>경도 (x): {destinationCoords.x}</Text>
          <Text>위도 (y): {destinationCoords.y}</Text>
        </View>
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
  searchContainer: {
    position: 'absolute',
    top: 10,
    width: '90%',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: '5%',
  },
  input: {
    flex: 1,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  searchButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  coordsContainer: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: '5%',
    alignItems: 'center',
  },
});

export default TestScreen;
