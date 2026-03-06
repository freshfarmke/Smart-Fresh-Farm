/**
 * User type for authentication and dashboard
 * Extend this as your understanding of the data model evolves
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: Date;
}

/**
 * Authentication request/response types
 * Ready for token-based auth (JWT)
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * API Error type for type-safe error handling
 * Imported from lib/api.ts
 */
export { ApiError } from '@/lib/api';

/**
 * Generic API response wrapper (for reference)
 * Most endpoints will return typed responses directly
 * Use this when endpoints return wrapper objects
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

