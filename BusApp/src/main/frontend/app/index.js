// src/main/frontend/app/index.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import TestScreen from './screens/TestScreen';
import MainScreen from './screens/MainScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import SignupdrScreen from './screens/SingupdrScreen';
import SignupgrScreen from './screens/SingupgrScreen';

const Stack = createNativeStackNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Test" component={TestScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="SignupdrScreen" component={SignupdrScreen} />
      <Stack.Screen name="SignupgrScreen" component={SignupgrScreen} />
    </Stack.Navigator>
  );
}

export default StackNavigator;
