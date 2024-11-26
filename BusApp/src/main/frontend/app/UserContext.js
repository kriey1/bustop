import React, { createContext, useState } from 'react';

// UserContext 생성
const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null); // userInfo 초기값: null
    console.log('UserProvider Initialized:', { userInfo, setUserInfo });
    return (
        <UserContext.Provider value={{ userInfo, setUserInfo }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;