// src/main/frontend/app/screens/steps/Step5Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step5Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>버스에 탑승하셨나요?</Text>
      <Text style={styles.optionText}>맞다면 한번 탭</Text>
      <Text style={styles.optionText}>아니라면 두번 탭</Text>
    </View>
  );
}

export default Step5Screen;

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
