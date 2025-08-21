import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import notesApi from '../api/notesApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for a token in localStorage on initial load and validate it
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify the token is still valid by making an API call
          const response = await notesApi.get('/api/auth/me');
          setUser(response.data.user);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const registerUser = async (userData) => {
    try {
      const response = await notesApi.post('/api/auth/register', userData);
      // After successful registration, navigate to login page
      navigate('/login');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const loginUser = async (credentials) => {
    try {
      const response = await notesApi.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      setIsLoggedIn(true);
      navigate('/');
      return response.data;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      user, 
      loading,
      loginUser, 
      registerUser, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);