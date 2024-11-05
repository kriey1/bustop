import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

function LoginScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>
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
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Home')}>
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
});
