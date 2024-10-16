// src/main/frontend/app/screens/MainPage.js
import React from 'react';
import { View, Text, Button } from 'react-native';

function MainPage({ navigation }) {
  return (
    <View>
      <Text>Main Page</Text>
      <Button
        title="Go to Home Screen"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
}

export default MainPage;
