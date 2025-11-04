/**
 * Custom hook để quản lý logic đăng ký tài khoản
 */

import { useState } from "react";
import { registerUser } from "@/services/auth/register.service";
import type { RegisterRequest, RegisterResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseRegisterResult {
  register: (data: RegisterRequest) => Promise<RegisterResponse | null>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
  data: RegisterResponse | null;
  clearError: () => void;
}

/**
 * Hook xử lý đăng ký người dùng
 * @returns Object chứa hàm register và các state liên quan
 */
export const useRegister = (): UseRegisterResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [data, setData] = useState<RegisterResponse | null>(null);

  const register = async (registerData: RegisterRequest): Promise<RegisterResponse | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await registerUser(registerData);
      setData(response);
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
    register,
    isLoading,
    error,
    data,
    clearError,
  };
};

