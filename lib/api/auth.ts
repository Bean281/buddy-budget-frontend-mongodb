import apiClient from './client';

// Types for authentication API based on the provided specification
export interface RegisterRequest {
  email: string;          // Required: Valid email address
  password: string;       // Required: Minimum 8 characters
  firstName?: string;     // Optional: User's first name
  lastName?: string;      // Optional: User's last name
}

export interface LoginRequest {
  email: string;          // Required: Valid email address
  password: string;       // Required: User's password
}

export interface ForgotPasswordRequest {
  email: string;          // Required: Valid email address
}

export interface ResetPasswordRequest {
  email: string;                    // Required: Valid email address
  token: string;                    // Required: Reset token from email or forgot-password endpoint
  newPassword: string;              // Required: Minimum 8 characters
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  currency: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  currency: string;
  access_token: string;             // JWT access token
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;              // Only in development mode
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// Authentication API functions
export const authApi = {
  // 1. User Registration
  // Route: POST /auth/register
  // Description: Creates a new user account and returns authentication token
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // 2. User Login  
  // Route: POST /auth/login
  // Description: Authenticates a user and returns a JWT token
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // 3. Forgot Password
  // Route: POST /auth/forgot-password
  // Description: Initiates the password reset process
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // 4. Reset Password
  // Route: POST /auth/reset-password
  // Description: Resets the user password using a reset token
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  },
};

// Token management utilities
export const tokenUtils = {
  // Store token in localStorage and cookies
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      // Store in localStorage
      localStorage.setItem('auth_token', token);
      
      // Store in cookies for SSR/middleware access
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days expiration
      
      document.cookie = [
        `auth_token=${token}`,
        `expires=${expires.toUTCString()}`,
        'path=/',
        'SameSite=Lax',
        // Add Secure flag in production
        ...(window.location.protocol === 'https:' ? ['Secure'] : [])
      ].join('; ');
    }
  },

  // Get token from localStorage or cookies
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('auth_token');
      if (localToken) {
        return localToken;
      }
      
      // Fallback to cookies
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1];
      
      return cookieToken || null;
    }
    return null;
  },

  // Remove token from both localStorage and cookies
  removeToken: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = tokenUtils.getToken();
    return !!token;
  },
}; 