import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

function SignupgrScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [kin, setKin] = useState('');

    const handleSignup = async () => {
        if (!id || !password || !name || !number || !kin) {
            Alert.alert('오류', '모든 항목을 채워주세요.');
            return;
        }
        try {
            console.log({ id, password, name, number, kin });
            const response = await fetch('http://172.30.1.60:3000/signup-nok', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, password, name, number, kin }),
            });
            const result = await response.json();
            if (response.ok) {
                Alert.alert('회원가입 성공', '보호자 등록이 완료되었습니다.');
                navigation.navigate('Home');
            } else {
                Alert.alert('오류', result.message || '보호자 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('보호자 회원가입 오류:', error);
            Alert.alert('오류', '서버 연결 실패');
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.title}>보호자</Text>
            <TextInput
                style={styles.input}
                placeholder="ID"
                value={id}
                onChangeText={setId}
            />
            <TextInput
                style={styles.input}
                placeholder="PW"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="이름"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="전화번호"
                value={number}
                onChangeText={setNumber}
            />
            <TextInput
                style={styles.input}
                placeholder="등록번호"
                value={kin}
                onChangeText={setKin}
            />
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>완료</Text>
            </TouchableOpacity>
        </View>
    );
}

export default SignupgrScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: 250,
    },
    button: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
    },
});
