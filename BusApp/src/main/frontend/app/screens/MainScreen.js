import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av'; // 오디오 녹음
import * as FileSystem from 'expo-file-system'; // 파일 시스템
import * as Speech from 'expo-speech'; // TTS
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // 위치정보

// Whisper 서버 URL
// 로컬 환경에서 iOS 시뮬레이터를 사용할 경우 "http://localhost:5001"를 그대로 사용하세요.
// 실제 기기를 사용할 경우 서버가 실행 중인 컴퓨터의 IP 주소로 변경해야 합니다.
const WHISPER_SERVER_URL = "http://192.0.0.2:5001/transcribe"; // YOUR_LOCAL_IP를 컴퓨터 IP 주소로 변경

function MainScreen({ nearestStation }) {
  const [recording, setRecording] = useState(null); // 녹음 객체
  const [recognizedText, setRecognizedText] = useState(''); // 변환된 텍스트
  const [currentStep, setCurrentStep] = useState(0); // 메시지 순서
  const [isListening, setIsListening] = useState(false); // 음성 인식 상태
  const vehicleno = "대전75자2337"; // 임시 버스 번호
  const [departure, setDeparture] = useState('천마사');
  const [destination, setDestination] = useState('가수원네거리');

  // 초기화
  const handleReset = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('초기화 완료', '모든 데이터가 삭제되었습니다.');
      navigation.replace('UserSignupScreen'); // 초기화 후 다시 회원가입 화면으로 이동
    } catch (error) {
      Alert.alert('초기화 실패', '데이터 삭제 중 문제가 발생했습니다.');
    }
  };

  // Whisper 서버 호출하여 STT 실행
  const convertSpeechToTextWithWhisper = async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: audioUri,
        type: "audio/wav",
        name: "audio.wav",
      });

      const response = await fetch(WHISPER_SERVER_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        console.error("STT 서버 응답 오류:", response.status, response.statusText);
        return "오류 발생";
      }

      const data = await response.json();

      if (data.error) {
        console.error("STT 서버 오류:", data.error);
        return "오류 발생";
      }

      return data.text || "인식된 텍스트 없음";
    } catch (error) {
      console.error("STT 요청 중 오류 발생:", error);
      return "오류 발생";
    }
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    console.log("startRecord");
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('오디오 녹음 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      console.log("녹음 시작됨:", recording);
      setRecording(recording);
      setIsListening(true);
    } catch (error) {
      console.error('녹음 시작 중 오류 발생:', error);
    }
  };

  // 음성 녹음 종료 및 Whisper STT 실행
  const stopRecording = async () => {
    console.log("stopRecording", recording);
    if (recording) {
      try {
        setIsListening(false); // 음성 인식 비활성화
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI(); // 녹음된 파일 경로
        setRecording(null);

        const response = await convertSpeechToTextWithWhisper(uri);
        setRecognizedText(response); // 변환된 텍스트 화면에 표시
      } catch (error) {
        console.error("녹음 종료 중 오류 발생:", error);
      }
    }
  };

  // 다음 메시지로 이동
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, messages.length - 1));
  };

  // 메시지 리스트
  const messages = [
    { text: "가까운 정류장을 안내합니다.", options: [nearestStation], useTap: true },
    { text: "도착지를 말씀해주세요.", options: ["아산역 1호선"], useTap: false }, // 음성 인식 활성화 단계
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

  // UI 렌더링
  return (
    <View style={styles.container}>
      {/* 초기화 버튼 */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>초기화</Text>
      </TouchableOpacity>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{messages[currentStep].text}</Text>
        {messages[currentStep].useTap && (
          messages[currentStep].options.map((option, index) => (
            <Text key={index} style={styles.optionText}>{option}</Text>
          ))
        )}
      </View>

      {/* 음성 인식 버튼 */}
      {currentStep === 1 && (
        <>
          {recognizedText && (
            <Text style={styles.recognizedText}>인식된 텍스트: {recognizedText}</Text>
          )}
          <TouchableOpacity
            style={[styles.touchButton, { backgroundColor: isListening ? '#F00' : '#0F0' }]}
            onPressIn={startRecording}  // 버튼 누를 때 녹음 시작
            onPressOut={stopRecording} // 버튼 뗄 때 녹음 종료
          >
            <Text style={styles.touchButtonText}>
              {isListening ? '음성 인식 중...' : '도착지'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.touchButton}
        onPress={() => {
          if (currentStep === messages.length - 1) {
            console.log("완료 버튼 클릭");
            // 완료 작업 추가 가능
          } else {
            nextStep();
          }
        }}
      >
        <Text style={styles.touchButtonText}>
          {currentStep === messages.length - 1 ? "완료" : "Touch!"
          }
        </Text>
      </TouchableOpacity>
    </View>
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
  optionText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  recognizedText: {
    fontSize: 18,
    color: '#000',
    marginTop: 20,
    textAlign: 'center',
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
  resetButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF5733',
    padding: 10,
    borderRadius: 5,
  },
  resetText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default MainScreen;
