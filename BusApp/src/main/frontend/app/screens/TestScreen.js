// app/screens/TestScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

function TestScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Screen</Text>

      <Button
        title="Go to home Page"
        onPress={() => navigation.navigate('Home')}
      />


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

export default TestScreen;