// src/main/frontend/app/screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* 상단 문구 */}
      <Text style={styles.questionText}>운전자 or 보호자이신가요?</Text>

      {/* 로그인 버튼 */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      {/* 회원가입 버튼 */}
      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>

      {/* 버스 이미지와 "Touch!" 텍스트 */}
      <View style={styles.touchContainer}>
        <Image source={require('../screens/image/bus.png')} style={styles.busImage} />
        
        {/* Touch 버튼을 눌렀을 때 MainScreen으로 이동 */}
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Text style={styles.touchText}>Touch!</Text>
        </TouchableOpacity>

        {/* Touch 버튼을 눌렀을 때 MainScreen으로 이동 */}
        <TouchableOpacity onPress={() => navigation.navigate('Test')}>
          <Text style={styles.touchText}>test!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default HomeScreen;

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#f0f8ff',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
    marginBottom: 10,
  },
  loginButtonText: {
    fontSize: 18,
    color: '#333',
  },
  signupText: {
    fontSize: 16,
    color: '#333',
    textDecorationLine: 'underline',
    marginBottom: 40,
  },
  touchContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  busImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  touchText: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: '#F3C623', // 노란색 배경
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
});
