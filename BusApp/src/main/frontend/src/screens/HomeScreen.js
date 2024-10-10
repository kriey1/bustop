import React, { useState } from 'react';
import { SafeAreaView, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { getTransitRoutes } from '../services/api';

const HomeScreen = () => {
  const [startX, setStartX] = useState('126.936928');
  const [startY, setStartY] = useState('37.555162');
  const [endX, setEndX] = useState('127.029281');
  const [endY, setEndY] = useState('37.564436');
  const [routes, setRoutes] = useState(null);
  const [error, setError] = useState(null);

  const fetchRoutes = async () => {
    try {
      const data = await getTransitRoutes(startX, startY, endX, endY);
      setRoutes(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch routes');
      setRoutes(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Transit Route Finder</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Start X"
          value={startX}
          onChangeText={setStartX}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Start Y"
          value={startY}
          onChangeText={setStartY}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="End X"
          value={endX}
          onChangeText={setEndX}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="End Y"
          value={endY}
          onChangeText={setEndY}
          keyboardType="numeric"
        />
        
        <Button title="Find Route" onPress={fetchRoutes} />
        
        {error && <Text style={styles.error}>{error}</Text>}
        
        {routes && (
          <ScrollView style={styles.results}>
            <Text style={styles.resultTitle}>Route Information:</Text>
            <Text>{JSON.stringify(routes, null, 2)}</Text>
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginBottom: 12,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  results: {
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
