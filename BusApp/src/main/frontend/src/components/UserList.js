import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserList = ({ users }) => {
    return (
        <View>
            {users.map(user => (
                <Text key={user.id} style={styles.userText}>
                    {user.name}
                </Text>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    userText: {
        fontSize: 18,
        marginVertical: 5,
    },
});

export default UserList;
