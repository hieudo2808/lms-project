import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
    token: string | null;
    user: User | null;
    _hasHydrated: boolean;
    setAuth: (token: string, user: User) => void;
    updateUser: (user: User) => void;
    updateToken: (token: string) => void;
    logout: () => Promise<void>;
    setHasHydrated: (state: boolean) => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            token: null,
            refreshToken: null,
            user: null,
            _hasHydrated: false,

            setAuth: (token: string, user: User) => {
                set({ token, user });
            },

            updateUser: (user: User) => {
                set({ user });
            },

            updateToken: (token: string) => {
                set({ token });
            },

            logout: async () => {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
                try {
                    await fetch(`${API_URL}/auth/logout`, {
                        method: 'POST',
                        credentials: 'include',
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
                set({ token: null, user: null });
            },

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            isAuthenticated: () => {
                const state = get();
                return !!state.token && !!state.user;
            },
        }),
        {
            name: 'auth-store',
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        },
    ),
);
