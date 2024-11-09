// src/main/frontend/app/screens/steps/Step4Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step4Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>순환5번 버스가 잠시후 도착합니다.</Text>
    </View>
  );
}

export default Step4Screen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  messageText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
  },
});
