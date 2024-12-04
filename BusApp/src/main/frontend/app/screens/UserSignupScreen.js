import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function UserSignupScreen({ navigation }) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    const handleComplete = async () => {
      if (pin.length === 6) {
        try {
          await AsyncStorage.setItem('userPin', pin); // PIN 저장
          console.log(pin)
          await savePinToServer(pin); // 서버에 PIN 저장
          navigation.replace('Main'); // 메인 화면으로 이동
        } catch (error) {
          console.error('Error saving user PIN:', error);
        }
      }
    };

    handleComplete();
  }, [pin]);

  const handleKeyPress = (num) => {
    if (pin.length < 6) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin('');
  };

  const savePinToServer = async (pin) => {
    try {
      const response = await fetch('http://221.168.128.40:3000/signup-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      });

      if (!response.ok) {
        throw new Error('Failed to save PIN to server');
      }
    } catch (error) {
      console.error('Error saving PIN to server:', error);
      throw error;
    }
  };

  const renderKeypad = () => {
    const keys = Array.from({ length: 9 }, (_, i) => i + 1).concat(0);
    return keys.map((key) => (
      <TouchableOpacity
        key={key}
        style={styles.key}
        onPress={() => handleKeyPress(key.toString())}
      >
        <Text style={styles.keyText}>{key}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pin}>{pin.padEnd(6, '_')}</Text>
      <View style={styles.keypad}>{renderKeypad()}</View>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>X</Text>
      </TouchableOpacity>
    </View>
  );
}

export default UserSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  pin: {
    fontSize: 50,
    letterSpacing: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '120%',
    borderWidth: 1,
    borderColor: '#000',
  },
  key: {
    width: '40%',
    aspectRatio: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  keyText: {
    fontSize: 60,
  },
  deleteButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 50,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 40,
    color: '#fff',
    textAlign: 'center',
  },
});
