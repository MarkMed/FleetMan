import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@services/api/authService';
import { useAuthStore } from '@store/slices/authSlice';
import { QUERY_KEYS } from '../constants';
import type { LoginFormData, RegisterFormData } from '../models/forms/AuthForms';
import { mapRegisterFormToRequest } from '../utils/mappers';

// Login mutation
export const useLogin = () => {
  const { login } = useAuthStore();
  
  return useMutation({
    mutationFn: async (credentials: LoginFormData) => {
      return await login(credentials.email, credentials.password);
    },
    onSuccess: () => {
      // Redirect will be handled by the auth store
    },
  });
};

// Register mutation
export const useRegister = () => {
  const { register } = useAuthStore();
  
  return useMutation({
    mutationFn: async (userData: RegisterFormData) => {
      const adaptedData = mapRegisterFormToRequest(userData);
      return await register(adaptedData);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Get current user query
export const useMe = () => {
  const { token, isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn: () => authService.me(),
    enabled: !!token && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};

// Refresh token mutation
export const useRefreshToken = () => {
  const { refreshToken } = useAuthStore();
  
  return useMutation({
    mutationFn: async () => {
      return await refreshToken();
    },
  });
};