// src/main/frontend/app/screens/steps/Step6Screen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Step6Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.messageText}>선문대 정류장까지 ~정거장 남았습니다.</Text>
    </View>
  );
}

export default Step6Screen;

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
