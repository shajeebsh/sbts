import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      socketService.connect();
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    socketService.connect();
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await api.register(userData);
    setUser(data.user);
    socketService.connect();
    return data;
  }, []);

  const logout = useCallback(() => {
    api.logout();
    socketService.disconnect();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isParent = user?.role === 'parent';
  const isDriver = user?.role === 'driver';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isParent,
    isDriver,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
