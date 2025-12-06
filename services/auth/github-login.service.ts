/**
 * Service xử lý đăng nhập bằng GitHub
 */

import apiClient from "@/lib/apiClient";
import type { GitHubLoginRequest, GitHubLoginResponse, ApiErrorResponse } from "@/types/auth.types";
import { AxiosError } from "axios";

/**
 * Đăng nhập vào hệ thống bằng GitHub
 * @param data - Thông tin đăng nhập GitHub (code - GitHub OAuth authorization code)
 * @returns Promise chứa thông tin người dùng và token
 */
export const githubLogin = async (data: GitHubLoginRequest): Promise<GitHubLoginResponse> => {
    try {
        // Note: Base URL already includes /api, so endpoint should not have /api prefix
        const response = await apiClient.post<GitHubLoginResponse>("/auth/github", data);
        return response.data;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const apiError: ApiErrorResponse = {
                message: error.response?.data?.message || "Đăng nhập bằng GitHub thất bại",
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
