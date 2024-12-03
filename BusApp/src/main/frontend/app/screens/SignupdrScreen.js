import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator } from 'react-native';

function SignupdrScreen({ navigation }) {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [routeId, setRouteId] = useState('');
    const [vehicleno, setVehicleno] = useState('');
    const [cityCode, setCityCode] = useState('');
    const [cityName, setCityName] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [error, setError] = useState('');
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [cityModalVisible, setCityModalVisible] = useState(false);

    //도시코드 DB 참조
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const response = await fetch('http://172.30.1.60:3000/cities');
                if (response.ok) {
                    const data = await response.json();
                    setCities(data);
                } else {
                    console.error('Failed to fetch cities:', response.status);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            }
        };

        fetchCities();
    }, []);

    const handleCitySearch = (text) => {
        setCitySearch(text);
        if (text.length > 0) {
            const results = cities.filter((city) =>
                city.cityName.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredCities(results);
        } else {
            setFilteredCities([]);
        }
    };

    const handleCitySelect = (city) => {
        setCityName(city.cityName);
        setCityCode(city.cityCode);
        setCityModalVisible(false);
    };

    const handleSignup = async () => {
        if (!id || !password || !name || !cityCode || !routeId || !vehicleno) {
            setError('모든 항목을 입력해주세요.');
            setAlertModalVisible(true);
            return;
        }
        try {
            const response = await fetch('http://221.168.128.40:3000/signup-driver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, password, name, cityCode, routeId, vehicleno }),
            });
            const result = await response.json();
            if (response.ok) {
                setError('회원가입이 완료되었습니다.');
                setAlertModalVisible(true);
                navigation.navigate('Home');
            } else if (response.status === 409) {
                setError('이미 존재하는 ID입니다. 다른 ID를 사용해주세요.');
                setAlertModalVisible(true);
            } else {
                setError('운전자 등록에 실패했습니다.');
                setAlertModalVisible(true);
            }
        } catch (error) {
            console.error('운전자 회원가입 오류:', error);
            setError('서버 연결 실패');
            setAlertModalVisible(true);
        }
    };


    return (
        <View style={styles.container}>

             {/* 알림 창 */}
             <Modal
                transparent={true}
                visible={alertModalVisible}
                animationType="fade"
                onRequestClose={() => setAlertModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.errorMessage}>{error}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setAlertModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Text style={styles.title}>운전자</Text>
            <TextInput
                style={styles.input}
                placeholder="ID"
                value={id}
                onChangeText={setId}
            />
            <TextInput
                style={styles.input}
                placeholder="PW"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="이름"
                value={name}
                onChangeText={setName}
            />
            <TouchableOpacity
                style={styles.input}
                onPress={() => setCityModalVisible(true)}
            >
                <Text>{cityName || '도시를 선택해주세요'}</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.input}
                placeholder="노선번호"
                value={routeId}
                onChangeText={setRouteId}
            />
            <TextInput
                style={styles.input}
                placeholder="차량번호"
                value={vehicleno}
                onChangeText={setVehicleno}
            />
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>완료</Text>
            </TouchableOpacity>

            {/* 도시선택 Modal */}
            <Modal
                visible={cityModalVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setCityModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="도시명 검색"
                        value={citySearch}
                        onChangeText={handleCitySearch}
                    />
                    <FlatList
                        data={filteredCities}
                        keyExtractor={(item) => item.cityCode}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.cityItem}
                                onPress={() => handleCitySelect(item)}
                            >
                                <Text>{item.cityName}</Text>
                            </TouchableOpacity>
                        )}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setCityModalVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

export default SignupdrScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#D9D9D9',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        width: 250,
    },
    button: {
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorMessage: {
        fontSize: 16,
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    cityItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    closeButton: {
        backgroundColor: '#F3C623',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    closeButtonText: {
        fontSize: 14,
        color: '#fff',
    },
});