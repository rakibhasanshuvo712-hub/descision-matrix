import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token and guest session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('matrix_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const guestSessionId = localStorage.getItem('matrix_guest_session');
    if (guestSessionId && !config.params?.guestSessionId) {
      config.params = { ...config.params, guestSessionId };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
