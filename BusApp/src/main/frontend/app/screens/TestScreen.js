import React, { useEffect } from 'react';
import { View } from 'react-native';

function TestScreen() {
  useEffect(() => {
    console.log('Tmapv2:', window.Tmapv2);

    if (window.Tmapv2) {
      initTmap();
    } else {
      console.error('Tmap API가 로드되지 않았습니다.');
    }
  }, []);

  function initTmap() {
    const map = new window.Tmapv2.Map('map', {
      center: new window.Tmapv2.LatLng(37.566481622437934, 126.98502302169841), // 서울 좌표
      width: '100%',
      height: '100%',
      zoom: 15,
    });

    // 마커 추가
    new window.Tmapv2.Marker({
      position: new window.Tmapv2.LatLng(37.566481622437934, 126.98502302169841),
      map: map,
    });
  }

  return (
    <View style={{ flex: 1 }}>
      <div id="map" style={{ width: '100%', height: '100vh' }} />
    </View>
  );
}

export default TestScreen;
