import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import useUserStore from '../store/userStore';

function BusDriverScreen({ navigation }) {
    const { userInfo } = useUserStore();
    const [routeData, setRouteData] = useState([]); // 전체 노선 데이터
    const [currentNode, setCurrentNode] = useState({ nodeid: null, nodenm: null }); // 현재 정류장
    const [nextStop, setNextStop] = useState(); // 다음 정류장

    // 정류장 데이터를 가져오는 함수
    const fetchAdjacentStops = async () => {
        const apiKey = "7qe7vg3zUQdiZErzcHVVolstffAp3wUBke37nX4dyFcWCPsjYsiHmb5Su25Dw%2Fs1uv5zk6sh3oQq4sIynl8z0A%3D%3D"; // 국토교통부 API 키
        const cityCode = userInfo?.cityCode;
        const routeId = userInfo?.routeId;

        const routeUrl = `http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeId}&_type=json`;

        try {
            const response = await fetch(routeUrl);
            const data = await response.json();
            const items = data?.response?.body?.items?.item;

            if (items && Array.isArray(items)) {
                console.log("정류장 데이터:", items); // 디버깅용 출력
                setRouteData(items); // 전체 정류장 데이터 설정
            } else {
                console.warn("정류장 데이터가 없습니다.");
                Alert.alert("경고", "데이터를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("노선 데이터 가져오기 실패:", error);
            Alert.alert("경고", "데이터를 찾을 수 없습니다.");
        }
    };

    // 버스 위치 데이터를 가져오는 함수
    const fetchBusLocation = async () => {
        const apiKey = "7qe7vg3zUQdiZErzcHVVolstffAp3wUBke37nX4dyFcWCPsjYsiHmb5Su25Dw%2Fs1uv5zk6sh3oQq4sIynl8z0A%3D%3D";
        const cityCode = userInfo?.cityCode;
        const routeId = userInfo?.routeId;

        const busUrl = `http://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeId}&_type=json`;

        try {
            const response = await fetch(busUrl);
            const data = await response.json();
            const items = data?.response?.body?.items?.item;

            if (items && Array.isArray(items)) {
                const matchingBus = items.find(
                    (item) => item.vehicleno === userInfo?.vehicleno
                );

                if (matchingBus) {
                    console.log("현재 버스 위치:", matchingBus); // 디버깅용 출력
                    setCurrentNode({
                        nodeid: matchingBus.nodeid,
                        nodenm: matchingBus.nodenm,
                    });
                } else {
                    console.warn("일치하는 버스를 찾을 수 없습니다.");
                    Alert.alert("경고", "운행이 종료된 버스입니다.");
                }
            } else {
                console.warn("버스 위치 데이터가 없습니다.");
                Alert.alert("경고", "데이터를 찾을 수 없습니다.");
            }
        } catch (error) {
            console.error("버스 위치 데이터 가져오기 실패:", error);
            Alert.alert("오류", "버스 위치 데이터를 가져오는 중 오류가 발생했습니다.");
        }
    };

    // 현재 정류장 업데이트
    useEffect(() => {
        if (currentNode.nodeid && routeData.length > 0) {
            const currentIndex = routeData.findIndex((stop) => stop.nodeid === currentNode.nodeid);
            const next = routeData[currentIndex + 1];
            setNextStop(next?.nodenm || '없음'); // 다음 정류장 설정
        }
    }, [currentNode, routeData]);

    useEffect(() => {
        fetchAdjacentStops(); // 정류장 데이터 가져오기
        fetchBusLocation(); // 버스 위치 데이터 가져오기

        const intervalId = setInterval(() => {
            fetchBusLocation();
        }, 120000); // 2분마다 위치 업데이트

        return () => clearInterval(intervalId);
    }, []);

    // 정류장 리스트 렌더링
    const renderStopItem = ({ item }) => {
        const isCurrent = item.nodeid === currentNode.nodeid; // 현재 정류장 여부

        return (
            <View style={[styles.stopContainer, isCurrent && styles.currentStopContainer]}>
                {/* 타임라인 원 */}
                <View
                    style={[
                        styles.stopCircle,
                        isCurrent && styles.currentStopCircle, // 현재 정류장은 강조
                    ]}
                />
                {/* 정류장 이름 */}
                <View
                    style={[
                        styles.stopTextContainer,
                        isCurrent && styles.currentStopTextContainer, // 현재 정류장은 강조
                    ]}
                >
                    <Text style={[styles.stopText, isCurrent && styles.currentStopText]}>{item.nodenm}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* 상단 정보 */}
            <View style={styles.header}>
                <Text style={styles.headerText}>{`${userInfo?.busNumber || '버스 번호 없음'}번 버스기사님`}</Text>
                <Text style={styles.subHeaderText}>{`현재 ${userInfo?.passengerCount || 0}명 탑승 중`}</Text>
            </View>

            {/* 타임라인 및 정류장 리스트 */}
            <View style={styles.timelineContainer}>
                <View style={styles.timelineLine} />
                <FlatList
                    data={routeData}
                    renderItem={renderStopItem}
                    keyExtractor={(item) => item.nodeid?.toString() || Math.random().toString()}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#d3d3d3', // 상단 배경색
        paddingVertical: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    subHeaderText: {
        fontSize: 14,
        color: '#666',
    },
    timelineContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    timelineLine: {
        width: 2,
        backgroundColor: '#000',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 35, // 타임라인 위치
    },
    stopContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#f9f9f9', // 정류장 기본 배경색
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    currentStopContainer: {
        backgroundColor: '#FFFFE0', // 현재 정류장 배경 강조
        borderColor: '#FFD700',
    },
    stopCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ccc', // 기본 원 색상
        marginRight: 10,
    },
    currentStopCircle: {
        backgroundColor: '#FFD700', // 현재 정류장 강조 (노란색)
    },
    stopTextContainer: {
        padding: 10,
        borderRadius: 5,
    },
    currentStopTextContainer: {
        backgroundColor: '#FFFFE0', // 현재 정류장 배경 강조 (밝은 노란색)
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    stopText: {
        fontSize: 16,
        color: '#000',
    },
    currentStopText: {
        fontWeight: 'bold', // 현재 정류장 텍스트 강조
        color: '#000',
    },
});

export default BusDriverScreen;
