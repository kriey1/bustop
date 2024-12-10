// // app/screens/TestScreen.js
// import React from 'react';
// import { View, Text, Button, StyleSheet } from 'react-native';
// import { Link } from 'expo-router';

// function TestScreen({ navigation }) {
//   return (
//     <View style={styles.container}>
//       <MapView
//         style={styles.map}
//         initialRegion={{
//           latitude: location.latitude,
//           longitude: location.longitude,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         }}
//         showsUserLocation={true}
//       >
//         <Marker
//           coordinate={{
//             latitude: location.latitude,
//             longitude: location.longitude,
//           }}
//           title="현재 위치"
//         />

//         {busStops.map((stop, index) => (
//           <Marker
//             key={index}
//             coordinate={{
//               latitude: parseFloat(stop.gpslati),
//               longitude: parseFloat(stop.gpslong),
//             }}
//             title={stop.nodenm}
//           />
//         ))}
//       </MapView>

//       <TouchableOpacity style={styles.fetchButton} onPress={fetchNearbyBusStops}>
//         <Text style={styles.fetchButtonText}>주변 버스 정류장 검색</Text>
//       </TouchableOpacity>

//       {busStops.length > 0 && (
//         <ScrollView style={styles.busStopsList}>
//           {busStops.map((stop, index) => (
//             <View key={index} style={styles.busStopItem}>
//               <Text>정류장 이름: {stop.nodenm}</Text>
//               <Text>위도: {stop.gpslati}</Text>
//               <Text>경도: {stop.gpslong}</Text>
//             </View>
//           ))}
//         </ScrollView>
//       )}
//     </View>
//   );
// }

//   // API를 통해 근처 버스 정류장 정보를 가져오는 함수
//   const fetchNearbyBusStops = async () => {
//     if (!location) return;
//     try {
//       // 위도와 경도를 고정된 소수점 자릿수로 포맷팅
//       const formattedLat = location.latitude.toFixed(6);
//       const formattedLong = location.longitude.toFixed(6);
      
//       const url = `http://10.20.36.73:8080/getNearbyBusStops`;
//       console.log("API 요청 좌표:", formattedLat, formattedLong);
      
//       const response = await axios.get(url, {
//         params: {
//           gpsLati: formattedLat,
//           gpsLong: formattedLong,
//           pageNo: 1,  // 문자열에서 숫자로 변경
//           numOfRows: 10  // 문자열에서 숫자로 변경
//         }
//       });

// // export default TestScreen; */