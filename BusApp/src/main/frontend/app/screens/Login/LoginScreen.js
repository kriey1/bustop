import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';


function LoginScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login Page</Text>


            <Button
                title="회원가입"
                onPress={() => navigation.navigate('SignupScreen')}
            />
        </View>
    );
}

export default LoginScreen;