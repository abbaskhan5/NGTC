import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchDemoRole: (roleCode: string) => Promise<void>;
  logout: () => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ngtc_token'));
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('ngtc_token');
    if (!savedToken) {
      // Default to logging in as Super Admin demo user on first visit if no token exists!
      try {
        const res = await api.login({ email: 'admin@ngtc.sa', password: 'password123' });
        localStorage.setItem('ngtc_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setPermissions(res.permissions);
      } catch (e) {
        console.warn('Initial demo login fallback notice:', e);
      }
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      setPermissions(res.permissions);
    } catch (err) {
      console.error('Session restore failed, re-authenticating:', err);
      try {
        const res = await api.login({ email: 'admin@ngtc.sa', password: 'password123' });
        localStorage.setItem('ngtc_token', res.token);
        setToken(res.token);
        setUser(res.user);
        setPermissions(res.permissions);
      } catch (fallbackErr) {
        localStorage.removeItem('ngtc_token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('ngtc_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPermissions(res.permissions);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (roleCode: string) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemo(roleCode);
      localStorage.setItem('ngtc_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPermissions(res.permissions);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ngtc_token');
    setToken(null);
    setUser(null);
    setPermissions([]);
  };

  const can = (permissionRequired: string): boolean => {
    if (!user) return false;
    if (permissions.includes('*')) return true;
    if (permissions.includes(permissionRequired)) return true;
    const [res] = permissionRequired.split('.');
    if (permissions.includes(`${res}.*`)) return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        permissions,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        switchDemoRole,
        logout,
        can,
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
