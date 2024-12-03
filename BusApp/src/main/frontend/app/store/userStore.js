import { create } from 'zustand';

const useUserStore = create((set) => ({
    userInfo: {},
    setUserInfo: (userInfo) => set({ userInfo }),
    registration: null, 
    role: null, 
    setRegistration: (registration) => set({ registration }),
    setRole: (role) => set({ role }),
}));

export default useUserStore;