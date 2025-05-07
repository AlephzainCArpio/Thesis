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

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          // Set the token on API calls
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch current user
          const response = await api.get('/api/auth/me');
          setCurrentUser(response.data);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        // Clear token if validation fails
        localStorage.removeItem('token');
        api.defaults.headers.common['Authorization'] = null;
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
      
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Save token and set headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(user); // Ensure the user object is set
      console.log('User after login:', user); // Debug log
      return user;
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
      
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      // Save token and set headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
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
    api.defaults.headers.common['Authorization'] = null;
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

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
