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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     width: '100%',
//     height: '100%',
//   },
//   fetchButton: {
//     position: 'absolute',
//     bottom: 100,
//     left: '5%',
//     right: '5%',
//     backgroundColor: '#4CAF50',
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   fetchButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   busStopsList: {
//     position: 'absolute',
//     bottom: 10,
//     left: '5%',
//     right: '5%',
//     maxHeight: 150,
//     backgroundColor: 'white',
//     padding: 10,
//     borderRadius: 5,
//   },
//   busStopItem: {
//     marginBottom: 5,
//   },
// });

// export default TestScreen; */