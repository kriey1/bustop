import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av'; // 오디오 녹음
import * as FileSystem from 'expo-file-system'; // 파일 시스템
import * as Speech from 'expo-speech'; // TTS
import axios from 'axios'; // HTTP 요청
import useUserStore from '../store/userStore'; //유저정보
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location'; // 위치정보

// Whisper 서버 URL
// 로컬 환경에서 iOS 시뮬레이터를 사용할 경우 "http://localhost:5001"를 그대로 사용하세요.
// 실제 기기를 사용할 경우 서버가 실행 중인 컴퓨터의 IP 주소로 변경해야 합니다.
const WHISPER_SERVER_URL = "http://221.168.128.40:5001/transcribe"; // YOUR_LOCAL_IP를 컴퓨터 IP 주소로 변경

function MainScreen({ nearestStation }) {
  const [recording, setRecording] = useState(null); // 녹음 객체
  const [recognizedText, setRecognizedText] = useState(''); // 변환된 텍스트
  const [currentStep, setCurrentStep] = useState(0); // 메시지 순서
  const [isListening, setIsListening] = useState(false); // 음성 인식 상태
  const { userInfo, registration } = useUserStore(); //유저 로그인 정보
  const [departure, setDeparture] = useState('현재위치'); // 출발지
  const [departureCoords, setDepartureCoords] = useState({latitude: 36.27924625576773, longitude: 127.24592127929606,});
  const [destination, setDestination] = useState('군포시장애인복지관'); //목적지
  const [destinationCoords, setDestinationCoords] = useState({latitude: 37.3626159427669, longitude: 126.93294757362182,});
  const [routeData, setRouteData] = useState(null); //경로
  const [nodeRouteData, setNodeRouteData] = useState(null); //출발 정류장으로 가는 경로
  const [currentStepIndex, setCurrentStepIndex] = useState(0);//경로 안내단계
  const [firstNode, setFirstNode] = useState({firstNodeName:'stationName', latitude:'lat', longitude:'lon'}); //출발 정류장
  const [targetNode, setTargetNode] = useState({targetNodeName:'stationName', latitude:'lat', longitude:'lon'}); //도착 정류장
  const cityCode = '31160';
  const [routeInfo, setRouteInfo] = useState({routenm:'', routeId:''});
  const [userVehicleno, setUserVehicleno] = useState(''); // 탑승할 버스 번호
  const [userNodeord, setUserNodeord] = useState(null); // 유저가 출발 정류소
  const [targetNodeord, setTargetNodeord] = useState(null);
  const [busStopsAway, setBusStopsAway] = useState(null); // 몇 정거장 전인지 상태 관리
  const [currentBusNode, setCurrentBusNode] = useState(null);
  const [currentBusRouteData, setCurrentBusRouteData] = useState(null);
  const apiKey = 'cjPl5Q0WfmVlbYWXDsTQgOg8KD%2F5R5IMPY4Ft%2Fz%2Bt6FY1NQb2kpRB5PHzkRZsgrSDKDPlSvL0H%2BglmFVN36OBA%3D%3D'
  const TMAP_API_KEY = "iORUqRFjtu9JfkUGPMpg040iu3hXCvyS5icJo7kO";

  // 초기화
  const handleReset = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('초기화 완료', '모든 데이터가 삭제되었습니다.');
      navigation.replace('UserSignupScreen'); // 초기화 후 다시 회원가입 화면으로 이동
    } catch (error) {
      Alert.alert('초기화 실패', '데이터 삭제 중 문제가 발생했습니다.');
    }
  };
  let cachedPin = null;
  
  useEffect(() => {
    const loadPin = async () => {
      if (!cachedPin) {
        cachedPin = await AsyncStorage.getItem('userPin'); // PIN 값 캐싱
      }
  
      if (!cachedPin) {
        console.error('PIN 정보가 없습니다.');
        return;
      }
  
      console.log('캐싱된 PIN:', cachedPin);
    };
  
    loadPin();
  }, []);

   // 현재 위치 가져오기
   const fetchCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('위치 권한이 필요합니다.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setDepartureCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      console.log("현재 위치:", location.coords);
    } catch (error) {
      console.error("현재 위치 가져오기 실패:", error);
    }
  };

  // 컴포넌트가 처음 마운트될 때 현재 위치 가져오기
  useEffect(() => {
    fetchCurrentLocation();
  }, []);




  // Whisper 서버 호출하여 STT 실행
  const convertSpeechToTextWithWhisper = async (audioUri) => {
    try {
      const formData = new FormData();
      formData.append("audio", {
        uri: audioUri,
        type: "audio/wav",
        name: "audio.wav",
      });

      const response = await fetch(WHISPER_SERVER_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        console.error("STT 서버 응답 오류:", response.status, response.statusText);
        return "오류 발생";
      }

      const data = await response.json();
      if (data.error) {
        console.error("STT 서버 오류:", data.error);
        return "오류 발생";
      }

      return data.text || "인식된 텍스트 없음";
    } catch (error) {
      console.error("STT 요청 중 오류 발생:", error);
      return "오류 발생";
    }
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    console.log("startRecord");
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('오디오 녹음 권한이 필요합니다.');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      console.log("녹음 시작됨:", recording);
      setRecording(recording);
      setIsListening(true);
    } catch (error) {
      console.error('녹음 시작 중 오류 발생:', error);
    }
  };



  // 음성 녹음 종료 및 Whisper STT 실행
  const stopRecording = async () => {
    console.log("stopRecording", recording);
    if (recording) {
      try {
        setIsListening(false); // 음성 인식 비활성화
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI(); // 녹음된 파일 경로
        setRecording(null);

        const response = await convertSpeechToTextWithWhisper(uri);
        setRecognizedText(response); // 변환된 텍스트 화면에 표시
        setDestination(response);
        searchPOI(response);
      } catch (error) {
        console.error("녹음 종료 중 오류 발생:", error);
      }
    }
  };

  // Tmap POI로 목적지 검색
  const searchPOI = async (keyword) => {
    try {
      const response = await fetch(
        `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${encodeURIComponent(
          keyword
        )}&appKey=${TMAP_API_KEY}`
      );
      const data = await response.json();
      if (data.searchPoiInfo?.pois?.poi?.length > 0) {
        const firstPOI = data.searchPoiInfo.pois.poi[0];
        const coords = {
          frontLat: firstPOI.frontLat,
          frontLon: firstPOI.frontLon,
        };
        setDestinationCoords(coords);
        console.log("목적지 좌표:", coords);
        await requestRoute(coords); // 경로 요청
      } else {
        alert("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("POI 검색 중 오류 발생:", error);
    }
  };
  
  // 목적지까지 경로 요청
  const requestRoute = async () => {
    if (!departureCoords.latitude || !departureCoords.longitude) {
      alert('현재 위치를 가져올 수 없습니다.');
      return;
    }

    try {
      const response = await fetch('https://apis.openapi.sk.com/transit/routes', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          appKey: TMAP_API_KEY,
        },
        body: JSON.stringify({
          version: 1,
          startX: parseFloat(departureCoords.longitude),
          startY: parseFloat(departureCoords.latitude),
          endX: parseFloat(destinationCoords.longitude),
          endY: parseFloat(destinationCoords.latitude),
          startName: '출발지',
          endName: '도착지',
          reqCoordType: 'WGS84GEO',
          resCoordType: 'WGS84GEO',
          count: 1,
        }),
      });
      const data = await response.json();
      setRouteData(data);
      console.log("경로정보:", data);
      extractLegDetails(routeData);
    } catch (error) {
      Alert.alert('경로 요청 오류.', error.message);
    }
  };
  //첫번째 경로
  const extractLegDetails = (routeData) => {
    if (
      !routeData ||
      !routeData.metaData ||
      !routeData.metaData.plan ||
      !routeData.metaData.plan.itineraries
    ) {
      console.error("유효하지 않은 데이터입니다.");
      return [];
    }
  
    // 첫 번째 itinerary에서 legs 추출
    const itinerary = routeData.metaData.plan.itineraries[0];
    const legs = itinerary.legs;
  
    if (!legs || legs.length === 0) {
      console.error("legs 데이터가 없습니다.");
      return [];
    }
  
    // WALK 구간에서 첫 번째 인덱스 데이터 추출
    const firstWalkingLeg = legs.find((leg) => leg.mode === "WALK");

    if (firstWalkingLeg) {
      const { steps } = firstWalkingLeg;
      setNodeRouteData({ steps });
      console.log("WALK 구간 정보:", { steps });
    }

    // BUS 구간만 필터링하고 추가 정보 추출
    const busLegDetails = legs
      .filter((leg) => leg.mode === "BUS") // BUS인 구간만 필터링
      .map((leg) => {
        const routeNumber = leg.route ? leg.route.match(/\d+/)?.[0] || null : null; // route에서 숫자 추출
        return{
        end: leg.end, // 도착지 정보
        passShape: leg.passShape || null, // 경로 모양
        passStopList: leg.passStopList || null, // 정류장 목록
        route: leg.route || null, // 노선 정보
        routeNumber,
        };
      });
      if (busLegDetails.length > 0) {
        const firstBusLeg = busLegDetails[0]; // 첫 번째 BUS 구간
        const stationList = firstBusLeg.passStopList?.stationList;
        
        if (stationList && stationList.length > 0) {
          // 정류장 목록의 첫 번째와 마지막을 설정
          setFirstNode({firstNodeName:stationList[0].stationName, latitude:stationList[0].lat, longitude:stationList[0].lon});
          setTargetNode({targetNodeName:stationList[stationList.length - 1].stationName, latitude:stationList[stationList.length - 1].lat, longitude:stationList[stationList.length - 1].stationName});
        }
      } 
      console.log("추출된 BUS 노선 정보:", busLegDetails);
      // BUS 구간의 routeNumber 출력
      busLegDetails.forEach((leg, index) => {
        console.log(`BUS 인덱스 ${index}의 routeNumber:`, leg.routeNumber);
        getRouteNoList(leg.routeNumber);
      });
      };

    // 정류장 이름을 ID로 변환
    const getRouteNoList = async (routeNumber) => {
      const routeUrl = `http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteNoList?serviceKey=${apiKey}&cityCode=${cityCode}&routeNo=${routeNumber}&_type=json`;
      try {
        const response = await fetch(routeUrl);
        const data = await response.json();
        console.log("API 응답 데이터:", data);
        // 유효성 검사
        if (!data || !data.response || !data.response.body || !data.response.body.items) {
          console.error("유효하지 않은 응답 데이터:", data);
          return null;
        }
    
        const items = data.response.body.items.item;
    
        // 단일 객체가 반환될 수도 있고 배열이 반환될 수도 있음
        const routeList = Array.isArray(items) ? items : [items];
    
        // 노선 데이터에서 필요한 정보 추출
        const routeDetails = routeList.map((route) => ({
          routenm: route.routeno,
          routeId: route.routeid,
        }));
    
        console.log("추출된 노선 정보:", routeDetails);
        if (routeDetails.length > 0) {
          const firstRoute = routeDetails[0]; // 첫 번째 노선 정보
          setRouteInfo({ routenm: firstRoute.routenm, routeId: firstRoute.routeId });
          console.log("routeInfo 상태 업데이트 완료:", firstRoute);
        } else {
          console.warn("추출된 노선 정보가 비어 있습니다.");
        }
        findFirstNode();
        console.log("findFirstNode 호출 완료");
      } catch (error) {
        console.error("노선 데이터를 가져오는 중 오류 발생:", error);
      }
    };

  //유저의 정류장 정보
  const findFirstNode = async () => {
    const routeUrl = `http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeInfo.routeId}&_type=json`;
    const firstNodeName = firstNode.firstNodeName;
    const targetNodeName = targetNode.targetNodeName;

    try {
        // 노선 데이터의 총 개수 확인
        const response = await fetch(routeUrl);
        const data = await response.json();
        const totalCount = data?.response?.body?.totalCount;
        console.log("findFirstNode API 응답 데이터:", routeInfo.routeId, data);

        if (totalCount && totalCount > 0) {
            // 전체 데이터를 가져오기 위해 numOfRows에 totalCount 사용
            const fullRouteUrl = `${routeUrl}&numOfRows=${totalCount}`;
            const fullResponse = await fetch(fullRouteUrl);
            const fullData = await fullResponse.json();
            console.log("findFirstNode 전체 데이터:", fullData);

            const items = fullData?.response?.body?.items?.item;

            if (items && Array.isArray(items)) {
                console.log("추출된 정류장 목록:", items);
                // firstNodeName과 targetNodeName에 해당하는 모든 정류장의 nodeord 찾기
                const firstNodeMatches = items
                  .filter((item) => item.nodenm === firstNodeName)
                  .map((item) => item.nodeord);

                const targetNodeMatches = items
                  .filter((item) => item.nodenm === targetNodeName)
                  .map((item) => item.nodeord);

                console.log("firstNodeName의 nodeord:", firstNodeMatches);
                console.log("targetNodeName의 nodeord:", targetNodeMatches);

                // 가장 근접한 nodeord 쌍 찾기
                let closestFirstNode = null;
                let closestTargetNode = null;
                let closestDistance = Infinity;

                firstNodeMatches.forEach((firstNodeOrd) => {
                  targetNodeMatches.forEach((targetNodeOrd) => {
                    const distance = Math.abs(targetNodeOrd - firstNodeOrd);
                    if (distance < closestDistance) {
                      closestFirstNode = firstNodeOrd;
                      closestTargetNode = targetNodeOrd;
                      closestDistance = distance;
                    }
                  });
                });

                if (closestFirstNode !== null) {
                  setUserNodeord(closestFirstNode);
                  setTargetNodeord(closestTargetNode); // 상태 업데이트
                  console.log(`가장 근접한 firstNodeName의 nodeord와 TargetNode의 nodeord:`, closestFirstNode, closestTargetNode);
                  return closestFirstNode;
                } else {
                  console.warn("firstNodeName과 targetNodeName 간의 근접한 nodeord를 찾을 수 없습니다.");
                }
              }
            }
          } catch (error) {
            console.error("노선 데이터 가져오기 실패:", error);
          }
  };

  //버스 위치 정보
  const fetchBusLocation = async () => {
    const busUrl = `http://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeInfo.routeId}&_type=json`
    
    try {
        const response = await fetch(busUrl);
        const data = await response.json();

        console.log("API 응답 데이터:", JSON.stringify(data, null, 2));

        const items = data?.response?.body?.items?.item;

        if (items && Array.isArray(items)) {
            // userVehicleno와 일치하는 데이터 추출
            const matchingBus = items.find(
                (item) => item.vehicleno === userVehicleno
            );

            if (matchingBus) {
                console.log("일치하는 버스 데이터:", matchingBus);
                setCurrentBusNode({
                    nodeid: matchingBus.nodeid,
                    nodenm: matchingBus.nodenm,
                    nodeord: matchingBus.nodeord,
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
    const routeUrl = `http://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteAcctoThrghSttnList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeInfo.routeId}&_type=json`;

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
                setCurrentBusRouteData(items);
                return;
            }
        }
    } catch (error) {
        console.error("노선 데이터 가져오기 실패:", error);
    }
};

  //버스와 정류장 사이 거리
  const fetchDestinationAway = async () => {
    try {
      // 1. 현재 버스 위치 가져오기
      await fetchBusLocation();
      console.log("현재 버스 위치:", currentBusNode);
      // 2. 전체 노선 데이터 가져오기
      await fetchAdjacentStops();
      // 3. 정거장 간 거리 계산
      const currentIndex = currentBusRouteData.findIndex(
        (stop) => stop.nodeord === currentBusNode.nodeord
      );
      const targetIndex = currentBusRouteData.findIndex(
        (stop) => stop.nodeord === targetNodeord
      );
  
      if (currentIndex === -1 || targetIndex === -1) {
        throw new Error("현재 위치 또는 목표 정류장을 찾을 수 없습니다.");
      }
  
      const destinationAway = Math.abs(targetIndex - currentIndex); // 정거장 차이 계산
      console.log(
        `${targetNode.targetNodeName} 정거장까지 ${destinationAway} 정거장 전입니다.`
      );
  
      // 4. 상태 업데이트
      setBusStopsAway(destinationAway);
      return destinationAway;
    } catch (error) {
      console.error("버스 정거장 계산 실패:", error.message);
      return null;
    }
  };

  //버스와 정류장 사이 거리
  const fetchBusStopsAway = async () => {
    try {
      // 1. 현재 버스 위치 가져오기
      await fetchBusLocation();
      console.log("현재 버스 위치:", currentBusNode);
      // 2. 전체 노선 데이터 가져오기
      await fetchAdjacentStops();
  
      // routeData와 currentNode 확인
      if (!Array.isArray(currentBusRouteData)) {
        console.error("routeData가 배열이 아닙니다. 현재 데이터:", currentBusRouteData);
        return null;
      }

      if (!currentBusNode) {
        console.error("현재 버스 위치(currentBusNode)가 설정되지 않았습니다.");
        return null;
      }
  
      // 3. 현재 버스의 정류장 순서(nodeord)와 유저 정류장 순서 비교
      const busStopIndex = currentBusRouteData.findIndex((stop) => stop.nodeord === currentBusNode.nodeord);
      const userStopIndex = currentBusRouteData.findIndex((stop) => stop.nodeord === userNodeord);
  
      if (busStopIndex === -1 || userStopIndex === -1) {
        console.warn("현재 버스 위치 또는 유저 정류장을 찾을 수 없습니다.");
        return null;
      }
  
      // 4. 정거장 간 거리 계산
      const stopsAway = userStopIndex - busStopIndex;
      console.log(`버스는 유저 정류장에서 ${stopsAway} 정거장 전입니다.`);
      setBusStopsAway(stopsAway);
    } catch (error) {
      console.error("버스 정거장 계산 실패:", error);
      return null;
    }
  };

  // 유저의 정류정에서 타야 할 버스 정보 찾기
  const findTargetBusInfo = async () => {
    const busUrl = `http://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList?serviceKey=${apiKey}&cityCode=${cityCode}&routeId=${routeInfo.routeId}&_type=json`;

    try {
        const response = await fetch(busUrl);
        const data = await response.json();

        console.log("API 응답 데이터:", JSON.stringify(data, null, 2));
        console.log(userNodeord);
        const items = data?.response?.body?.items?.item;

        if (items && Array.isArray(items)) {
          const filteredItems = items.filter((item) => item.nodeord < userNodeord);
          if (filteredItems.length === 0) {
            console.log("조건에 맞는 버스가 없습니다.");
            return null; // 필터 결과 없음
          }
    
          // 필터링된 결과에서 가장 가까운 버스 찾기
          const nearestBus = filteredItems.reduce((prev, current) =>
            current.nodeord > prev.nodeord ? current : prev, filteredItems[0]);

            if (nearestBus) {
                setUserVehicleno(nearestBus.vehicleno);
                console.log("가장 근접한 버스의 vehicleno:", nearestBus.vehicleno);
                fetchBusStopsAway();
                if(busStopsAway>3){
                  const message = `${routeInfo.routenm} 버스가 ${busStopsAway} 정거장 전입니다.`;
                  Speech.speak(message, { language: "ko-KR" });
                  return;
                }else{
                  const message = `${routeInfo.routenm} 버스가 잠시후 도착합니다.`;
                  Speech.speak(message, { language: "ko-KR" });
                  return;
                };
            } else {
                console.log("조건에 맞는 버스를 찾을 수 없습니다.");
                return null;
            }
        } else {
            console.warn("API에서 유효한 버스 정보를 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("API 호출 실패:", error);
    }
  };

  // WebSocket 및 GPS 데이터 전송
  useEffect(() => {
    const ws = new WebSocket('ws://221.168.128.40:3000'); // WebSocket 서버 주소

    ws.onopen = () => {
      console.log('WebSocket 연결 성공');

      const sendGPSData = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('위치 권한이 거부되었습니다.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const data = {
          type: 'gps-update',
          departure,
          destination,
          pin: cachedPin,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        ws.send(JSON.stringify(data)); // 서버로 GPS 데이터 전송
        console.log('GPS 데이터 전송:', data);
      };

      // 5초마다 GPS 데이터를 서버로 전송
      const interval = setInterval(sendGPSData, 5000);

      return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
    };
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // 승차 요청 메시지 전송
  const activateGetOnBell = () => {
    const ws = new WebSocket('ws://221.168.128.40:3000'); // WebSocket 서버 주소

    ws.onopen = () => {
      const data = {
        type: 'activate-getOn-bell',
        vehicleno: userVehicleno, // 버스 번호
        nodeord: userNodeord, // 승차 정류장
        firstNode: firstNode.firstNodeName,
      };
      ws.send(JSON.stringify(data));
      console.log('승차 요청 메시지 전송:', data);
      setTimeout(() => {
        ws.close();
      }, 100); // 100ms 대기
    };
    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
    };
  };
  // 승차 요청 취소
  const removeGetOnRequest = () => {
    const ws = new WebSocket('ws://221.168.128.40:3000'); // WebSocket 서버 주소
    ws.onopen = () => {
      const data = {
        type: 'clear-specific-getOn-bell',
        firstNode: firstNode.firstNodeName, // 제거할 요청 이름
      };
      ws.send(JSON.stringify(data));
      console.log('승차 취소 메시지 전송:', data);
      setTimeout(() => {
        ws.close();
      }, 100); // 100ms 대기
    };
      console.log('승차 요청 취소 메시지 전송:', firstNode);
  };

  // 하차벨 활성화 메시지 전송
  const activateGetOffBell = () => {
    const ws = new WebSocket('ws://221.168.128.40:3000'); // WebSocket 서버 주소

    ws.onopen = () => {
      const data = {
        type: 'activate-getOff-bell',
        vehicleno: userVehicleno, // 버스 번호
        targetNode: targetNode.targetNodeName,
      };
      ws.send(JSON.stringify(data));
      console.log('하차 요청 메시지 전송:', data);
      setTimeout(() => {
        ws.close();
      }, 100); // 100ms 대기
    };

    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket 닫힘');
    };
  };

  // 현재 메시지 반복
  const repeatMessage = () => {
    console.log("반복 안내 실행");
    const description = nodeRouteData?.steps?.[currentStepIndex]?.description;
    if (description) {
      Speech.speak(description, { language: "ko-KR" });
    }
  };

  // WALK 단계를 다음 단계로 이동
  const nextWalkStep = () => {
    console.log("다음 도보 안내로 이동");
    if (currentStepIndex < nodeRouteData.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      nextStep(); // 마지막 단계에서는 다음 메시지로 이동
    }
  };

  // 다음 메시지로 이동
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, messages.length - 1));
  };


  // 단계별 단일/더블 탭 동작 설정
  const singleTapHandlers = {
    2: repeatMessage, // currentStep === 2에서는 repeatMessage 호출
    4: () => {
      if (busStopsAway >= 1 && busStopsAway <= 3) {
        activateGetOnBell;
        nextStep(); // busStopsAway <= 3일 때 다음 단계로 이동
      } else {
        findTargetBusInfo(); // busStopsAway > 3일 때 버스 정보 갱신
      }
    },
    5: () => {
      removeGetOnRequest();
      nextStep();
    },
    6: fetchDestinationAway,
  };

  const doubleTapHandlers = {
    2: nextWalkStep, // currentStep === 2일 때 nextWalkStep 호출
    4: () => {       // currentStep === 4일 때 두 함수 실행
        activateGetOnBell();
        nextStep();
    },
    5: () => {
      removeGetOnRequest();
      setCurrentStep(3); // 3단계로 이동
    },
    6: nextStep,
  };

  // 메시지 리스트
  const messages = [
    { text: "목적지를 말씀해주세요.", options: [destination], useTap: false }, // 음성 인식 활성화 단계
    { text: `${firstNode.firstNodeName} 정류장을 안내합니다.`, options: [nearestStation], useTap: true },
    { text: Array.isArray(nodeRouteData?.steps) && currentStepIndex < nodeRouteData.steps.length
        ? `${nodeRouteData.steps[currentStepIndex]?.description}하세요. 반복 안내는 한번, 다음 안내는 더블 탭 하십시오.`
        : '', options: [], useTap: true},
    { text: `${firstNode.firstNodeName}에서 ${targetNode.targetNodeName}까지 가는 버스는 ${routeInfo.routenm}입니다.\n안내를 시작할까요?`, options: ["맞다면 한번 탭\n아니라면 두번 탭"], useTap: false },
    { text: busStopsAway !== null
      ? `${routeInfo.routenm} 버스가 ${busStopsAway} 정거장 전입니다.`
      : `탭하여 ${routeInfo.routenm} 버스 정보를 불러옵니다.`, options: [], useTap: true},
    { text: "버스에 탑승하셨나요?", options: [], useTap: true },
    { text: busStopsAway !== null
      ? `${targetNode.targetNodeName}까지 ${busStopsAway}정거장 남았습니다.`
      : `탭하여 ${targetNode.targetNodeName}까지 남은 정거장을 불러옵니다.`, options: [], useTap: true },
    { text: "하차 시 아래 버튼을 눌러주세요.", options: [], useTap: false }
  ];

  // 메시지 변경 시 TTS 실행
  useEffect(() => {
    const message = messages[currentStep]?.text;
    if (message) {
      Speech.speak(message, { language: "ko-KR" });
    }
  }, [currentStep]);
  useEffect(() => {
    if (currentStep === 2) {
      const description = nodeRouteData?.steps?.[currentStepIndex]?.description;
      if (description) {
        Speech.speak(description, { language: "ko-KR" });
      }
    }
  }, [currentStepIndex, currentStep]);



  
  // 탭 동작 핸들러
  let tapTimeout = null;
  const handleTap = () => {
    if (tapTimeout) {
      // 두 번 탭
      clearTimeout(tapTimeout);
      tapTimeout = null;
      if (doubleTapHandlers[currentStep]) {
        doubleTapHandlers[currentStep](); // 현재 단계의 이중 탭 핸들러 호출
      } else {
        console.log("이중 탭 동작이 정의되지 않았습니다.");
      }
    } else {
      // 한 번 탭
      tapTimeout = setTimeout(() => {
        if (singleTapHandlers[currentStep]) {
          singleTapHandlers[currentStep](); // 현재 단계의 단일 탭 핸들러 호출
        } else {
          console.log("단일 탭 동작이 정의되지 않았습니다.");
        }
        tapTimeout = null;
      }, 300); // 300ms 안에 두 번 탭 시 이중 탭으로 처리
    }
  };

 
  // UI 렌더링
  return (
    <View style={styles.container}>
      {/* 초기화 버튼 */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>초기화</Text>
      </TouchableOpacity>
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{messages[currentStep].text}</Text>
        {messages[currentStep].useTap && (
          messages[currentStep].options.map((option, index) => (
            <Text key={index} style={styles.optionText}>{option}</Text>
          ))
        )}
      </View>

      {/* 음성 인식 버튼 (0단계) */}
      {currentStep === 0 && (
        <>
          {recognizedText && (
            <Text style={styles.recognizedText}>인식된 텍스트: {recognizedText}</Text>
          )}
          <TouchableOpacity
            style={[styles.touchButton, { backgroundColor: isListening ? '#F00' : '#0F0' }]}
            onPressIn={startRecording}  // 버튼 누를 때 녹음 시작
            onPressOut={stopRecording} // 버튼 뗄 때 녹음 종료
          >
            <Text style={styles.touchButtonText}>
              {isListening ? '음성 인식 중...' : '도착지'}
            </Text>
          </TouchableOpacity>
        </>
      )}
      {/* 길안내 (1단계)(임시)*/}
      {currentStep === 1 && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            길안내
          </Text>
          {routeData && routeData.length > 0 ? (
            routeData.map((step, index) => (
              <Text key={index} style={{ marginBottom: 5 }}>
                {step}
              </Text>
            ))
          ) : (
            <Text>경로 데이터가 없습니다.</Text>
          )}
          {/* 재요청 버튼 */}
          <TouchableOpacity
            onPress={requestRoute}
            style={{
              marginTop: 20,
              padding: 10,
              backgroundColor: '#007BFF',
              borderRadius: 5,
            }}
          >
            <Text style={{ color: '#fff', textAlign: 'center', fontSize: 16 }}>
              경로 재요청
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {/* 정류장 안내 (2단계)*/}
      {currentStep === 2 && (
        <TouchableOpacity style={styles.touchButton} onPress={handleTap}>
          <Text style={styles.touchButtonText}>Touch!</Text>
        </TouchableOpacity>
      )}
      {/* 버스와의 거리 안내 (4단계) */}
      {currentStep === 4&& (
      <TouchableOpacity style={styles.touchButton} onPress={handleTap}>
        <Text style={styles.touchButtonText}>Touch!</Text>
      </TouchableOpacity>
      )}
      {/* 탑승 확인 (5단계) */}
      {currentStep === 5&& (
      <TouchableOpacity style={styles.touchButton} onPress={handleTap}>
        <Text style={styles.touchButtonText}>Touch!</Text>
      </TouchableOpacity>
      )}
      {/* 목적지까지의 거리 안내 (6단계) */}
      {currentStep === 6&& (
      <TouchableOpacity style={styles.touchButton} onPress={handleTap}>
        <Text style={styles.touchButtonText}>Touch!</Text>
      </TouchableOpacity>
      )}

      {currentStep !== 2 && currentStep !== 4 && currentStep !== 5 && currentStep !== 6 && (
        <TouchableOpacity
          style={styles.touchButton}
          onPress={() => {
            if (currentStep === messages.length - 1) {
              activateGetOffBell();
            } else {
              nextStep();
            }
          }}
        >
          <Text style={styles.touchButtonText}>
            {currentStep === messages.length - 1 ? "완료" : "Touch!"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  messageContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 24,
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  recognizedText: {
    fontSize: 18,
    color: '#000',
    marginTop: 20,
    textAlign: 'center',
  },
  touchButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F3C623',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  touchButtonText: {
    fontSize: 24,
    color: '#FFF',
  },
  resetButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF5733',
    padding: 10,
    borderRadius: 5,
  },
  resetText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default MainScreen;
