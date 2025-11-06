/**
 * Service xử lý đặt lại mật khẩu
 */

import apiClient from "@/lib/apiClient";
import type { ResetPasswordRequest, MessageResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Đặt lại mật khẩu bằng token
 * @param data - Token và mật khẩu mới
 * @returns Promise chứa message response
 */
export const resetPassword = async (data: ResetPasswordRequest): Promise<MessageResponse> => {
  try {
    const response = await apiClient.post<MessageResponse>("/auth/reset-password", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Đặt lại mật khẩu thất bại",
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

/**
 * Validate token reset password
 * @param token - Token cần validate
 * @returns Promise<boolean> - true nếu token hợp lệ
 */
export const validateResetToken = async (token: string): Promise<boolean> => {
  try {
    // Gửi request với token và password giả để kiểm tra token
    // Server sẽ trả về lỗi nếu token không hợp lệ
    await apiClient.post<MessageResponse>("/auth/validate-reset-token", { token });
    return true;
  } catch (error: unknown) {
    return false;
  }
};

