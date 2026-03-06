/**
 * App-wide constants
 * Centralize all hardcoded values here for easy maintenance
 * Should be imported instead of hardcoding strings across components
 */

// App metadata
export const APP_CONFIG = {
  name: 'Fresh Farm Bakery Flaxs',
  description: 'Professional bakery management system for Fresh Farm Bakery Flaxs',
  version: '1.0.0',
};

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/production',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
  },
  PRODUCTS: {
    LIST: '/api/products',
    GET: (id: string) => `/api/products/${id}`,
  },
  ORDERS: {
    LIST: '/api/orders',
    GET: (id: string) => `/api/orders/${id}`,
  },
};

// Validation rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// UI messages
export const MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  ERROR: 'Something went wrong. Please try again.',
  LOADING: 'Loading...',
  NOT_FOUND: 'Resource not found',
};
