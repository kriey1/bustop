import React from 'react';
import { View, Text, Button } from 'react-native';
import TouchID from 'react-native-touch-id';
import Toast from 'react-native-toast-message';

function Sensor() {
  async function sensor() {
    const optionalConfigObject = {
      title: 'touch id를 수행합니다.', // Android
      imageColor: '#ff6633', // Android
      imageErrorColor: '#ff0000', // Android
      sensorDescription: 'Touch sensor', // Android
      sensorErrorDescription: 'Failed', // Android
      cancelText: 'Cancel', // Android
      fallbackLabel: 'Show Passcode', // iOS
      unifiedErrors: true, // use unified error messages
      passcodeFallback: true, // iOS
    };

    try {
      const isSupported = await TouchID.isSupported(optionalConfigObject);
      console.log(`타입: ${isSupported}`); // FaceID, TouchID
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: '왓더',
      });
      return;
    }

    try {
      const res = await TouchID.authenticate(
        'to demo this react-native component',
        optionalConfigObject,
      );
      console.log('인식성공:', res);
      Toast.show({
        type: 'success',
        text1: '인식성공',
      });
    } catch (err) {
      console.log('인식실패 또는 취소', err);
      Toast.show({
        type: 'error',
        text1: '얼굴인식이 실패했거나 취소되었습니다.',
      });
    }
  }

  return (
    <View>
      <Text>생체인증</Text>
      <Button onPress={sensor} title="sensor" />
    </View>
  );
}

export default Sensor;