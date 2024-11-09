import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

// TMap HTML 내용
const TMapHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>simpleMap</title>
  <script src="https://code.jquery.com/jquery-3.2.1.min.js"></script>
  <script src="https://apis.openapi.sk.com/tmap/jsv2?version=1&appKey=2E98KPZpX52m9sP7J4ES574buetOtyM38K"></script>
  <script type="text/javascript">
    var map, markerArr = [];

    function initTmap() {
      console.log("TMap initializing...");
      map = new Tmapv2.Map("map_div", {
        center: new Tmapv2.LatLng(37.56520450, 126.98702028),
        width: "100%",
        height: "500px",
        zoom: 17
      });
    }

    function searchLocation(searchKeyword) {
      var headers = { appKey: "2E98KPZpX52m9sP7J4ES574buetOtyM38K" };
      
      $.ajax({
        method: "GET",
        headers: headers,
        url: "https://apis.openapi.sk.com/tmap/pois?version=1&format=json",
        data: {
          searchKeyword: searchKeyword,
          resCoordType: "EPSG3857",
          reqCoordType: "WGS84GEO",
          count: 10
        },
        success: function (response) {
          const pois = response.searchPoiInfo.pois.poi;
          
          // 기존 마커 제거
          if (markerArr.length > 0) {
            markerArr.forEach(marker => marker.setMap(null));
            markerArr = [];
          }

          pois.forEach((poi, index) => {
            const lat = Number(poi.frontLat);
            const lon = Number(poi.frontLon);

            const marker = new Tmapv2.Marker({
              position: new Tmapv2.LatLng(lat, lon),
              icon: "/upload/tmap/marker/pin_b_m_" + index + ".png",
              iconSize: new Tmapv2.Size(24, 38),
              map: map
            });
            markerArr.push(marker);
          });

          // React Native로 데이터 전달
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ pois }));
          }
        },
        error: function (request, status, error) {
          console.log("code:" + request.status + "\\n" + "message:" + request.responseText + "\\n" + "error:" + error);
        }
      });
    }

    window.onload = initTmap;
  </script>
</head>
<body onload="initTmap();">
  <div id="map_div" style="width:100%; height:500px;"></div>
</body>
</html>
`;

function TestFindDestinationScreen() {
  const [searchText, setSearchText] = useState('');
  const [locationData, setLocationData] = useState(null);

  // WebView에서 전달된 메시지를 처리하는 함수
  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.pois) {
      setLocationData(data.pois[0]); // 첫 번째 검색 결과 저장
    }
  };

  // 검색 버튼 클릭 시 WebView에서 위치 검색 함수 호출
  const searchLocation = () => {
    webviewRef.injectJavaScript(`searchLocation("${searchText}");`);
  };

  let webviewRef;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="검색할 장소 입력"
        value={searchText}
        onChangeText={setSearchText}
      />
      <Button title="검색" onPress={searchLocation} />
      
      <WebView
        ref={(ref) => (webviewRef = ref)}
        source={{ html: TMapHTML }}
        style={styles.webview}
        onMessage={onMessage}
      />

      {locationData && (
        <View style={styles.infoContainer}>
          <Text>이름: {locationData.name}</Text>
          <Text>위도: {locationData.frontLat}</Text>
          <Text>경도: {locationData.frontLon}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 10,
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff', // 배경색 설정
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default TestFindDestinationScreen;
