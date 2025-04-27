import { User } from "@/lib/schema";
import { create } from "zustand";

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
