import { create } from "zustand";
import type { User, Professional } from "@telemed/shared";
import { usersApi } from "@/services/api";

interface AuthState {
  user: User | null;
  professional: Professional | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  clearProfile: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  professional: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load profile",
        isLoading: false,
      });
    }
  },

  clearProfile: () => {
    set({ user: null, professional: null, error: null });
  },

  setUser: (user) => {
    set({ user });
  },
}));
