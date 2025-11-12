/**
 * Service xử lý cập nhật thông tin người dùng
 */

import apiClient from "@/lib/apiClient";
import type { UpdateUserRequest, UserResponse, ApiErrorResponse } from "@/types/user.types";
import { AxiosError } from "axios";

/**
 * Lấy thông tin người dùng
 * @returns Promise chứa thông tin người dùng
 */
export const getUserProfile = async (): Promise<UserResponse> => {
  try {
    // Backend endpoint: GET /api/user/profile
    // Client baseURL already includes /api, so use /user/profile
    const response = await apiClient.get<UserResponse>("/user/profile");
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Không thể lấy thông tin người dùng",
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
 * Cập nhật thông tin người dùng
 * @param data - Thông tin cập nhật
 * @returns Promise chứa thông tin người dùng đã cập nhật
 */
export const updateUserProfile = async (data: UpdateUserRequest): Promise<UserResponse> => {
  try {
    // Backend endpoint: PUT /api/user/profile
    // Client baseURL already includes /api, so use /user/profile
    const response = await apiClient.put<UserResponse>("/user/profile", data);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Cập nhật thông tin thất bại",
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

