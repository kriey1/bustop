import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ItemSeparatorComponent } from 'react-native';
import  useUserStore from '../store/userStore'

function BusDriverScreen() {
    const { userInfo } = useUserStore();
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [alertText, setAlertText] = useState('정상 운행');//중앙 알림 텍스트
    const [busLocation, setBusLocation] = useState({ latitude: null, longitude: null });
    const [wsStatus, setWsStatus] = useState('연결 중...');
    const ws = React.useRef(null); // WebSocket
    const [currentNode, setCurrentNode] = useState({ nodeid: null, nodenm: null });
    const [previousStop, setPreviousStop] = useState(); // 이전 정류장
    const [nextStop, setNextStop] = useState(); // 다음 정류장
    const [routeData, setRouteData] = useState([]); // 전체 노선 데이터
    const apiKey = "cjPl5Q0WfmVlbYWXDsTQgOg8KD%2F5R5IMPY4Ft%2Fz%2Bt6FY1NQb2kpRB5PHzkRZsgrSDKDPlSvL0H%2BglmFVN36OBA%3D%3D"; //국토교통부_(TAGO)_버스위치정보 API KEY
    const cityCode = userInfo?.cityCode; // 대전광역시
    const routeId = userInfo?.routeId; // 노선 ID

    //버스 위치 정보
    const fetchBusLocation = async () => {
        const busUrl = `http://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeId}&_type=json`
        
        try {
            const response = await fetch(busUrl);
            const data = await response.json();

            console.log("API 응답 데이터:", JSON.stringify(data, null, 2));

            const items = data?.response?.body?.items?.item;

            if (items && Array.isArray(items)) {
                // userInfo?.vehicleno와 일치하는 데이터 추출
                const matchingBus = items.find(
                    (item) => item.vehicleno === userInfo?.vehicleno
                );

                if (matchingBus) {
                    console.log("일치하는 버스 데이터:", matchingBus);
                    setCurrentNode({
                        nodeid: matchingBus.nodeid,
                        nodenm: matchingBus.nodenm,
                    });
                    setBusLocation({
                        latitude: matchingBus.gpslati,
                        longitude: matchingBus.gpslong,
                    });
                    
            } else {
                console.warn("일치하는 버스를 찾을 수 없습니다.");
            }
        } else {
            console.warn("조건에 맞는 데이터가 없습니다.");
        }
    } catch (error) {
        console.error("API 호출 실패:", error);
    }
};
    //노선 데이터 API
    const fetchAdjacentStops = async () => {
        const routeUrl = `http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeId}&_type=json`;
    
        try {
            const response = await fetch(routeUrl);
            const data = await response.json();
            const totalCount = data?.response?.body?.totalCount;
            if (totalCount && totalCount > 0) {
                const fullRouteUrl = `${routeUrl}&numOfRows=${totalCount}`;
                const fullResponse = await fetch(fullRouteUrl);
                const fullData = await fullResponse.json();

                const items = fullData?.response?.body?.items?.item;
                if (items && Array.isArray(items)) {
                    setRouteData(items);
                    console.log("전체 노선 데이터(routeData):", items);
                }
            }
        } catch (error) {
            console.error("노선 데이터 가져오기 실패:", error);
        }
    };

    // 현재,다음,이전 정류장 계산
    useEffect(() => {
        if (currentNode.nodeid && routeData.length > 0) {
            // 현재 정류장 인덱스 찾기
            const currentIndex = routeData.findIndex(
                (stop) => stop.nodeid === currentNode.nodeid
            );

            if (currentIndex !== -1) {
                // 이전 정류장 (존재하면 설정, 없으면 null)
                const previous = routeData[currentIndex - 1];
                setPreviousStop(previous ? previous.nodeid : null);

                // 다음 정류장 (존재하면 설정, 없으면 null)
                const next = routeData[currentIndex + 1];
                setNextStop(next ? next.nodenm : null);

                console.log(
                    `현재 정류장: ${routeData[currentIndex].nodenm}, 이전: ${previous?.nodenm || '없음'}, 다음: ${next?.nodenm || '없음'}`
                );
            } else {
                console.warn('현재 정류장을 찾을 수 없습니다.');
                setPreviousStop(null);
                setNextStop(null);
            }
        }
    }, [currentNode, routeData]);
        

    // WebSocket 연결
    useEffect(() => {
        const connectWebSocket = () => {
            ws.current = new WebSocket('ws://221.168.128.40:3000');

            ws.current.onopen = () => {
                console.log('WebSocket 연결 성공');
                setWsStatus('연결됨');
            };

            ws.current.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log(message);
                if (message.type === 'activate-bell') {
                    const { destination } = message;
    
                    // 노선 데이터에서 destination과 일치하는 nodenm 찾기
                    const matchingNode= routeData.find(
                        (node) => node.nodenm === destination
                    );
    
                    if (matchingNode) {
                        setAlertText(matchingNode.nodenm);
                        setIsAlertActive(true);
                        
                    }
                }
            };

            ws.current.onclose = () => {
                console.warn('WebSocket 연결 종료');
                setWsStatus('연결 끊김');
                setTimeout(connectWebSocket, 5000); // 5초 후 재연결
            };

            ws.current.onerror = (error) => {
                console.error('WebSocket 에러:', error);
                setWsStatus('연결 실패');
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) ws.current.close();
        };
    }, [routeData]);
    
    // 알림 비활성화
    const deactivateAlert = () => {
        setIsAlertActive(false);
        setAlertText('정상 운행');
    };

    
    // 버스 위치&노선 데이터 가져오기
    useEffect(() => {
        const intervalId = setInterval(() => {
            // 최신화할 데이터 함수 호출
            fetchBusLocation();
            if (currentNode) {
                fetchAdjacentStops();
            }
            console.log("데이터를 최신화.");
        }, 9000); // 9초마다 호출
    
        return () => {
            clearInterval(intervalId);
        };
    }, [currentNode]);

    return (
        <View style={styles.container}>
            {/* 상단 정보 */}
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                    진행 정보: {currentNode.nodenm ? `${currentNode.nodenm} → ${nextStop || '없음'}` : '알 수 없음'}
                </Text>
            </View>
    
            {/* 중앙 알림 칸 (버튼) */}
            <View style={styles.centerContainer}>
                <TouchableOpacity
                    style={[
                        styles.alertIndicator,
                        isAlertActive ? styles.alertActive : styles.alertInactive,
                    ]}
                    onPress={deactivateAlert}
                >
                    <Text style={styles.alertText}>{alertText}</Text>
                </TouchableOpacity>
            </View>
    
            {/* 하단 정보 */}
            <View style={styles.bottomInfoBox}>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
    },
    infoBox: {
        position: 'absolute',
        top: 20, // 화면 상단 여백
        width: '90%',
        backgroundColor: '#F3C623',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
    },
    infoText: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
    centerContainer: {
        flex: 1, // 남은 공간을 채워 중앙 정렬
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIndicator: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
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
        position: 'absolute',
        bottom: 20, // 화면 하단 여백
        width: '90%',
        backgroundColor: '#D1E8E2',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        alignSelf: 'center',
    },
    bottomInfoText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
    },
    requestedStopText: {
        fontSize: 18,
        color: '#444',
    },
    separator: {
        width: 10, // 항목 사이 간격
    },
    emptyListText: {
        fontSize: 18,
        color: '#888',
        fontStyle: 'italic',
    },
});

export default BusDriverScreen;