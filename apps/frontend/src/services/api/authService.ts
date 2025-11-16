import { apiClient, handleApiResponse } from './apiClient';
import { API_ENDPOINTS } from '../../constants';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CreateUserResponse
} from '@packages/contracts';

export class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return handleApiResponse(response);
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<any> {
    console.log('🔗 AuthService.register called with:', userData);
    
    const response = await apiClient.post<any>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    console.log('🔗 Raw API response:', response);
    
    const result = handleApiResponse(response);
    
    console.log('🔗 Processed registration result:', result);
    
    return result;
  }

  // Logout user
  async logout(): Promise<void> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    handleApiResponse(response);
  }

  // Refresh authentication token
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      refreshTokenData
    );
    return handleApiResponse(response);
  }

  // Get current user information
  async me(): Promise<CreateUserResponse> {
    const response = await apiClient.get<CreateUserResponse>(API_ENDPOINTS.AUTH.ME);
    return handleApiResponse(response);
  }

  // Forgot password
  async forgotPassword(emailData: ForgotPasswordRequest): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      emailData
    );
    handleApiResponse(response);
  }

  // Reset password
  async resetPassword(resetData: ResetPasswordRequest): Promise<void> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      resetData
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