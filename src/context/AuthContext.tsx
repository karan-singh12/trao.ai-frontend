'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthResponseData, LoginPayload, SignupPayload, User } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage and verify session with backend
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = AuthService.getStoredToken();
        const storedUser = AuthService.getStoredUser();

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) setUser(storedUser);

          // Verify with backend to ensure session is not expired or revoked
          try {
            const data = await AuthService.getMe();
            setUser(data.user);
          } catch (err: any) {
            // If token expired or invalid (401), wipe stale session
            if (err?.statusCode === 401 || err?.status === 401) {
              AuthService.clearSession();
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (e) {
        console.error('Failed to restore auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginPayload): Promise<AuthResponseData> => {
    const data = await AuthService.login(credentials);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const signup = async (credentials: SignupPayload): Promise<AuthResponseData> => {
    const data = await AuthService.signup(credentials);
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setToken(null);
  };


  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
