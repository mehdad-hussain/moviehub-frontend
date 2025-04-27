import { create } from "zustand";

// User type definition
export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // eslint-disable-next-line no-unused-vars
  setUser: (user: User | null) => void;
  // eslint-disable-next-line no-unused-vars
  setAccessToken: (token: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // Actions
  setUser: (user: User | null) => set({ user }),
  setAccessToken: (token: string | null) => set({ accessToken: token, isAuthenticated: !!token }),
}));
