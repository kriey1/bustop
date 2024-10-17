import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';


function LoginScreen({ navigation }) {
    return (
        <View>
            <Text>Login Page</Text>
            <Button
                title="Go to Home Screen"
                onPress={() => navigation.navigate('Home')}
            />
        </View>
    );
}
export default LoginScreen;
