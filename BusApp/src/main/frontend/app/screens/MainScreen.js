import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler'; // 제스처 핸들러
import axios from 'axios';
import useUserStore from '../store/userStore';
import { Audio } from 'expo-av'; // 오디오 녹음
import * as FileSystem from 'expo-file-system'; // 파일 시스템
import * as Speech from 'expo-speech'; // TTS
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // 위치정보

// Whisper 서버 URL
// 로컬 환경에서 iOS 시뮬레이터를 사용할 경우 "http://localhost:5001"를 그대로 사용하세요.
// 실제 기기를 사용할 경우 서버가 실행 중인 컴퓨터의 IP 주소로 변경해야 합니다.
const WHISPER_SERVER_URL = "http://172.17.7.186:5001/transcribe"; // YOUR_LOCAL_IP를 컴퓨터 IP 주소로 변경

function MainScreen({ nearestStation }) {
  const [recording, setRecording] = useState();
  const [recognizedText, setRecognizedText] = useState('');
  const [currentStep, setCurrentStep] = useState(0); // 현재 단계
  const [isListening, setIsListening] = useState(false);
  const { userInfo } = useUserStore();
  const vehicleno = "대전75자2337";
  const [departure, setDeparture] = useState('천마사');
  const [destination, setDestination] = useState('가수원네거리');

  // 메시지 리스트
  const messages = [
    { text: "가까운 정류장을 안내합니다.", options: [nearestStation], useTap: true },
    { text: "도착지를 말씀해주세요.", options: ["아산역 1호선"], useTap: false },
    { text: "출발지에서 도착지까지 가는 버스는 순환5입니다.\n안내를 시작할까요?", options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: "순환5번 버스가 잠시후 도착합니다.", options: [], useTap: false },
    { text: "버스에 탑승하셨나요?", options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: "선문대 정류장까지 ~정거장 남았습니다.", options: [], useTap: false },
    { text: "하차 시 아래 버튼을 눌러주세요.", options: [], useTap: false }
  ];

  // 메시지 변경 시 TTS 실행
  useEffect(() => {
    const message = messages[currentStep].text;
    Speech.speak(message, { language: 'ko-KR' });
  }, [currentStep]);

  // 이전 단계로 이동
  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0)); // 첫 단계에서 멈춤
  };

  // 다음 단계로 이동
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, messages.length - 1)); // 마지막 단계에서 멈춤
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* PanGestureHandler로 슬라이드 제스처 감지 */}
      <PanGestureHandler
        onGestureEvent={({ nativeEvent }) => {
          if (nativeEvent.translationX > 100) {
            prevStep(); // 오른쪽으로 슬라이드 시 이전 단계
          }
        }}
      >
        <View style={styles.container}>
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{messages[currentStep].text}</Text>
          </View>

          {/* Touch 버튼 */}
          <TouchableOpacity
            style={styles.touchButton}
            onPress={() => {
              if (currentStep === messages.length - 1) {
                console.log("완료 버튼 클릭");
              } else {
                nextStep();
              }
            }}
          >
            <Text style={styles.touchButtonText}>
              {currentStep === messages.length - 1 ? "완료" : "Touch!"}
            </Text>
          </TouchableOpacity>
        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  messageContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  touchButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3C623',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  touchButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
});

export default MainScreen;
