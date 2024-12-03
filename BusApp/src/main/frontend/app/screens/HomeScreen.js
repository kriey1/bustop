import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

function HomeScreen({ navigation }) {
  const [biometricType, setBiometricType] = useState(null); // 지원되는 생체 인증 유형

  // 지원되는 생체 인증 유형 확인
  useEffect(() => {
    const checkBiometricType = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          setBiometricType('지원하지 않음');
          return;
        }

        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('지원하지 않음');
        }
      } catch (error) {
        console.error('checkBiometricType error:', error);
        setBiometricType('오류 발생');
      }
    };

    checkBiometricType();
  }, []);

  // 생체 인증 함수
  const handleFaceIDAuthentication = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        Alert.alert('알림', '이 기기는 생체 인증을 지원하지 않습니다.');
        return;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        Alert.alert('알림', '생체 인증이 설정되어 있지 않습니다.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: biometricType === 'Face ID' ? 'Face ID로 인증하세요' : 'Touch ID로 인증하세요',
        cancelLabel: '취소',
        fallbackLabel: '비밀번호로 인증',
      });

      if (result.success) {
        Alert.alert('인증 성공', `${biometricType} 인증이 완료되었습니다.`);
        navigation.navigate('Main');
      } else {
        Alert.alert('인증 실패', '생체 인증에 실패했습니다. 다시 시도하세요.');
      }
    } catch (error) {
      console.error('Authentication error: ', error);
      Alert.alert('오류', '생체 인증 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 상단 문구 */}
      <Text style={styles.questionText}>운전자 or 보호자이신가요?</Text>

      {/* 생체 인증 지원 유형 표시 */}
      <Text style={styles.biometricTypeText}>
        생체 인증 지원 유형: {biometricType || '확인 중...'}
      </Text>

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

        {/* Touch 버튼을 눌렀을 때 생체 인증 */}
        <TouchableOpacity onPress={handleFaceIDAuthentication}>
          <Text style={styles.touchText}>Touch!</Text>
        </TouchableOpacity>

        {/* Test 버튼을 눌렀을 때 Test 페이지로 이동 */}
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
  biometricTypeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
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
