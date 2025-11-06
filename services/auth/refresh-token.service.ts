/**
 * Service xử lý refresh token
 */

import axios from "axios";
import type { ApiErrorResponse } from "@/types/auth.types";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

/**
 * Refresh access token bằng refresh token
 * @param refreshToken - Refresh token hiện tại
 * @returns Promise chứa token mới
 */
export const refreshAccessToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const apiError: ApiErrorResponse = {
        message: error.response?.data?.message || "Không thể làm mới token",
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

