import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../services/api';

const HomeScreen = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users:", error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <View style={styles.container}>
            {users.length > 0 ? (
                users.map((user) => (
                    <Text key={user.id} style={styles.user}>
                        {user.name}
                    </Text>
                ))
            ) : (
                <Text style={styles.message}>No users available</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    user: {
        fontSize: 24,
        marginVertical: 10,
    },
    message: {
        fontSize: 18,
        color: 'gray',
    },
});

export default HomeScreen;
