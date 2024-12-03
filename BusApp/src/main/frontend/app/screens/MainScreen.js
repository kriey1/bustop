import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import axios from 'axios';
import * as Location from 'expo-location';

const GOOGLE_CLOUD_API_KEY = "AIzaSyD6lQ6JOwarbfY6KvERXsVXxdOpXRHqeh0";

function MainScreen({ nearestStation }) {
  const [recording, setRecording] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [location, setLocation] = useState(null);

  const vehicleno = "대전75자2337";
  const [departure] = useState('천마사');
  const [destination] = useState('가수원네거리');

  // 현재 위치 가져오기
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('위치 권한이 거부되었습니다.');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    };

    fetchLocation();
  }, []);

  // 메시지 변경 시 TTS 실행
  useEffect(() => {
    const message = messages[currentStep].text;
    Speech.speak(message, { language: 'ko-KR' });
  }, [currentStep]);

  // 음성 녹음 시작
  const startRecording = async () => {
    if (isListening || recording) {
      console.log("이미 녹음 중입니다.");
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('오디오 녹음 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      // 기존 녹음 객체가 있으면 정리
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRecording);
      setIsListening(true);
      console.log("녹음 시작");
    } catch (error) {
      console.error('녹음 시작 중 오류 발생:', error);
    }
  };

  // 음성 녹음 종료 및 Google STT 호출
  const stopRecording = async () => {
    if (!recording) {
      console.log("녹음 객체가 없습니다.");
      return;
    }

    try {
      setIsListening(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // 녹음 파일 길이 확인
      const status = await recording.getStatusAsync();
      if (status.durationMillis < 10) {
        alert('녹음된 내용이 너무 짧습니다. 다시 시도해주세요.');
        setRecording(null);
        return;
      }

      console.log("녹음 종료, 파일 경로:", uri);
      setRecording(null);

      // STT 호출
      const response = await convertSpeechToText(uri);
      setRecognizedText(response);
      console.log("인식된 텍스트:", response);
    } catch (error) {
      console.error('녹음 종료 중 오류 발생:', error);
    }
  };

  // Google STT API 호출
  const convertSpeechToText = async (audioUri) => {
    try {
      const audioFile = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestPayload = {
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: 'ko-KR',
        },
        audio: {
          content: audioFile,
        },
      };

      console.log('STT API 요청 데이터:', requestPayload);

      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`,
        requestPayload
      );

      console.log('STT API 응답:', response.data);

      const transcript = response.data.results
        ?.map((result) => result.alternatives[0].transcript)
        .join(' ');

      return transcript || '인식된 텍스트 없음';
    } catch (error) {
      console.error('Google STT API 호출 오류:', error);
      return '오류 발생';
    }
  };

  const messages = [
    { text: "가까운 정류장을 안내합니다.", options: [nearestStation], useTap: true },
    { text: "도착지를 말씀해주세요.", options: ["아산역 1호선"], useTap: false },
    { text: "출발지에서 도착지까지 가는 버스는 순환5입니다.\n안내를 시작할까요?", options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: "순환5번 버스가 잠시후 도착합니다.", options: [], useTap: false },
    { text: "버스에 탑승하셨나요?", options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: "선문대 정류장까지 ~정거장 남았습니다.", options: [], useTap: false },
    { text: "하차 시 아래 버튼을 눌러주세요.", options: [], useTap: false }
  ];

  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, messages.length - 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{messages[currentStep].text}</Text>
      </View>

      {currentStep === 1 && (
        <>
          {recognizedText && (
            <Text style={styles.recognizedText}>인식된 텍스트: {recognizedText}</Text>
          )}

          <TouchableOpacity
            style={[styles.touchButton, { backgroundColor: isListening ? '#F00' : '#0F0' }]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Text style={styles.touchButtonText}>
              {isListening ? '음성 인식 중...' : '도착지'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.touchButton} onPress={nextStep}>
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
    alignItems: 'center',
  },
  messageText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
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
