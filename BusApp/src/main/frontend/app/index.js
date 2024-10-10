import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { getTransitRoutes } from '../src/services/api'; // api.js에서 getTransitRoutes 함수 임포트

export default function Index() {
  const [startX, setStartX] = useState('126.936928'); // 기본 출발 좌표
  const [startY, setStartY] = useState('37.555162'); // 기본 출발 좌표
  const [endX, setEndX] = useState('127.029281'); // 기본 목적지 좌표
  const [endY, setEndY] = useState('37.564436'); // 기본 목적지 좌표
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const appKey = '2E98KPZpX52m9sP7J4ES574buetOtyM38Kzwap9K'; // 실제 발급받은 appKey를 넣어주세요.

  const handleFetchRoutes = async () => {
    setLoading(true);
    try {
      const transitData = await getTransitRoutes(startX, startY, endX, endY, appKey);
      setData(transitData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transit Route Finder</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Start X (longitude)"
        value={startX}
        onChangeText={setStartX}
      />
      <TextInput
        style={styles.input}
        placeholder="Start Y (latitude)"
        value={startY}
        onChangeText={setStartY}
      />
      <TextInput
        style={styles.input}
        placeholder="End X (longitude)"
        value={endX}
        onChangeText={setEndX}
      />
      <TextInput
        style={styles.input}
        placeholder="End Y (latitude)"
        value={endY}
        onChangeText={setEndY}
      />
      
      <Button title="Fetch Transit Routes" onPress={handleFetchRoutes} />
      
      {loading && <Text>Loading...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {data && <Text>{JSON.stringify(data)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
});
