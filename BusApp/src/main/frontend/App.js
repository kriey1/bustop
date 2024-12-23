// App.js
import React from 'react';
import { UserProvider } from './app/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './app/index'; // index.js 파일을 import


//import StackNavigator from './src/main/frontend/app/index';


export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
          <StackNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}
