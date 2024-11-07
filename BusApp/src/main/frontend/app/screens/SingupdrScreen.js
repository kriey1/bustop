import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

function SignupdrScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [busnumber, setBusnumber] = useState('');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>운전자</Text>
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
                placeholder="버스번호"
                value={busnumber}
                onChangeText={setBusnumber}
            />
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.buttonText}>완료</Text>
            </TouchableOpacity>
        </View>
    );
}

export default SignupdrScreen;

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
