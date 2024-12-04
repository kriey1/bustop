// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/main/frontend/app/index';


export default function App() {
  return (
      <NavigationContainer>
          <StackNavigator />
      </NavigationContainer>
  );
}
