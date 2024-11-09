// src/main/frontend/app/screens/MainScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Step1Screen from './steps/Step1Screen';
import Step2Screen from './steps/Step2Screen';
import Step3Screen from './steps/Step3Screen';
import Step4Screen from './steps/Step4Screen';
import Step5Screen from './steps/Step5Screen';
import Step6Screen from './steps/Step6Screen';
import Step7Screen from './steps/Step7Screen';

const screens = [
  Step1Screen,
  Step2Screen,
  Step3Screen,
  Step4Screen,
  Step5Screen,
  Step6Screen,
  Step7Screen
];

function MainPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep((prevStep) => (prevStep + 1) % screens.length);
  };

  const CurrentScreen = screens[currentStep];

  return (
    <View style={styles.container}>
      <CurrentScreen />
      <TouchableOpacity style={styles.touchButton} onPress={nextStep}>
        <Text style={styles.touchButtonText}>
          {currentStep === screens.length - 1 ? "stop" : "Touch!"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default MainPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  touchButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3C623',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  touchButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
});
