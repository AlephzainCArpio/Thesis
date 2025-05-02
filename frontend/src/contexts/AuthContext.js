// Enhanced AuthContext.js with improved token handling and request interceptors
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup axios interceptors for handling auth
  useEffect(() => {
    // Request interceptor - add token to every request
    const requestInterceptor = api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor - handle token expiration
    const responseInterceptor = api.interceptors.response.use(
      response => response,
      error => {
        // Handle 401 errors (unauthorized) by logging out
        if (error.response && error.response.status === 401) {
          console.log('Token expired or invalid, logging out');
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Clean up interceptors on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          // Fetch current user
          const response = await api.get('/auth/me');
          console.log('Current user data:', response.data);
          
          // Ensure we have providerType if user is a provider
          if (response.data.role && 
              (response.data.role === 'PROVIDER' || response.data.role === 'PENDING_PROVIDER') && 
              !response.data.providerType) {
            // Fetch provider type if not included in user data
            try {
              const providerData = await api.get('/providers/type');
              setCurrentUser({
                ...response.data,
                providerType: providerData.data.providerType
              });
            } catch (providerErr) {
              console.error('Error fetching provider type:', providerErr);
              setCurrentUser(response.data);
            }
          } else {
            setCurrentUser(response.data);
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Clear token if validation fails
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', { email, password });
      console.log('Login API response:', response.data);
      
      const { token, user } = response.data;
      
      // Save token
      localStorage.setItem('token', token);
      
      // Fetch provider type if user is a provider
      if (user.role && (user.role === 'PROVIDER' || user.role === 'PENDING_PROVIDER') && !user.providerType) {
        try {
          const providerData = await api.get('/providers/type');
          setCurrentUser({
            ...user,
            providerType: providerData.data.providerType
          });
          return {
            ...user,
            providerType: providerData.data.providerType
          };
        } catch (providerErr) {
          console.error('Error fetching provider type:', providerErr);
          setCurrentUser(user);
          return user;
        }
      } else {
        setCurrentUser(user);
        return user;
      }
    } catch (err) {
      console.error('Login error details:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Save token
      localStorage.setItem('token', token);
      
      setCurrentUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/users/profile', userData);
      setCurrentUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get fresh auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    getAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}