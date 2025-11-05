/**
 * Service xử lý đăng xuất
 */

import apiClient from "@/lib/apiClient";
import type { MessageResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Đăng xuất khỏi hệ thống
 * @returns Promise chứa message response
 */
export const logoutUser = async (): Promise<MessageResponse> => {
  try {
    const response = await apiClient.post<MessageResponse>("/api/auth/logout");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Đăng xuất thất bại",
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

