import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';


function SignupScreen({ navigation }) {


    return (
        <View>
            
            <Text>회원가입페이지</Text>
            <Text>해당하는 항목을 선택하세요</Text>
            <Button
                title="보호자"
                onPress={() => navigation.navigate('SignupgrScreen')}
            />
            <Button
                title="운전자"
                onPress={() => navigation.navigate('SignupdrScreen')}
            />
        </View>
    );
}
export default SignupScreen;
