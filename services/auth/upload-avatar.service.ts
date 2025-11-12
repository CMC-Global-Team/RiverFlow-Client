/**
 * Service xử lý upload avatar
 */

import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";

export interface UploadAvatarResponse {
  url: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
}

/**
 * Upload avatar image
 * @param file - File object to upload
 * @returns Promise chứa URL của avatar đã upload
 */
export const uploadAvatar = async (file: File): Promise<UploadAvatarResponse> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadAvatarResponse>("/user/avatar/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const apiError: ApiErrorResponse = error.response?.data || { error: "Upload avatar thất bại" };
      throw new Error(apiError.error || "Upload avatar thất bại");
    }
    throw new Error("Không thể kết nối đến máy chủ");
  }
};

