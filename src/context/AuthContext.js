import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clear auth data when window is closed or refreshed
  useEffect(() => {
    const handleTabClose = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    };

    window.addEventListener('beforeunload', handleTabClose);

    // Cleanup function
    return () => {
      window.removeEventListener('beforeunload', handleTabClose);
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', credentials);
      const { user, token } = response.data;

      setUser(user);
      // Store in session storage instead of local storage
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('token', token);

      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
  };

  // Check for existing session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};