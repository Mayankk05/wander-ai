import axios from 'axios';
import { useAuthStore } from '../store/authStore';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 30000, // 30s timeout to prevent indefinite hanging
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Standardize error formatting for better toast notifications
    let errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Connection error';
    
    // THE FIX: Handle errors when responseType is 'blob'
    if (error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        errorMessage = json.error || json.message || errorMessage;
      } catch (e) {
        // Fallback to default error message if not JSON
      }
    }

    error.formattedMessage = errorMessage;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (expired or invalid refresh token)
        useAuthStore.getState().clearUser();
        
        // GLOBAL REDIRECT on hard 401 failure
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
           window.location.href = '/auth';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  getMe: () => api.get('/auth/me'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.get('/auth/send-verify-link'),
};

export const tripsAPI = {
  getAll: () => api.get('/trips'),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  generate: (params) => api.get('/trips/generate', { params }),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  undo: (id) => api.post(`/trips/${id}/undo`),
  refreshImage: (id) => api.post(`/trips/${id}/refresh-image`),
};

export const shareAPI = {
  enable: (id) => api.post(`/share/${id}/enable`),
  disable: (id) => api.post(`/share/${id}/disable`),
  getPublic: (token) => api.get(`/share/${token}`),
};

export const collabAPI = {
  getAll: (id) => api.get(`/collab/${id}`),
  invite: (id, data) => api.post(`/collab/${id}/invite`, data),
  remove: (id, email) => api.delete(`/collab/${id}/${email}`),
  leave: (id) => api.post(`/collab/${id}/leave`),
};

export const budgetAPI = {
  getSummary: (id) => api.get(`/budget/${id}/summary`),
  optimize: (id) => api.post(`/budget/${id}/optimize`),
};

export const regenerateAPI = {
  day: (id, data) => api.post(`/regenerate/${id}/day`, data),
  full: (id) => api.post(`/regenerate/${id}/full`),
};

export const chatAPI = {
  send: (id, data) => api.post(`/chat/${id}`, data),
};

export const exportAPI = {
  pdf: (id) => api.get(`/export/${id}/pdf`, { responseType: 'blob' }),
};


export default api;
