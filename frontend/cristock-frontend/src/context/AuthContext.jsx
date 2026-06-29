import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('cse_token');
    const storedUser = localStorage.getItem('cse_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);


  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/trading/portfolio');
      setUser(prev => {
        if (!prev) return prev;
        const updated = { ...prev, walletBalance: Number(data.walletBalance) };
        localStorage.setItem('cse_user', JSON.stringify(updated));
        return updated;
      });
    } catch (_) {
      
    }
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      const userData = {
        userId: data.userId,
        name: data.fullName,
        email: data.email,
        role: data.role,
        walletBalance: 100000, 
      };
      localStorage.setItem('cse_token', data.token);
      localStorage.setItem('cse_user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await api.post('/auth/register', {
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const userData = {
        userId: data.userId,
        name: data.fullName,
        email: data.email,
        role: data.role,
        walletBalance: 100000,
      };
      localStorage.setItem('cse_token', data.token);
      localStorage.setItem('cse_user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('cse_token');
    localStorage.removeItem('cse_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

 
  const updateWalletBalance = (newBalance) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, walletBalance: Number(newBalance) };
      localStorage.setItem('cse_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated,
      login, register, logout,
      refreshUser, updateWalletBalance,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);