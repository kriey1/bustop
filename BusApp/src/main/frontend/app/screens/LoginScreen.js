import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';


function LoginScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View>
            
            <Text>로그인페이지</Text>
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
            <Button
                title="Login"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    );
}
export default LoginScreen;
