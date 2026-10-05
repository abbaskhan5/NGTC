import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'EMPLOYEE' | string;
  roleCode?: string;
  roleName: string;
  status: string;
  employeeId?: string;
  phone?: string;
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  avatarUrl?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isEmployee: boolean;
  login: (email: string, password: string) => Promise<void>;
  switchDemoRole: (roleCode: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ngtc_token'));
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('ngtc_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
      setPermissions(res.permissions || []);
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      localStorage.removeItem('ngtc_token');
      localStorage.removeItem('ngtc_refresh_token');
      setToken(null);
      setUser(null);
      setPermissions([]);
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
      const authToken = res.accessToken || res.token;
      localStorage.setItem('ngtc_token', authToken);
      if (res.refreshToken) {
        localStorage.setItem('ngtc_refresh_token', res.refreshToken);
      }
      setToken(authToken);
      setUser(res.user);
      setPermissions(res.permissions || []);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (roleCode: string) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemo(roleCode);
      const authToken = res.accessToken || res.token;
      localStorage.setItem('ngtc_token', authToken);
      if (res.refreshToken) {
        localStorage.setItem('ngtc_refresh_token', res.refreshToken);
      }
      setToken(authToken);
      setUser(res.user);
      setPermissions(res.permissions || []);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('ngtc_token');
      localStorage.removeItem('ngtc_refresh_token');
      setToken(null);
      setUser(null);
      setPermissions([]);
    }
  };

  const isSuperAdmin = Boolean(
    user &&
      (user.role === 'SUPER_ADMIN' ||
        user.roleCode === 'SUPER_ADMIN' ||
        user.roleName === 'Super Admin' ||
        permissions.includes('*'))
  );

  const isEmployee = Boolean(
    user && (user.role === 'EMPLOYEE' || user.roleCode === 'EMPLOYEE' || (!isSuperAdmin && user.roleName?.includes('Employee')))
  );

  const can = (permissionRequired: string): boolean => {
    if (!user) return false;
    // Super Admin has unrestricted complete control
    if (isSuperAdmin) return true;
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
        isSuperAdmin,
        isEmployee,
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
