/**
 * Custom hook để quản lý logic đăng nhập
 */

import { useState } from "react";
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

  const signIn = async (signInData: SignInRequest): Promise<SignInResponse | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await signInUser(signInData);
      setData(response);
      
      // Lưu token vào localStorage
      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem("user", JSON.stringify({
          userId: response.userId,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        }));
      }
      
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

