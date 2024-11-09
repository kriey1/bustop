// src/main/frontend/app/screens/steps/Step3Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step3Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>출발지에서 도착지까지 가는 버스는 순환5입니다. 안내를 시작할까요?</Text>
      <Text style={styles.optionText}>맞다면 한번 탭</Text>
      <Text style={styles.optionText}>아니라면 두번 탭</Text>
    </View>
  );
}

export default Step3Screen;

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
