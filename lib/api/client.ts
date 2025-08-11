import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized responses only for non-auth endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // Don't clear token for auth endpoints (login/register/etc)
      if (!url.includes('/auth/')) {
        // Clear stored token only for protected endpoints
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Redirect to login if not already on auth pages
          const currentPath = window.location.pathname;
          const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
          if (!authPaths.includes(currentPath)) {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
