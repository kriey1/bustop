// src/main/frontend/app/screens/HomeScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View>
      <Text>Home Screen</Text>
      <Text>운전자 혹은 보호자이신가요?</Text>

      <Button
        title="로그인"
        onPress={() => navigation.navigate('Login')}
      />
         <Button
        title="회원가입" // 운전자 또는 보호자 선택페이지
        onPress={() => navigation.navigate('SignupScreen')}
      />

    </View>
  );
}

export default HomeScreen;
