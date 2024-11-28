import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av'; // 오디오 녹음
import * as FileSystem from 'expo-file-system'; // 파일 시스템
import * as Speech from 'expo-speech'; // TTS
import axios from 'axios'; // HTTP 요청

function MainScreen({ nearestStation }) {
  // 각 단계에 표시할 메시지와 선택지를 정의

const GOOGLE_CLOUD_API_KEY = "AIzaSyD6lQ6JOwarbfY6KvERXsVXxdOpXRHqeh0"; // Google Cloud API 키 입력

export default function MainPage({ nearestStation }) {
  const [recording, setRecording] = useState(); // 녹음 객체
  const [recognizedText, setRecognizedText] = useState(''); // 변환된 텍스트
  const [currentStep, setCurrentStep] = useState(0); // 메시지 순서
  const [isListening, setIsListening] = useState(false); // 음성 인식 상태


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

  // 음성 녹음 시작
  const startRecording = async () => {
    console.log("startRecord")
    
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('오디오 녹음 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const {recording}= await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY)
      console.log("recording",recording)
      setRecording(recording);
      setIsListening(true); // 음성 인식 활성화
    } catch (error) {
      console.error('녹음 시작 중 오류 발생:', error);
    }
  };
  // 음성 녹음 종료 및 Google STT 호출
  const stopRecording = async () => {
    console.log("stopRecodring",recording)
    if (recording) {
      console.log("stopRecodring")
      try {
        setIsListening(false); // 음성 인식 비활성화
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI(); // 녹음된 파일 경로
        setRecording(null);
        const response = await convertSpeechToText(uri);
        setRecognizedText(response); // 변환된 텍스트 화면에 표시
      } catch (error) {
        console.error('녹음 종료 중 오류 발생:', error);
      }
    }
  };

  // Google STT API 호출
  const convertSpeechToText = async (audioUri) => {
    try {
      const audioFile = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
        {
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'ko-KR',
          },
          audio: {
            content: audioFile,
          },
        }
      );

      const transcript = response.data.results
        ?.map((result) => result.alternatives[0].transcript)
        .join(' ');
      return transcript || '인식된 텍스트 없음';
    } catch (error) {
      console.error('Google STT API 호출 오류:', error);
      return '오류 발생';
    }
  };

  // 다음 메시지로 이동
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, messages.length - 1)); // 마지막 단계에서 멈춤
  };

  // 옵션 렌더링
  const renderOptions = () => {
    return messages[currentStep].options.map((option, index) => (
      <Text key={index} style={styles.optionText}>{option}</Text>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{messages[currentStep].text}</Text>
        {messages[currentStep].useTap && renderOptions()}
      </View>

      {/* 음성 인식 버튼: "도착지를 말씀해주세요"일 때만 표시 */}
      {currentStep === 1 && (
        <>

        {/* 음성 인식 결과 */}
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
        onPress={nextStep}
        disabled={currentStep === messages.length - 1} // 마지막 단계에서는 비활성화
      >
        <Text style={styles.touchButtonText}>
          {currentStep === messages.length - 1 ? "완료" : "Touch!"}
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
});

export default MainScreen;

