/**
 * Service xử lý quên mật khẩu
 */

import apiClient from "@/lib/apiClient";
import type { ForgotPasswordRequest, MessageResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Gửi yêu cầu đặt lại mật khẩu
 * @param data - Email để nhận link đặt lại mật khẩu
 * @returns Promise chứa message response
 */
export const forgotPassword = async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
  try {
    const response = await apiClient.post<MessageResponse>("/api/auth/forgot-password", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Gửi yêu cầu thất bại",
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

