/**
 * Hook xử lý đặt lại mật khẩu
 */

import { useState } from "react";
import { resetPassword } from "@/services/auth/reset-password.service";
import type { ResetPasswordRequest, MessageResponse, ApiErrorResponse } from "@/types/auth.types";

interface UseResetPasswordReturn {
  resetUserPassword: (data: ResetPasswordRequest) => Promise<void>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
  data: MessageResponse | null;
  clearError: () => void;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const [data, setData] = useState<MessageResponse | null>(null);

  const resetUserPassword = async (requestData: ResetPasswordRequest) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await resetPassword(requestData);
      setData(response);
    } catch (err) {
      setError(err as ApiErrorResponse);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    resetUserPassword,
    isLoading,
    error,
    data,
    clearError,
  };
};

