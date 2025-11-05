/**
 * Custom hook để quản lý logic đăng xuất
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { logoutUser } from "@/services/auth/logout.service";
import type { ApiErrorResponse } from "@/types/auth.types";

interface UseLogoutResult {
  logout: () => Promise<void>;
  isLoading: boolean;
  error: ApiErrorResponse | null;
}

/**
 * Hook xử lý đăng xuất người dùng
 * @returns Object chứa hàm logout và các state liên quan
 */
export const useLogout = (): UseLogoutResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const { logout: authLogout } = useAuth();
  const router = useRouter();

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Gọi API logout (optional - có thể skip nếu backend không yêu cầu)
      await logoutUser();
    } catch (err) {
      // Log error nhưng vẫn tiếp tục logout ở client side
      // Backend có thể chưa implement logout endpoint hoặc không yêu cầu
      console.warn("Logout API call failed (continuing with client-side logout):", err);
      // Không set error vì logout vẫn thành công ở client side
    } finally {
      // Clear auth state
      authLogout();
      
      setIsLoading(false);
      
      // Redirect về trang chủ
      router.push("/");
    }
  };

  return {
    logout,
    isLoading,
    error,
  };
};

