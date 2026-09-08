'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, AuthResponseData, LoginPayload, SignupPayload, User } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = AuthService.getStoredToken();
      const storedUser = AuthService.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
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

  const logout = () => {
    AuthService.clearSession();
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
