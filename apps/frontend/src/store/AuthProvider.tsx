import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from './slices/authSlice';
import type { CreateUserResponse as User, RegisterRequest } from '@packages/contracts';

interface AuthContextValue {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error?: string;
  
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

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authStore = useAuthStore();

  // No useEffect needed - hydration is handled by onRehydrateStorage
  // This eliminates race conditions and duplicate loadUser calls

  return (
    <AuthContext.Provider value={authStore}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};