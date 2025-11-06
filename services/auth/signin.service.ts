/**
 * Service xử lý đăng nhập
 */

import apiClient from "@/lib/apiClient";
import type { SignInRequest, SignInResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Đăng nhập vào hệ thống
 * @param data - Thông tin đăng nhập (email, password)
 * @returns Promise chứa thông tin người dùng và token
 */
export const signInUser = async (data: SignInRequest): Promise<SignInResponse> => {
  try {
    const response = await apiClient.post<SignInResponse>("/auth/signin", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Đăng nhập thất bại",
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

