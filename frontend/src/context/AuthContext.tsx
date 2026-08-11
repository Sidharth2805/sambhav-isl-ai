import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export interface AccessibilityProfileDto {
  preferredLanguage?: string;
  preferredSignLanguage?: string;
  textSizePreference?: string;
  highContrastPreference?: boolean;
  communicationPreference?: string;
  accessibilityNeeds?: string[];
}

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'COMMON_USER' | 'ACCESSIBILITY_USER' | 'ADMIN';
  enabled: boolean;
  profile?: AccessibilityProfileDto;
}

interface AuthContextType {
  user: UserResponseDto | null;
  accessToken: string | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (payload: any) => Promise<any>;
  updateUserProfile: (profilePayload: AccessibilityProfileDto) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Attempt token refresh on app mount (browser refresh restore)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const refreshData = await apiRequest('/api/auth/refresh', 'POST');
        if (refreshData && refreshData.accessToken) {
          const freshToken = refreshData.accessToken;
          setAccessToken(freshToken);

          // Get user details
          const userData = await apiRequest('/api/auth/me', 'GET', null, freshToken);
          setUser(userData);
        }
      } catch (err) {
        // Safe to ignore on startup; user is simply unauthenticated
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    // 1. Authenticate user credentials
    const loginData = await apiRequest('/api/auth/login', 'POST', { email, password });
    const token = loginData.accessToken;
    setAccessToken(token);

    // 2. Fetch authenticated user record
    const userData = await apiRequest('/api/auth/me', 'GET', null, token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', 'POST', null, accessToken);
    } catch (err) {
      // Proceed with state clearance regardless of network outcome
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  const registerUser = async (payload: any) => {
    // Register details. Returns 201 Created but does NOT auto-login.
    return await apiRequest('/api/auth/register', 'POST', payload);
  };

  const updateUserProfile = async (profilePayload: AccessibilityProfileDto) => {
    if (!accessToken) return;
    const updatedProfile = await apiRequest('/api/profile', 'PUT', profilePayload, accessToken);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        profile: updatedProfile,
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        initializing,
        login,
        logout,
        registerUser,
        updateUserProfile,
      }}
    >
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
export default AuthContext;
