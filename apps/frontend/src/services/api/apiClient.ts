import { config } from "../../config";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Base API configuration
const BASE_URL = config.API_BASE_URL;
const TIMEOUT = config.API.TIMEOUT;

export interface RequestConfig {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Set authorization token
  setAuthToken(token: string | null) {
    console.log("🔐 Setting auth token in apiClient:", token ? token : "null");
    if (token) {
      this.defaultHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders["Authorization"];
    }
  }

  // Build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    // Remove leading slash from endpoint to avoid path replacement
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;

    // Ensure baseURL ends with /
    const baseURL = this.baseURL.endsWith("/")
      ? this.baseURL
      : `${this.baseURL}/`;

    // Debug: Let's see what URLs are being constructed
    console.log("🔧 Building URL:", {
      baseURL,
      cleanEndpoint,
      fullUrl: `${baseURL}${cleanEndpoint}`,
    });

    const url = new URL(cleanEndpoint, baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const finalUrl = url.toString();
    console.log("🎯 Final URL:", finalUrl);

    return finalUrl;
  }

  // Generic request method
  async request<T = any>(
    endpoint: string,
    requestConfig: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = "GET",
      headers = {},
      body,
      params,
      timeout = TIMEOUT,
    } = requestConfig;

    const url = this.buildUrl(endpoint, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    // Defensive fallback: if Authorization header is missing, try reading persisted token
    // directly from localStorage. This avoids circular imports with the auth store
    // and guarantees that early requests get the JWT if it was persisted.
    try {
      const hasAuthHeader = Object.keys(requestHeaders).some(
        (k) => k.toLowerCase() === 'authorization'
      );
      if (!hasAuthHeader && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const persisted = localStorage.getItem(config.STORAGE_KEYS.AUTH_TOKEN);
        if (persisted) {
          requestHeaders['Authorization'] = `Bearer ${persisted}`;
          try {
            // keep defaultHeaders in sync for subsequent requests
            this.setAuthToken(persisted);
          } catch (e) {
            console.warn('apiClient: failed to set default auth token', e);
          }
        }
      }
    } catch (e) {
      // Non-fatal: if localStorage access is blocked, continue without Authorization
      console.warn('apiClient: error while applying persisted auth token fallback', e);
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestConfig: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
        cache: 'no-store', // Disable browser caching - ensures fresh data from API
      };

      // Add body for non-GET requests
      if (body && method !== "GET") {
        if (body instanceof FormData) {
          // For FormData, don't set Content-Type (browser will set it with boundary)
          delete requestHeaders["Content-Type"];
          requestConfig.body = body;
        } else {
          requestConfig.body = JSON.stringify(body);
        }
      }

      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);

      // Handle different response types
      let data: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("text/")) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Handle HTTP errors
      if (!response.ok) {
        // Detect 401 Unauthorized (session expired)
        if (response.status === 401) {
          // Dynamic import to avoid circular dependency
          const { useAuthStore } = await import('../../store/slices/authSlice');
          const authState = useAuthStore.getState();
          
          // Only trigger modal if:
          // 1. User is currently authenticated (has active session)
          // 2. Modal hasn't been shown yet (anti-spam)
          // 3. Not already on login page
          const isOnLoginPage = window.location.pathname.includes('/auth/login');
          
          if (
            authState.isAuthenticated && 
            !authState.isSessionExpiredModalShown &&
            !isOnLoginPage
          ) {
            // Mark as shown to prevent multiple triggers
            authState.markSessionExpired();
            
            // Trigger session expired modal (handled by global listener)
            window.dispatchEvent(new CustomEvent('session-expired'));
          }
        }
        
        return {
          success: false,
          error:
            data?.message ||
            data?.error ||
            `HTTP ${response.status}: ${response.statusText}`,
          data: data,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        return {
          success: false,
          error: "Request timeout",
        };
      }

      return {
        success: false,
        error: error.message || "Network error",
      };
    }
  }

  // Convenience methods
  get<T = any>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", params, headers });
  }

  post<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "POST", body, headers });
  }

  put<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PUT", body, headers });
  }

  patch<T = any>(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "PATCH", body, headers });
  }

  delete<T = any>(
    endpoint: string,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(BASE_URL);

// Helper function to handle API responses
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || "API request failed");
  }
  return response.data!;
}

// Helper function to handle backend API responses that have the wrapper structure
export function handleBackendApiResponse<T>(response: ApiResponse<{ success: boolean; message: string; data: T }>): T {
  if (!response.success) {
    throw new Error(response.error || "API request failed");
  }
  // response.data is the backend response: { success, message, data: T }
  // We want to return T (which is response.data.data)
  return response.data!.data;
}

// Helper function for retry logic
export async function withRetry<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  maxRetries: number = config.API.RETRY_ATTEMPTS,
  delay: number = config.API.RETRY_DELAY
): Promise<ApiResponse<T>> {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const result = await apiCall();
      if (result.success) {
        return result;
      }
      lastError = result.error;
    } catch (error) {
      lastError = error;
    }

    if (i < maxRetries) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  return {
    success: false,
    error: lastError?.message || lastError || "Max retries exceeded",
  };
}
