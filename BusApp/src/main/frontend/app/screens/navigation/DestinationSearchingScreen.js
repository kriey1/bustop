import React, { useState } from 'react';
import { View, Button, TextInput, Text, Alert, FlatList, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { Speech } from 'expo-speech';

const DestinationSearchingScreen = () => {
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  //사용자 위치정보
  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('GPS 권한 거부.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const startX = location.coords.longitude;
    const startY = location.coords.latitude;
    console.log("현재 위치:", { startX, startY });
    return { startX, startY };
  };

//음성인식
  /*const handleSpeechToText = () => {
    Speech.startListening((result) => {
      setDestination(result);
    });
  };
*/

//테스트용 수동검색
  const TextSearching = async (destination) => {
    try {
        const response = await fetch(`http://172.30.1.60:3000/search?destination=${destination}`);
        const results = await response.json();
        return results;
      } catch (error) {
        Alert.alert('검색 오류.', error.message);
        return [];
      }
    };

    const handleSearch = async () => {
        const results = await TextSearching(destination);
        setSearchResults(results); // 검색 결과 업데이트
      };

  const getRoute = async (startX, startY, endX, endY) => {
    try {
      //const response = await fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian', {
      const response = await fetch('https://apis.openapi.sk.com/transit/routes',{
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            appKey: 'iORUqRFjtu9JfkUGPMpg040iu3hXCvyS5icJo7kO',
        },
        body: JSON.stringify({
          version: 1,
          startX: parseFloat(startX),
          startY: parseFloat(startY),
          endX: parseFloat(endX),
          endY: parseFloat(endY),
          startName: '출발지',
          endName: '도착지',
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO'
        }),
      });
      const data = await response.json();
      console.log("경로 데이터 수신:", data);
      return data;
    } catch (error) {
      Alert.alert('경로 요청 오류.', error.message);
    }
  };

  const handleSelectDestination = async (selectedDestination) => {
    console.log("선택된 목적지:", selectedDestination); 
    const endX = parseFloat(selectedDestination.longitude);
    const endY = parseFloat(selectedDestination.latitude);

    const location = await getLocation();
    if (location) {
      const { startX, startY } = location;
      await getRoute(startX, startY, endX, endY);
      } else {
        Alert.alert('경로 데이터를 가져올 수 없습니다.');
      }
    }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>길찾기 화면</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TextInput
          placeholder="목적지를 입력하세요"
          value={destination}
          onChangeText={(text) => setDestination(text)}
          style={{
            flex: 1,
            borderBottomWidth: 1,
            marginRight: 10,
            paddingVertical: 5,
          }}
        />
        <TouchableOpacity onPress={handleSearch} style={{ padding: 10, backgroundColor: '#007BFF', borderRadius: 5 }}>
          <Text style={{ color: 'white' }}>검색</Text>
        </TouchableOpacity>
      </View>
{/*
      <TouchableOpacity onPress={handleSpeechToText} style={{ padding: 10, backgroundColor: '#28a745', borderRadius: 5, marginBottom: 20 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>음성 입력</Text>
      </TouchableOpacity>
*/}
      {/* 검색 결과 */}
      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => (
     <TouchableOpacity
        onPress={() => handleSelectDestination(item)}
        style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd' }}
     >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  )}
/>
    </View>
  );
};

export default DestinationSearchingScreen;