import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  authApi,
  tokenUtils,
  type AuthResponse,
  type RegisterRequest,
  type LoginRequest,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
  type ForgotPasswordResponse,
  type ResetPasswordResponse,
  type AuthUser,
} from '@/lib/api/auth';

// Re-export tokenUtils for convenience
export { tokenUtils };

// Query keys for React Query caching
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Main authentication hook
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Get current user data from cache
  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<AuthUser | null> => {
      const token = tokenUtils.getToken();
      if (!token) {
        return null;
      }

      // Always return cached user data if it exists
      const cachedUser = queryClient.getQueryData<AuthUser>(authKeys.user());
      return cachedUser || null;
    },
    enabled: true, // Always enabled
    retry: false,
    staleTime: Infinity, // Keep data fresh until manually invalidated
    gcTime: Infinity, // Don't garbage collect
  });

  // Logout function
  const logout = () => {
    tokenUtils.removeToken();
    queryClient.clear();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated: tokenUtils.isAuthenticated(),
    isLoading: isUserLoading,
    error: userError,
    logout,
  };
}

// Hook for user registration
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest): Promise<AuthResponse> => {
      return authApi.register(data);
    },
    onSuccess: (data) => {
      // Store the JWT access token immediately
      tokenUtils.setToken(data.access_token);
      
      // Cache user data before redirect
      const userData: AuthUser = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        currency: data.currency,
      };
      queryClient.setQueryData(authKeys.user(), userData);

      toast.success('Account created successfully!');
      
      // Use longer delay to ensure token and data are properly stored
      setTimeout(() => {
        window.location.href = '/dashboard-overview';
      }, 1000);
    },
    onError: (error: any) => {
      // Handle different error status codes
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message;
      
      if (statusCode === 400) {
        toast.error(errorMessage || 'Invalid input data');
      } else if (statusCode === 409) {
        toast.error('Email already in use');
      } else {
        toast.error(errorMessage || 'Registration failed');
      }
    },
  });
}

// Hook for user login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      return authApi.login(data);
    },
    onSuccess: (data) => {
      // Store the JWT access token immediately
      tokenUtils.setToken(data.access_token);
      
      // Cache user data before redirect
      const userData: AuthUser = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profileImageUrl: data.profileImageUrl,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        currency: data.currency,
      };
      queryClient.setQueryData(authKeys.user(), userData);

      toast.success('Logged in successfully!');
      
      // Use longer delay to ensure token and data are properly stored
      setTimeout(() => {
        window.location.href = '/dashboard-overview';
      }, 1000);
    },
    onError: (error: any) => {
      // Handle authentication errors
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message;
      
      if (statusCode === 401) {
        toast.error('Invalid credentials');
      } else {
        toast.error(errorMessage || 'Login failed');
      }
    },
  });
}

// Hook for forgot password
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
      return authApi.forgotPassword(data);
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      toast.error(errorMessage);
    },
  });
}

// Hook for reset password
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
      return authApi.resetPassword(data);
    },
    onSuccess: (data) => {
      toast.success(data.message);
      router.push('/login');
    },
    onError: (error: any) => {
      // Handle reset password errors
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message;
      
      if (statusCode === 400) {
        toast.error('Invalid token or password');
      } else if (statusCode === 404) {
        toast.error('User not found');
      } else {
        toast.error(errorMessage || 'Failed to reset password');
      }
    },
  });
}

// Hook for checking authentication status (lightweight)
export function useAuthStatus() {
  return {
    isAuthenticated: tokenUtils.isAuthenticated(),
    token: tokenUtils.getToken(),
  };
} 