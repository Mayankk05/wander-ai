import { create } from 'zustand';
import { authAPI } from '../api';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
  clearUser: () => set({ user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  
  initialize: async () => {
    try {
      const res = await authAPI.getMe();
      set({ user: res.data.user, isLoading: false });
    } catch (err) {
      set({ user: null, isLoading: false });
    }
  }
}));
