import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '@constants';
import { User, LoginFormData, RegisterFormData, ApiResponse } from '@models';

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export class AuthService {
  // Login user
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return handleApiResponse(response);
  }

  // Register new user
  async register(userData: RegisterFormData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    return handleApiResponse(response);
  }

  // Logout user
  async logout(): Promise<void> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    handleApiResponse(response);
  }

  // Refresh authentication token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return handleApiResponse(response);
  }

  // Get current user information
  async me(): Promise<User> {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    return handleApiResponse(response);
  }

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    handleApiResponse(response);
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
    handleApiResponse(response);
  }

  // Set authentication token for future requests
  setAuthToken(token: string | null): void {
    apiClient.setAuthToken(token);
  }
}

// Create and export service instance
export const authService = new AuthService();