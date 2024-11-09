// src/main/frontend/app/screens/steps/Step1Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step1Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>가까운 정류장을 안내합니다.</Text>
      <Text style={styles.optionText}>선문대 본관 앞 정류장</Text>
      <Text style={styles.optionText}>선문대 정류소</Text>
    </View>
  );
}

export default Step1Screen;

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
