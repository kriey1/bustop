// app/screens/TestScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function TestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>
      <Link href="./HomeScreen">
        <Button title="Go back to Home" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
});
