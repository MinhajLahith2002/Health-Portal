"use client";

import { createContext, useEffect, useState } from "react";
import { authService, type LoginPayload } from "@/services/auth.service";
import {
  clearAuthData,
  getStoredUser,
  getToken,
  saveAuthData,
  type AuthUser,
} from "@/lib/auth";
import type { UserRole } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setToken(getToken());
      setUser(getStoredUser());
      setIsLoading(false);
    });
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    const authenticatedUser: AuthUser = {
      id: response.id,
      fullName: response.fullName,
      email: response.email,
      role: response.role,
    };

    saveAuthData(response.token, authenticatedUser);
    setToken(response.token);
    setUser(authenticatedUser);
    return authenticatedUser;
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) {
      return false;
    }

    return Array.isArray(role) ? role.includes(user.role) : user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
