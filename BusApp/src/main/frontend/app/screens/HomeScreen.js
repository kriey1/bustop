import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import FingerprintScanner from 'react-native-fingerprint-scanner'; // 패키지 변경
// import Sensor from '../components/Sensor';
import * as LocalAuthentication from 'expo-local-authentication'; // expo-local-authentication 추가

function HomeScreen({ navigation }) {
  const handleFaceIDAuthentication = async () => {
    try {
      console.log('1. 생체 인증 가능 여부 확인 중...');
      const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();

      if (!isBiometricAvailable) {
        console.log('생체 인증 하드웨어 없음');
        Alert.alert('오류', '생체 인증이 지원되지 않는 기기입니다.');
        return;
      }

      console.log('2. 지원되는 생체 인증 유형 확인 중...');
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log('지원되는 생체 인증 유형:', supportedTypes);

      if (!supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        Alert.alert('오류', 'Face ID가 지원되지 않습니다.');
        return;
      }

      console.log('3. 생체 인증 수행 중...');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Face ID 또는 지문 인증을 진행합니다.',
        cancelLabel: '취소',
        fallbackLabel: 'PIN 사용',
      });

      console.log('4. 생체 인증 결과:', result);

      if (result.success) {
        console.log('생체 인증 성공');
        Alert.alert('성공', '인증이 완료되었습니다.');
        navigation.navigate('Main'); // 인증 성공 시 MainScreen으로 이동
      } else {
        console.log('생체 인증 실패');
        Alert.alert('실패', 'Face ID 인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('Face ID 인증 오류:', error);
      Alert.alert('오류', 'Face ID 인증 중 문제가 발생했습니다. 오류: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 문구 */}
      <Text style={styles.questionText}>운전자 or 보호자이신가요?</Text>

      {/* 로그인 버튼 */}
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      {/* 운전자 화면 버튼 */}
      <TouchableOpacity style={styles.driverButton} onPress={() => navigation.navigate('BusDriverScreen')}>
        <Text style={styles.driverButtonText}>운전자 화면</Text>
      </TouchableOpacity>

      {/* 회원가입 버튼 */}
      <TouchableOpacity onPress={() => navigation.navigate('SignupScreen')}>
        <Text style={styles.signupText}>회원가입</Text>
      </TouchableOpacity>

      {/* 버스 이미지와 "Touch!" 텍스트 */}
      <View style={styles.touchContainer}>
        <Image source={require('../screens/image/bus.png')} style={styles.busImage} />

        {/* Touch 버튼을 눌렀을 때 Face ID 인증 후 MainScreen으로 이동 */}
        <TouchableOpacity onPress={handleFaceIDAuthentication}>
          <Text style={styles.touchText}>Touch!</Text>
        </TouchableOpacity>

        {/* Touch 버튼을 눌렀을 때 TestScreen으로 이동 */}
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
  driverButton: {
    backgroundColor: '#ADD8E6', // 연한 파란색 배경
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginVertical: 10,
  },
  driverButtonText: {
    fontSize: 18,
    color: '#fff',
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
    marginVertical: 5,
  },
});
