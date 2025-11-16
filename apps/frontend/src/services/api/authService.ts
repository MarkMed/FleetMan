import { apiClient, handleBackendApiResponse, ApiResponse } from './apiClient';
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

// Backend API wrapper types - what the backend actually returns
interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<BackendApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return handleBackendApiResponse(response);
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    console.log('🔗 AuthService.register called with:', userData);
    
    const response = await apiClient.post<BackendApiResponse<RegisterResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );
    
    console.log('🔗 Raw API response:', response);
    
    const result = handleBackendApiResponse(response);
    
    console.log('🔗 Processed registration result (should be RegisterResponse):', result);
    
    return result;
  }

  // Logout user
  async logout(): Promise<void> {
    const response = await apiClient.post<BackendApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT);
    handleBackendApiResponse(response);
  }

  // Refresh authentication token
  async refreshToken(refreshTokenData: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<BackendApiResponse<RefreshTokenResponse>>(
      API_ENDPOINTS.AUTH.REFRESH,
      refreshTokenData
    );
    return handleBackendApiResponse(response);
  }

  // Get current user information
  async me(): Promise<CreateUserResponse> {
    const response = await apiClient.get<BackendApiResponse<CreateUserResponse>>(API_ENDPOINTS.AUTH.ME);
    return handleBackendApiResponse(response);
  }

  // Forgot password
  async forgotPassword(emailData: ForgotPasswordRequest): Promise<void> {
    const response = await apiClient.post<BackendApiResponse<void>>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      emailData
    );
    handleBackendApiResponse(response);
  }

  // Reset password
  async resetPassword(resetData: ResetPasswordRequest): Promise<void> {
    const response = await apiClient.post<BackendApiResponse<void>>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      resetData
    );
    handleBackendApiResponse(response);
  }

  // Set authentication token for future requests
  setAuthToken(token: string | null): void {
    apiClient.setAuthToken(token);
  }
}

// Create and export service instance
export const authService = new AuthService();