/**
 * Service xử lý đăng nhập bằng Google
 */

import apiClient from "@/lib/apiClient";
import type { GoogleLoginRequest, GoogleLoginResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Đăng nhập vào hệ thống bằng Google
 * @param data - Thông tin đăng nhập Google (credential - Google ID token)
 * @returns Promise chứa thông tin người dùng và token
 */
export const googleLogin = async (data: GoogleLoginRequest): Promise<GoogleLoginResponse> => {
  try {
    // Note: Endpoint follows user specification. Backend should implement /api/auth/google
    const response = await apiClient.post<GoogleLoginResponse>("/api/auth/google", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Đăng nhập bằng Google thất bại",
        status: error.response?.status,
        errors: error.response?.data?.errors,
      };
      throw apiError;
    }
    throw {
      message: "Không thể kết nối đến máy chủ",
    } as ApiErrorResponse;
  }
};

