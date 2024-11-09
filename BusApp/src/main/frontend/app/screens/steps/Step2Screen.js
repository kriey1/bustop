// src/main/frontend/app/screens/steps/Step2Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step2Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>도착지를 말씀해주세요.</Text>
      <Text style={styles.optionText}>아산역 1호선</Text>
    </View>
  );
}

export default Step2Screen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
});
