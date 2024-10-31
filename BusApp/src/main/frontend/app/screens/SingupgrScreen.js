import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';


function SignupgrScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');

    return (
        <View>
            
            <Text>회원가입페이지(보호자)</Text>
            <TextInput
                placeholder="ID"
                value={id}
                onChangeText={setId}
            />
            <TextInput
                placeholder="PW"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                placeholder="이름"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                placeholder="전화번호"
                value={number}
                onChangeText={setNumber}
            />
            <Button
                title="완료"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    );
}
export default SignupgrScreen;
