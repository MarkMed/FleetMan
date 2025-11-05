import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@models';
import { authService } from '@services/api/authService';
import { STORAGE_KEYS } from '@constants';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: undefined,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: undefined });
          
          const response = await authService.login({ email, password });
          
          // Set auth token for future requests
          authService.setAuthToken(response.token);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (userData: any) => {
        try {
          set({ isLoading: true, error: undefined });
          
          const response = await authService.register(userData);
          
          // Set auth token for future requests
          authService.setAuthToken(response.token);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.warn('Logout API call failed:', error);
        } finally {
          // Clear auth token
          authService.setAuthToken(null);
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: undefined,
          });
        }
      },

      refreshToken: async () => {
        try {
          const currentState = get();
          if (!currentState.token) {
            throw new Error('No token available');
          }

          const response = await authService.refreshToken(currentState.token);
          
          // Set new auth token
          authService.setAuthToken(response.token);
          
          set({
            token: response.token,
            error: undefined,
          });
        } catch (error: any) {
          // If refresh fails, logout user
          get().logout();
          throw error;
        }
      },

      loadUser: async () => {
        try {
          const currentState = get();
          if (!currentState.token) {
            return;
          }

          set({ isLoading: true });
          
          // Set token for the request
          authService.setAuthToken(currentState.token);
          
          const user = await authService.me();
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });
        } catch (error: any) {
          // If loading user fails, logout
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Failed to load user',
          });
          authService.setAuthToken(null);
        }
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
        authService.setAuthToken(token);
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: undefined });
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_TOKEN,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);