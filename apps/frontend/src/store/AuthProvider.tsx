import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from './slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<{}>({});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { token, loadUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Load user data on app start if we have a token
    if (token && !isAuthenticated) {
      loadUser();
    }
  }, [token, isAuthenticated, loadUser]);

  return (
    <AuthContext.Provider value={{}}>
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