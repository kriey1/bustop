// src/main/frontend/app/screens/MainPage.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function MainScreen({ nearestStation }) {
  // 각 단계에 표시할 메시지와 선택지를 정의
  const messages = [
    { text: "가까운 정류장을 안내합니다.", options: [nearestStation], useTap: true },
    { text: "도착지를 말씀해주세요.", options: ["아산역 1호선"], useTap: true },
    { text: "출발지에서 도착지까지 가는 버스는 순환5입니다.\n안내를 시작할까요?", options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: "순환5번 버스가 잠시후 도착합니다.", options: [], useTap: false },
    { text: "버스에 탑승하셨나요?", options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: "선문대 정류장까지 ~정거장 남았습니다.", options: [], useTap: false },
    { text: "하차 시 아래 버튼을 눌러주세요.", options: [], useTap: false }
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    // 다음 단계로 진행. 마지막 단계에 도달하면 처음으로 돌아갑니다.
    setCurrentStep((prevStep) => (prevStep + 1) % messages.length);
  };

  const renderOptions = () => {
    const options = messages[currentStep].options;
    return options.map((option, index) => (
      <Text key={index} style={styles.optionText}>{option}</Text>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{messages[currentStep].text}</Text>
        {messages[currentStep].useTap && renderOptions()}
      </View>
      
      {/* 메시지를 순서대로 넘기는 "Touch" 버튼 */}
      <TouchableOpacity style={styles.touchButton} onPress={nextStep}>
        <Text style={styles.touchButtonText}>
          {currentStep === messages.length - 1 ? "stop" : "Touch!"}
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
  touchButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3C623',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
});

export default MainScreen;