import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import axios from 'axios'; // Axios 사용
// fetch 사용도 가능

export default function App() {
  const [data, setData] = useState(null); // API에서 받은 데이터를 저장
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState(null); // 오류 메시지 저장

  const fetchData = async () => {
    setLoading(true); // 로딩 상태 시작
    try {
      const response = await axios.post('http://192.168.2.75:8080/transit/routes', {
        startX: '126.936928',
        startY: '37.555162',
        endX: '127.029281',
        endY: '37.564436',
      });
      
      setData(response.data); // 응답 데이터를 상태에 저장
    } catch (err) {
      setError('Error fetching data: ' + err.message); // 오류 메시지 저장
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  useEffect(() => {
    // 컴포넌트가 로드될 때 데이터 요청
    fetchData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {loading && <ActivityIndicator size="large" />}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {data ? (
        <Text>API Data: {JSON.stringify(data)}</Text> // 응답 데이터를 출력
      ) : (
        <Text>No data loaded yet.</Text>
      )}
    </View>
  );
}
