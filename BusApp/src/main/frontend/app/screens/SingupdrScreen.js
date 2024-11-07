import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';


function SignupdrScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [busnumber, setBusnumber] = useState('');

    return (
        <View>
            
            <Text>회원가입페이지(운전자)</Text>
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
                placeholder="버스번호"
                value={busnumber}
                onChangeText={setBusnumber}
            />
            <Button
                title="완료"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    );
}
export default SignupdrScreen;
