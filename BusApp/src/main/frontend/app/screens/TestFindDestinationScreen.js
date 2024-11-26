import React, { useState, useRef } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function TestFindDestinationScreen() {
  const [searchText, setSearchText] = useState('');
  const [places, setPlaces] = useState([]);
  const webViewRef = useRef(null);

  const searchPlaces = () => {
    webViewRef.current.injectJavaScript(`searchPlaces("${searchText}")`);
  };

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    setPlaces(data);
  };

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.input}
        placeholder="목적지 검색"
        value={searchText}
        onChangeText={setSearchText}
      />
      <Button title="검색" onPress={searchPlaces} />
      
      <WebView
        ref={webViewRef}
        source={{ uri: './map.html' }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
      />

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.title}>{item.place_name}</Text>
            <Text style={styles.subtitle}>({item.y}, {item.x})</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 10,
    borderRadius: 5,
  },
  item: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
  },
});
