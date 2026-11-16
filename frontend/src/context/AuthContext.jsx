import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('matrix_token'));
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize Auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('matrix_token');
      const isGuestMode = localStorage.getItem('matrix_is_guest') === 'true';

      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          setIsGuest(isGuestMode || res.data.user?.role === 'guest');
        } catch (err) {
          console.warn('[Auth] Token validation error, clearing session:', err.message);
          localStorage.removeItem('matrix_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      
      localStorage.setItem('matrix_token', receivedToken);
      localStorage.removeItem('matrix_is_guest');
      setToken(receivedToken);
      setUser(receivedUser);
      setIsGuest(false);
      setLoading(false);
      return { success: true, user: receivedUser };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('matrix_token', receivedToken);
      localStorage.removeItem('matrix_is_guest');
      setToken(receivedToken);
      setUser(receivedUser);
      setIsGuest(false);
      setLoading(false);
      return { success: true, user: receivedUser };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const startGuestSession = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/guest');
      const { token: receivedToken, user: receivedUser, sessionId } = res.data;

      localStorage.setItem('matrix_token', receivedToken);
      localStorage.setItem('matrix_guest_session', sessionId);
      localStorage.setItem('matrix_is_guest', 'true');
      setToken(receivedToken);
      setUser(receivedUser);
      setIsGuest(true);
      setLoading(false);
      return { success: true, user: receivedUser };
    } catch (err) {
      // Fallback local guest session
      const mockGuestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      const mockGuest = {
        id: mockGuestId,
        name: 'Guest Explorer',
        email: 'guest@matrix.local',
        role: 'guest',
      };
      localStorage.setItem('matrix_guest_session', mockGuestId);
      localStorage.setItem('matrix_is_guest', 'true');
      setUser(mockGuest);
      setIsGuest(true);
      setLoading(false);
      return { success: true, user: mockGuest };
    }
  };

  const logout = () => {
    localStorage.removeItem('matrix_token');
    localStorage.removeItem('matrix_is_guest');
    localStorage.removeItem('matrix_guest_session');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const updateProfile = async (updatedData) => {
    try {
      const res = await api.put('/users/profile', updatedData);
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isGuest,
        loading,
        login,
        register,
        startGuestSession,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
