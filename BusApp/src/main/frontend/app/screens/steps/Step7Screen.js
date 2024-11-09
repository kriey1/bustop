// src/main/frontend/app/screens/steps/Step7Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step7Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>하차 시 아래 버튼을 눌러주세요.</Text>
    </View>
  );
}

export default Step7Screen;

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
