/**
 * Service xử lý đăng ký tài khoản
 */

import apiClient from "@/lib/apiClient";
import type { RegisterRequest, RegisterResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Đăng ký tài khoản mới
 * @param data - Thông tin đăng ký
 * @returns Promise chứa thông tin người dùng đã đăng ký
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>("/api/auth/register", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Đăng ký thất bại",
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

