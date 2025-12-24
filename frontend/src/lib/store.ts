import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
    token: string | null;
    user: User | null;
    _hasHydrated: boolean;
    setAuth: (token: string, user: User) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            _hasHydrated: false,

            setAuth: (token: string, user: User) => {
                set({ token, user });
            },

            updateUser: (user: User) => {
                set({ user });
            },

            logout: () => {
                localStorage.removeItem('refresh_token');
                set({ token: null, user: null });
            },

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },
        }),
        {
            name: 'auth-store',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
