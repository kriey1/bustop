// src/main/frontend/app/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View>
      <Text>Home Screen</Text>
      <Button
        title="Go to Test Screen"
        onPress={() => navigation.navigate('Test')}
      />
      <Button
        title="Go to Main Page"
        onPress={() => navigation.navigate('Main')}
      />
      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
      />
    </View>
  );
}

export default HomeScreen;
