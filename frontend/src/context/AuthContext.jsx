import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if token exists on mount and fetch current profile
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      
      if (token) {
        try {
          if (savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAdmin(savedIsAdmin);
          }
          // Fetch fresh profile details from the respective endpoint
          if (savedIsAdmin) {
            const response = await api.get('/auth/admin/me');
            setUser(response.data);
            setIsAdmin(true);
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setIsAdmin(false);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error("Failed to load profile on start:", error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen to global logout event dispatched by Axios interceptor
    const handleGlobalLogout = () => {
      setUser(null);
      setIsAdmin(false);
    };
    window.addEventListener('auth-logout', handleGlobalLogout);

    return () => {
      window.removeEventListener('auth-logout', handleGlobalLogout);
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAdmin', 'false');
      setUser(userData);
      setIsAdmin(false);
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/admin/login', { email, password });
      const { access_token, admin: adminData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(adminData));
      localStorage.setItem('isAdmin', 'true');
      setUser(adminData);
      setIsAdmin(true);
      return adminData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName, email, password) => {
    setLoading(true);
    try {
      await api.post('/auth/register', {
        full_name: fullName,
        email,
        password
      });
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
