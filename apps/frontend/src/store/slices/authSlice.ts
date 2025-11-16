import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../../services/api/authService';
import { config } from '../../config';
import type { CreateUserResponse as User, RegisterRequest, LoginResponse, RegisterResponse } from '@packages/contracts';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;  // Track if state has been loaded from storage
  error?: string;
}

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<{ shouldNavigate: boolean }>;
  register: (userData: RegisterRequest) => Promise<{ shouldNavigate: boolean }>;
  logout: () => Promise<{ shouldNavigate: boolean }>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setHydrated: (isHydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,  // Will be true once storage is loaded
      error: undefined,

      // Actions
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: undefined });
          
          const response: LoginResponse = await authService.login({ email, password });
          
          // Note: handleApiResponse already extracts .data from backend response
          // Set auth token for future requests
          authService.setAuthToken(response.token);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });

          return { shouldNavigate: true };
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Error al iniciar sesión',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        try {
          console.log('🔄 Starting registration...', userData);
          set({ isLoading: true, error: undefined });
          
          console.log('📤 Calling authService.register...');
          const response = await authService.register(userData);
          console.log('📥 Register response received (after handleApiResponse):', response);
          
          // Auto-login strategy: Backend returns token + refreshToken on registration
          // Note: handleApiResponse already extracts .data, so response is already flattened
          if (response.data.token) {
            console.log('✅ Registration successful with auto-login', {
              hasToken: !!response.data.token,
              hasUser: !!response.data.user,
              tokenPreview: response.data.token?.substring(0, 20) + '...'
            });
            authService.setAuthToken(response.data.token);
            
            const newState = {
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              isHydrated: true,
              error: undefined,
            };
            
            console.log('🎯 Setting new auth state:', newState);
            set(newState);

            return { shouldNavigate: true };
          } else {
            console.log('⚠️ Registration successful but no token received');
            // Fallback: if no token in response, registration was successful but needs manual login
            set({
              isLoading: false,
              error: undefined,
            });

            return { shouldNavigate: false };
          }
        } catch (error: any) {
          console.error('❌ Registration failed:', error);
          set({
            isLoading: false,
            error: error.message || 'Error al crear la cuenta',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Don't show loading state for logout to avoid UI flicker
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

          return { shouldNavigate: true };
        }
      },

      refreshToken: async () => {
        try {
          const currentState = get();
          if (!currentState.token) {
            throw new Error('No token available');
          }

          const response = await authService.refreshToken({ refreshToken: currentState.token });
          
          // Note: handleApiResponse already extracts .data from backend response
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

          // Don't set loading if we're just verifying during hydration
          // Only set loading for explicit user-initiated requests
          if (currentState.isHydrated) {
            set({ isLoading: true });
          }
          
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
          // If loading user fails, try refresh token first
          try {
            await get().refreshToken();
            const user = await authService.me();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: undefined,
            });
          } catch (refreshError) {
            // If refresh also fails, logout with user notification
            console.warn('Failed to load user and refresh token:', error, refreshError);
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            });
            authService.setAuthToken(null);
          }
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
        set({ error: error || undefined });
      },

      clearError: () => {
        set({ error: undefined });
      },

      setHydrated: (isHydrated: boolean) => {
        set({ isHydrated });
      },
    }),
    {
      name: config.STORAGE_KEYS.AUTH_TOKEN,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        console.log('🔄 Starting auth hydration from localStorage');
        return (state, error) => {
          if (error) {
            console.error('❌ Auth hydration failed:', error);
            state?.setHydrated(true);
            return;
          }
          
          console.log('✅ Auth hydration completed:', {
            hasToken: !!state?.token,
            hasUser: !!state?.user,
            isAuthenticated: state?.isAuthenticated
          });
          
          // Set hydrated first to prevent race conditions
          state?.setHydrated(true);
          
          // If we have a token but no user, schedule loadUser for next tick
          // This prevents blocking the hydration process
          if (state?.token && !state?.user) {
            console.log('🔄 Token found, scheduling user data load...');
            setTimeout(() => {
              state.loadUser().catch((error) => {
                console.warn('Failed to load user after hydration:', error);
              });
            }, 0);
          }
        };
      },
    }
  )
);