import { apiClient, handleApiResponse } from './apiClient';
import type { UpdateUserRequest, UpdateUserResponse } from '@contracts';

/**
 * User Service
 * Sprint #13 Tasks 10.1 + 10.2: User Profile Editing + Bio & Tags
 * 
 * Handles API calls related to user profile management
 */
export class UserService {
  /**
   * Updates the authenticated user's profile
   * PATCH /api/users/me/profile
   * 
   * @param data - Profile update data (phone, companyName, address, bio, tags)
   * @returns Updated user data
   */
  async updateMyProfile(data: UpdateUserRequest): Promise<UpdateUserResponse> {
    const response = await apiClient.patch<{ 
      success: boolean; 
      message?: string; 
      data: UpdateUserResponse 
    }>(
      '/users/me/profile',
      data
    );
    
    const processed = handleApiResponse(response);
    // Extract data from wrapped response
    return (processed as any).data ?? (processed as any);
  }

  // TODO: Future endpoints (Sprint #13+)
  /**
   * Gets the authenticated user's complete profile
   * GET /api/users/me/profile
   */
  // async getMyProfile(): Promise<GetUserResponse> {
  //   const response = await apiClient.get<{ success: boolean; data: GetUserResponse }>(
  //     '/users/me/profile'
  //   );
  //   const processed = handleApiResponse(response);
  //   return (processed as any).data ?? (processed as any);
  // }

  /**
   * Gets a user's public profile (for User Discovery)
   * GET /api/users/:userId/public
   */
  // async getUserPublicProfile(userId: string): Promise<UserPublicProfile> {
  //   const response = await apiClient.get<{ success: boolean; data: UserPublicProfile }>(
  //     `/users/${userId}/public`
  //   );
  //   const processed = handleApiResponse(response);
  //   return (processed as any).data ?? (processed as any);
  // }

  /**
   * Uploads user avatar image
   * POST /api/users/me/avatar
   * Task 10.3: Image Upload Component
   */
  // async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  //   const formData = new FormData();
  //   formData.append('avatar', file);
  //   
  //   const response = await apiClient.post<{ success: boolean; data: { avatarUrl: string } }>(
  //     '/users/me/avatar',
  //     formData,
  //     { headers: { 'Content-Type': 'multipart/form-data' } }
  //   );
  //   const processed = handleApiResponse(response);
  //   return (processed as any).data ?? (processed as any);
  // }

  /**
   * Gets tag suggestions based on popularity
   * GET /api/tags/suggestions
   * Task 10.2b: Optional autocomplete for tags
   */
  // async getTagSuggestions(query?: string): Promise<string[]> {
  //   const params = query ? { query } : {};
  //   const response = await apiClient.get<{ success: boolean; data: string[] }>(
  //     '/tags/suggestions',
  //     params
  //   );
  //   const processed = handleApiResponse(response);
  //   return (processed as any).data ?? (processed as any);
  // }
}

// Export singleton instance
export const userService = new UserService();
