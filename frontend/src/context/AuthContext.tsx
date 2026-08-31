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
  avatarUrl?: string;
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
  updateUserName: (name: string) => Promise<void>;
  updateUserAvatar: (avatarUrl: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponseDto | null>(() => {
    try {
      const saved = localStorage.getItem('sambhav_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('sambhav_access_token') || null;
  });
  // If we already have a cached user/token in localStorage, we aren't blocked on initialization
  const [initializing, setInitializing] = useState<boolean>(() => {
    return !localStorage.getItem('sambhav_access_token') && !localStorage.getItem('sambhav_auth_user');
  });

  // Helper to load stored custom avatar
  const getStoredAvatar = (userIdOrEmail?: string) => {
    if (!userIdOrEmail) return localStorage.getItem('sambhav_current_avatar') || '';
    return localStorage.getItem(`sambhav_avatar_${userIdOrEmail}`) || localStorage.getItem('sambhav_current_avatar') || '';
  };

  // Helper to sync user state and localStorage
  const persistSession = (token: string, userData: UserResponseDto) => {
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem('sambhav_access_token', token);
    localStorage.setItem('sambhav_auth_user', JSON.stringify(userData));
  };

  const clearSession = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('sambhav_access_token');
    localStorage.removeItem('sambhav_auth_user');
    localStorage.removeItem('sambhav_saved_translations');
  };

  // Attempt token refresh and verification on app mount (browser refresh restore)
  useEffect(() => {
    const restoreSession = async () => {
      const existingToken = localStorage.getItem('sambhav_access_token');
      
      // 1. If we have a cached token, verify it with /api/auth/me first
      if (existingToken) {
        try {
          const userData = await apiRequest('/api/auth/me', 'GET', null, existingToken, 10000);
          if (userData && userData.id) {
            const savedAvatar = getStoredAvatar(userData?.email || userData?.id);
            const userWithAvatar = { ...userData, avatarUrl: savedAvatar };
            persistSession(existingToken, userWithAvatar);
            setInitializing(false);
            return;
          }
        } catch (meErr: any) {
          // If token expired or invalid, fall through to refresh flow
          console.warn('[SignBridge Auth] Token verification failed, trying refresh...', meErr);
        }
      }

      // 2. Refresh flow via HttpOnly cookie
      const maxAttempts = 2;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const refreshData = await apiRequest('/api/auth/refresh', 'POST', null, null, 30000);
          if (refreshData && refreshData.accessToken) {
            const freshToken = refreshData.accessToken;
            const userData = await apiRequest('/api/auth/me', 'GET', null, freshToken, 15000);
            const savedAvatar = getStoredAvatar(userData?.email || userData?.id);
            const userWithAvatar = { ...userData, avatarUrl: savedAvatar };
            persistSession(freshToken, userWithAvatar);
            setInitializing(false);
            return;
          }
        } catch (err: any) {
          // If 401/403 explicit unauthorized, token is dead
          if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      // If session verification and refresh both failed, purge dead session so user gets clean login
      clearSession();
      setInitializing(false);
    };
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    // 1. Authenticate user credentials
    const loginData = await apiRequest('/api/auth/login', 'POST', { email, password });
    const token = loginData.accessToken;

    // 2. Fetch authenticated user record
    const userData = await apiRequest('/api/auth/me', 'GET', null, token);
    const savedAvatar = getStoredAvatar(userData?.email || userData?.id);
    const userWithAvatar = {
      ...userData,
      avatarUrl: savedAvatar,
    };
    persistSession(token, userWithAvatar);
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', 'POST', null, accessToken);
    } catch (err) {
      // Proceed with state clearance regardless of network outcome
    } finally {
      clearSession();
    }
  };

  const registerUser = async (payload: any) => {
    // Register details. Returns 201 Created but does NOT auto-login.
    return await apiRequest('/api/auth/register', 'POST', payload);
  };

  const updateUserName = async (newName: string) => {
    if (!accessToken || !user) return;
    const updatedUser = await apiRequest('/api/auth/name', 'PUT', { name: newName }, accessToken);
    setUser((prev) => {
      if (!prev) return null;
      const next = {
        ...prev,
        name: updatedUser.name || newName,
      };
      localStorage.setItem('sambhav_auth_user', JSON.stringify(next));
      return next;
    });
  };

  const updateUserAvatar = async (avatarUrl: string) => {
    if (!user) return;
    localStorage.setItem(`sambhav_avatar_${user.email}`, avatarUrl);
    localStorage.setItem(`sambhav_avatar_${user.id}`, avatarUrl);
    localStorage.setItem('sambhav_current_avatar', avatarUrl);
    setUser((prev) => {
      if (!prev) return null;
      const next = {
        ...prev,
        avatarUrl,
      };
      localStorage.setItem('sambhav_auth_user', JSON.stringify(next));
      return next;
    });
  };

  const updateUserProfile = async (profilePayload: AccessibilityProfileDto) => {
    let updatedProfile = profilePayload;
    if (accessToken) {
      try {
        const res = await apiRequest('/api/profile', 'PUT', profilePayload, accessToken);
        if (res) updatedProfile = res;
      } catch (err) {
        console.warn('Backend profile sync notice (saved locally):', err);
      }
    }
    setUser((prev) => {
      if (!prev) return null;
      const next = {
        ...prev,
        profile: {
          ...(prev.profile || {}),
          ...updatedProfile,
        },
      };
      localStorage.setItem('sambhav_auth_user', JSON.stringify(next));
      return next;
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
        updateUserName,
        updateUserAvatar,
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
