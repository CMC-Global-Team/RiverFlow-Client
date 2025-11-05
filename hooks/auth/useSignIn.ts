/**
 * Custom hook để quản lý logic đăng nhập
 */

"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";
import { signInUser } from "@/services/auth/signin.service";
import type { SignInRequest, SignInResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseSignInResult {
  signIn: (data: SignInRequest) => Promise<SignInResponse | null>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
  data: SignInResponse | null;
  clearError: () => void;
}

/**
 * Hook xử lý đăng nhập người dùng
 * @returns Object chứa hàm signIn và các state liên quan
 */
export const useSignIn = (): UseSignInResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [data, setData] = useState<SignInResponse | null>(null);
  const { login } = useAuth();

  const signIn = async (signInData: SignInRequest): Promise<SignInResponse | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await signInUser(signInData);
      setData(response);
      
      // Sử dụng AuthContext để lưu trạng thái đăng nhập
      login(response);
      
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
    signIn,
    isLoading,
    error,
    data,
    clearError,
  };
};

