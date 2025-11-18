import apiClient from "@/lib/apiClient";
import { AxiosError } from "axios";
import type { MessageResponse, ApiErrorResponse } from "@/types/auth.types";

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export const changePassword = async (
    data: ChangePasswordRequest
): Promise<MessageResponse> => {
    try {
        const res = await apiClient.post<MessageResponse>("/auth/change-password", data);
        return res.data;
    } catch (error) {
        if (error instanceof AxiosError) {
            throw {
                message: error.response?.data?.message || "Đổi mật khẩu thất bại",
                status: error.response?.status,
                errors: error.response?.data?.errors,
            } as ApiErrorResponse;
        }
        throw {
            message: "Không thể kết nối đến máy chủ",
        } as ApiErrorResponse;
    }
};
