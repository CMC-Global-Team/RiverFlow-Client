/**
 * Custom hook để quản lý logic đăng nhập bằng Google
 */

"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";
import { googleLogin } from "@/services/auth/google-login.service";
import type { GoogleLoginResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseGoogleSignInResult {
  signInWithGoogle: (credential: string) => Promise<GoogleLoginResponse | null>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
  data: GoogleLoginResponse | null;
  clearError: () => void;
}

/**
 * Hook xử lý đăng nhập người dùng bằng Google
 * @returns Object chứa hàm signInWithGoogle và các state liên quan
 */
export const useGoogleSignIn = (): UseGoogleSignInResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [data, setData] = useState<GoogleLoginResponse | null>(null);
  const { login } = useAuth();

  const signInWithGoogle = async (credential: string): Promise<GoogleLoginResponse | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await googleLogin({ credential });
      setData(response);
      
      // Chuyển đổi GoogleLoginResponse thành SignInResponse format để tương thích với AuthContext
      const signInResponse = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenType: response.tokenType,
        expiresIn: response.expiresIn,
        userId: response.userId,
        email: response.email,
        fullName: response.fullName,
        role: response.role,
      };
      
      // Sử dụng AuthContext để lưu trạng thái đăng nhập
      login(signInResponse);
      
      return response;
    } catch (err) {
      const apiError = err as ApiErrorResponse;
      setError(apiError);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
    data,
    clearError,
  };
};



