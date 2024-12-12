import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import useUserStore from '../store/userStore'; // 상태 관리 경로 확인
import MapView, { Marker } from 'react-native-maps';

function NokScreen() {
    const { userInfo, pin } = useUserStore();
    const [gpsData, setGpsData] = useState(null);
    const [loading, setLoading] = useState(false);

    const requestGPSData = () => {
        setLoading(true);
        const ws = new WebSocket('ws://221.168.128.40:3000');

        ws.onopen = () => {
            console.log('WebSocket 연결 성공');
            const data = { type: 'gps-request', pin: userInfo?.pin }; // NOK와 연결된 등록번호 사용
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
            ) : (
                <>
                    {/* 정보 컨테이너 */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>
                            {gpsData?.destination
                                ? `${gpsData.destination}으로 이동 중`
                                : '목적지가 설정되지 않았습니다.'}
                        </Text>
                    </View>

                    {/* 지도 컨테이너 */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: gpsData?.latitude || 37.5665, // GPS 데이터가 없으면 서울 중심 좌표
                                longitude: gpsData?.longitude || 126.9780,
                                latitudeDelta: 0.1,
                                longitudeDelta: 0.1,
                            }}
                        >
                            {/* 현재 위치 */}
                            {gpsData?.latitude && gpsData?.longitude && (
                                <Marker
                                    coordinate={{
                                        latitude: gpsData.latitude,
                                        longitude: gpsData.longitude,
                                    }}
                                    title="현재 위치"
                                />
                            )}

                            {/* 출발지 */}
                            {gpsData?.departureCoords && (
                                <Marker
                                    coordinate={gpsData.departureCoords}
                                    title="출발지"
                                    pinColor="blue"
                                />
                            )}

                            {/* 도착지 */}
                            {gpsData?.destinationCoords && (
                                <Marker
                                    coordinate={gpsData.destinationCoords}
                                    title="목적지"
                                    pinColor="red"
                                />
                            )}
                        </MapView>
                    </View>
                </>
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
        backgroundColor: '#fff',
    },
    infoContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: '#F3C623',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    button: {
        marginTop: 20,
        backgroundColor: '#F3C623',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    buttonText: {
        color: '#333',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default NokScreen;