import axios from "axios";
import { useAuthStore } from "../store/authStore";

// Base URL includes versioning as per spec
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add Bearer token from Zustand store
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If we are already on auth routes, don't retry to avoid loops
      const authRoutes = ["/auth/login", "/auth/register", "/auth/refresh"];
      if (authRoutes.some(route => originalRequest.url?.includes(route))) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Attempt to rotate tokens via refresh endpoint
        const res = await axios.post(`${import.meta.env.VITE_API_URL || "/api/v1"}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken, user } = res.data.data;
        
        // Update local store
        useAuthStore.getState().setAuth(user, accessToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (likely expired refresh token) -> force logout
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);