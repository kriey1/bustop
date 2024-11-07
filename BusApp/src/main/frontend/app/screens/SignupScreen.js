import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

function SignupScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>해당하는 항목을 선택하세요</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignupgrScreen')}>
                <Text style={styles.buttonText}>보호자</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.driverButton]} onPress={() => navigation.navigate('SignupdrScreen')}>
                <Text style={styles.buttonText}>운전자</Text>
            </TouchableOpacity>
        </View>
    );
}

export default SignupScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#D3D3D3',
        paddingVertical: 10,
        paddingHorizontal: 60,
        borderRadius: 10,
        marginVertical: 10,
    },
    driverButton: {
        backgroundColor: '#FFD700', // 노란색 배경
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
    },
});
