import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch {
          authService.logout();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    const currentUser = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
    };
    setUser(currentUser);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    const currentUser = {
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
    };
    setUser(currentUser);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
