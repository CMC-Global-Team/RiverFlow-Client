/**
 * AuthContext - Context quản lý trạng thái authentication
 */

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { SignInResponse } from "@/types/auth.types";
import { setCookie, deleteCookie, clearAllCookies } from "@/lib/cookies";

// User info type
export interface User {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  credit: number;
  avatar?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: SignInResponse) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Component bao bọc app để cung cấp auth state
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi tạo auth state từ localStorage khi app load
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem("accessToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setAccessToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Set cookie cho middleware
          setCookie("accessToken", storedToken, 7);
        }
      } catch (error) {
        console.error("Error loading auth state:", error);
        // Nếu có lỗi, clear storage
        localStorage.clear();
        clearAllCookies();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Hàm đăng nhập - lưu thông tin user và token
  const login = (authData: SignInResponse) => {
    const userData: User = {
      userId: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role,
      credit: authData.credit,
      avatar: authData.avatar,
    };

    // Lưu vào state
    setUser(userData);
    setAccessToken(authData.accessToken);

    // Lưu vào localStorage
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Lưu vào cookie cho middleware (7 ngày)
    setCookie("accessToken", authData.accessToken, 7);
  };

  // Hàm đăng xuất - xóa tất cả thông tin
  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.clear();
    
    // Xóa cookie
    deleteCookie("accessToken");
  };

  // Hàm cập nhật thông tin user
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook để sử dụng AuthContext
 * @throws Error nếu sử dụng ngoài AuthProvider
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  
  return context;
};

