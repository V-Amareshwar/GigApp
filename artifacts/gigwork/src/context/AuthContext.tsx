import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { setAuthTokenGetter } from "@workspace/api-client-react/custom-fetch";
import { useGetMe, UserProfile } from "@workspace/api-client-react";

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("gigwork_token");
  });
  
  const [_, setLocation] = useLocation();

  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("gigwork_token"));
  }, []);

  const { data: user, isLoading: isUserLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  useEffect(() => {
    if (isError) {
      // Invalid token
      localStorage.removeItem("gigwork_token");
      setToken(null);
      setLocation("/login");
    }
  }, [isError, setLocation]);

  const login = (newToken: string, newUser: UserProfile) => {
    localStorage.setItem("gigwork_token", newToken);
    setToken(newToken);
    if (newUser.current_role === 'seeker') {
      setLocation("/jobs");
    } else {
      setLocation("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("gigwork_token");
    setToken(null);
    setLocation("/login");
  };

  const isLoading = !!token && isUserLoading;

  return (
    <AuthContext.Provider value={{ token, user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
