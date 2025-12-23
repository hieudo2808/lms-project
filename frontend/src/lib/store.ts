import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      setAuth: (token: string, user: User) => {
        set({ token, user }); 
      },

      updateUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-store', 
    }
  )
);