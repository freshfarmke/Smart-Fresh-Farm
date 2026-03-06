/**
 * Typed API Error for consistent error handling
 * Enables catch blocks to safely access error properties
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Token management utilities
 * Ready for OAuth/JWT implementation
 */
const tokenManager = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
  },
};

/**
 * Centralized API client
 * Production-ready with:
 * - Typed error handling (ApiError)
 * - Automatic token injection
 * - Graceful non-2xx response handling
 * - Ready for refresh-token logic
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get Authorization header if token exists
   * Integrates seamlessly with future SSO implementations
   */
  private getAuthHeader(): Record<string, string> {
    const token = tokenManager.get();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Generic fetch wrapper with type-safe error handling
   * Distinguishes between network errors and API errors
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: headers as Record<string, string>,
      });

      // Parse response body first for error details
      let data: unknown;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle non-2xx responses with typed errors
      if (!response.ok) {
        throw new ApiError(
          response.status,
          typeof data === 'object' && data !== null && 'message' in data
            ? String(data.message)
            : `HTTP ${response.status}: ${response.statusText}`,
          typeof data === 'object' ? (data as Record<string, unknown>) : undefined
        );
      }

      return data as T;
    } catch (error) {
      // Re-throw ApiErrors as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors or other exceptions
      console.error(`[API Error] ${endpoint}:`, error);
      throw new ApiError(
        0,
        error instanceof Error ? error.message : 'Network request failed'
      );
    }
  }

  /**
   * GET request
   * Used for data retrieval - no request body
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   * Used for data creation with request body
   */
  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   * Used for full data updates
   */
  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   * Used for partial data updates
   */
  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   * Used for data deletion
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Token management - exposed for auth form handlers
   */
  readonly token = tokenManager;
}

/**
 * API base URL from environment
 * Falls back to local dev server if not configured
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Singleton instance of API client
 * Import and use throughout the application for type-safe requests
 *
 * Example:
 * ```typescript
 * try {
 *   const user = await apiClient.post('/api/auth/login', { email, password });
 *   apiClient.token.set(user.token);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`Error ${error.status}: ${error.message}`);
 *   }
 * }
 * ```
 */
export const apiClient = new ApiClient(API_BASE_URL);

