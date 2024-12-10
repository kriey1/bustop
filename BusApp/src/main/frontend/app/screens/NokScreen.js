import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import useUserStore from '../store/userStore'; // 상태 관리 경로 확인

function NokScreen() {
    const { userInfo, registration } = useUserStore();
    const [gpsData, setGpsData] = useState(null);
    const [loading, setLoading] = useState(false);

    const requestGPSData = () => {
        setLoading(true);
        const ws = new WebSocket('ws://221.168.128.40:3000');

        ws.onopen = () => {
            console.log('WebSocket 연결 성공');
            const data = { type: 'gps-request', registration: userInfo?.registration }; // NOK와 연결된 등록번호 사용
            ws.send(JSON.stringify(data));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'gps-response') {
                setGpsData(data);
                setLoading(false);
            } else if (data.type === 'error') {
                console.error('오류:', data.message);
                setLoading(false);
            }
            ws.close();
        };

        ws.onerror = (error) => {
            console.error('WebSocket 오류:', error);
            setLoading(false);
        };

        ws.onclose = () => {
            console.log('WebSocket 연결 종료');
        };
    };

    useEffect(() => {
        requestGPSData();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : gpsData ? (
                <View>
                    <Text>출발지:{gpsData.departure} </Text>
                    <Text>목적지:{gpsData.destination} </Text>
                    <Text>위도: {gpsData.latitude}</Text>
                    <Text>경도: {gpsData.longitude}</Text>
                    <Text>시간: {new Date(gpsData.timestamp).toLocaleString()}</Text>
                </View>
            ) : (
                <Text>GPS 데이터를 가져올 수 없습니다.</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={requestGPSData}>
                <Text style={styles.buttonText}>위치 새로고침</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default NokScreen;