import React from 'react';
import { Button, Alert, View, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

// 발급받은 API 키를 여기에 입력하세요
const GOOGLE_MAPS_API_KEY = 'YOUAIzaSyALU_7foleMDrvucYibWttC-6pD3Pkggp8';

// WebView에서 사용할 HTML 코드
const GoogleMapHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <title>Google Map</title>
    <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
    <script>
      function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 37.7749, lng: -122.4194 }, // 초기 위치 설정 (샌프란시스코 예시)
          zoom: 12
        });
      }
    </script>
  </head>
  <body onload="initMap()" style="margin:0; padding:0; height:100vh;">
    <div id="map" style="width:100%; height:100%;"></div>
  </body>
  </html>
`;

export default function TestFindDestinationScreen() {
  const { width, height } = Dimensions.get('window');

  const openGoogleMap = () => {
    Alert.alert('Google Maps 열기', 'Google Maps에서 현재 위치를 엽니다.');
  };

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: GoogleMapHTML }}
        style={{ width, height: height * 0.7 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
      <Button title="Google Maps 열기" onPress={openGoogleMap} />
    </View>
  );
}
