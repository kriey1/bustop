import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
//import UserContext from '../UserContext';


function LoginScreen({ navigation }) {
    //const context = useContext(UserContext);
    //const { setUserInfo } = context;
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleLogin = async () => {
        if (!id || !password) {
            setError('ID와 비밀번호를 입력해주세요.');
            setModalVisible(true);
            return;
        }

        try {
            const response = await fetch('http://221.168.128.40:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password }),
            });
            console.log('응답 상태:', response.status);
            const result = await response.json();
            console.log('응답 데이터:', result);

            if (response.ok) {
                if (result.role === 'user') {
                    navigation.navigate('Main');
                } else if (result.role === 'nok') {
                    navigation.navigate('Main');
                } else {
                    navigation.navigate('BusDriverScreen');
                }
            } else {
                setError(result.message || '로그인 실패');
                setModalVisible(true);
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            setError('서버와 연결할 수 없습니다.');
            setModalVisible(true);
        }
    };

    return (
        <View style={styles.container}>

            {/* 알림 창 */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.errorMessage}>{error}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/* 로그인 입력 박스 */}
            <View style={styles.loginBox}>
                <TextInput
                    style={styles.input}
                    placeholder="id"
                    value={id}
                    onChangeText={setId}
                />
                <TextInput
                    style={styles.input}
                    placeholder="pw"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBox: {
        backgroundColor: '#F3C623',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        width: 200,
    },
    loginButton: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 10,
    },
    loginButtonText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorMessage: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    closeButton: {
        backgroundColor: '#F3C623',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    closeButtonText: {
        fontSize: 14,
        color: '#fff',
    },
});