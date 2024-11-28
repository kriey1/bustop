import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
//import UserContext from '../UserContext';

function BusDriverScreen() {
    //const { userInfo } = useContext(UserContext);
    const [isAlertActive, setIsAlertActive] = useState(false);

    const toggleAlert = () => {
        // 하차 요청
        setIsAlertActive(prevState => !prevState);
    };

    return (
        <View style={styles.container}>
            {/* 상단 정보 */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>운전사 이름: {'driver1'}</Text>
                <Text style={styles.infoText}>버스 번호: {'1234'}</Text>
            </View>

            {/* 중앙 알림 칸 (버튼) */}
            <TouchableOpacity
                style={[
                    styles.alertIndicator,
                    isAlertActive ? styles.alertActive : styles.alertInactive,
                ]}
                onPress={toggleAlert}
            >
                <Text style={styles.alertText}>
                    {isAlertActive ? '하차 요청!' : '정상 운행'}
                </Text>
            </TouchableOpacity>

            {/* 하단 정보 */}
            <View style={styles.bottomInfoBox}>
                <Text style={styles.bottomInfoText}>다음 역: 서울시청</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    infoContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: '#F3C623',
        padding: 15,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        marginVertical: 10,
    },
    infoText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
    alertIndicator: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    alertInactive: {
        backgroundColor: '#4CAF50', // 정상 상태 색상 (녹색)
    },
    alertActive: {
        backgroundColor: '#F05454', // 경고 상태 색상 (빨강)
    },
    alertText: {
        fontSize: 20,
        color: '#FFF',
        textAlign: 'center',
    },
    bottomInfoBox: {
        width: '90%',
        backgroundColor: '#D1E8E2',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    bottomInfoText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
});

export default BusDriverScreen;