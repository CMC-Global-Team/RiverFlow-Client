/**
 * Custom hook để quản lý logic quên mật khẩu
 */

import { useState } from "react";
import { forgotPassword } from "@/services/auth/forgot-password.service";
import type { ForgotPasswordRequest, MessageResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseForgotPasswordResult {
  sendResetLink: (data: ForgotPasswordRequest) => Promise<MessageResponse | null>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
  data: MessageResponse | null;
  clearError: () => void;
  reset: () => void;
}

/**
 * Hook xử lý quên mật khẩu
 * @returns Object chứa hàm sendResetLink và các state liên quan
 */
export const useForgotPassword = (): UseForgotPasswordResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [data, setData] = useState<MessageResponse | null>(null);

  const sendResetLink = async (forgotPasswordData: ForgotPasswordRequest): Promise<MessageResponse | null> => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await forgotPassword(forgotPasswordData);
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

  const reset = () => {
    setError(null);
    setData(null);
    setIsLoading(false);
  };

  return {
    sendResetLink,
    isLoading,
    error,
    data,
    clearError,
    reset,
  };
};

